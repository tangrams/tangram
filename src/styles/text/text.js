// Text rendering style

import Geo from '../../geo';
import {Style} from '../style';
import {Points} from '../points/points';
import Collision from '../../labels/collision';
import LabelPoint from '../../labels/label_point';
import LabelLine from '../../labels/label_line';
import gl from '../../gl/constants'; // web workers don't have access to GL context, so import all GL constants

export let TextStyle = Object.create(Points);

Object.assign(TextStyle, {
    name: 'text',
    super: Points,
    built_in: true,

    init(options = {}) {
        let extra_attributes = [
            { name: 'a_angles', size: 4, type: gl.SHORT, normalized: false },
            { name: 'a_offsets', size: 4, type: gl.UNSIGNED_SHORT, normalized: false },
            { name: 'a_pre_angles', size: 4, type: gl.BYTE, normalized: false }
        ];

        this.super.init.call(this, options, extra_attributes);

        // Point style (parent class) requires texturing to be turned on
        // (labels are always drawn with textures)
        this.defines.TANGRAM_POINT_TEXTURE = true;

        // Indicate vertex shader should apply zoom-interpolated offsets and angles for curved labels
        this.defines.TANGRAM_CURVED_LABEL = true;

        // Disable dual point/text mode
        this.defines.TANGRAM_MULTI_SAMPLER = false;

        // Manually un-multiply alpha, because Canvas text rasterization is pre-multiplied
        this.defines.TANGRAM_UNMULTIPLY_ALPHA = true;

        // Fade out text when tile is zooming out, e.g. acting as proxy tiles
        this.defines.TANGRAM_FADE_ON_ZOOM_OUT = true;
        this.defines.TANGRAM_FADE_ON_ZOOM_OUT_RATE = 2; // fade at 2x, e.g. fully transparent at 0.5 zoom level away

        // Used to fade out curved labels
        this.defines.TANGRAM_FADE_ON_ZOOM_IN = true;
        this.defines.TANGRAM_FADE_ON_ZOOM_IN_RATE = 2; // fade at 2x, e.g. fully transparent at 0.5 zoom level away

        this.reset();
    },

    /**
     * A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
     * A plain JS array matching the order of the vertex layout.
     */
    makeVertexTemplate(style){
        this.super.makeVertexTemplate.call(this, style);

        this.fillVertexTemplate('a_pre_angles', 0, { size: 4 });
        this.fillVertexTemplate('a_offsets', 0, { size: 4 });
        this.fillVertexTemplate('a_angles', 0, { size: 4 });

        return this.vertex_template;
    },

    reset() {
        this.queues = {};
        this.resetText();
    },

    // Override to queue features instead of processing immediately
    addFeature (feature, draw, context) {
        let tile = context.tile;
        if (tile.generation !== this.generation) {
            return;
        }

        // Called here because otherwise it will be delayed until the feature queue is parsed,
        // and we want the preprocessing done before we evaluate text style below
        draw = this.preprocess(draw);
        if (!draw) {
            return;
        }

        let type = feature.geometry.type;
        draw.can_articulate = (type === "LineString" || type === "MultiLineString");

        // supersample text rendering for angled labels, to improve clarity
        draw.supersample_text = (type === "LineString" || type === "MultiLineString");

        let q = this.parseTextFeature(feature, draw, context, tile);
        if (!q) {
            return;
        }

        // text can be an array if a `left` or `right` orientation key is defined for the text source
        // in which case, push both text sources to the queue
        if (q instanceof Array){
            q.forEach(function(q){
                q.feature = feature;
                q.context = context;
                q.layout.vertex = false; // vertex placement option not applicable to standalone labels

                // Queue the feature for processing
                if (!this.tile_data[tile.key]) {
                    this.startData(tile);
                }
                this.queues[tile.key].push(q);
            }.bind(this));
        }
        else {
            q.feature = feature;
            q.context = context;
            q.layout.vertex = false; // vertex placement option not applicable to standalone labels

            // Queue the feature for processing
            if (!this.tile_data[tile.key]) {
                this.startData(tile);
            }
            this.queues[tile.key].push(q);
        }

        // Register with collision manager
        Collision.addStyle(this.name, tile.key);
    },

    // Override
    startData (tile) {
        this.queues[tile.key] = [];
        return Style.startData.call(this, tile);
    },

    // Override
    endData (tile) {
        return this.prepareTextLabels(tile, this.name, this.queues[tile.key]).
            then(labels => this.collideAndRenderTextLabels(tile, this.name, labels)).
            then(({ labels, texts, texture }) => {
                if (texts) {
                    this.texts[tile.key] = texts;

                    // Build queued features
                    labels.forEach(q => {
                        let text_settings_key = q.text_settings_key;
                        let text_info =
                            this.texts[tile.key][text_settings_key] &&
                            this.texts[tile.key][text_settings_key][q.text];

                        // setup styling object expected by Style class
                        let style = this.feature_style;
                        style.label = q.label;

                        if (text_info.text_settings.can_articulate){
                            // unpack logical sizes of each segment into an array for the style
                            style.size = {};
                            style.texcoords = {};

                            if (q.label.type === 'straight'){
                                style.size.straight = text_info.total_size.logical_size;
                                style.texcoords.straight = text_info.texcoords.straight;
                            }
                            else{
                                style.size.curved = text_info.size.map(function(size){ return size.logical_size; });
                                style.texcoords_stroke = text_info.texcoords_stroke;
                                style.texcoords.curved = text_info.texcoords.curved;
                            }
                        }
                        else {
                            style.size = text_info.size.logical_size;
                            style.texcoords = text_info.align[q.label.align].texcoords;
                        }

                        Style.addFeature.call(this, q.feature, q.draw, q.context);
                    });
                }
                this.freeText(tile);

                // Finish tile mesh
                return Style.endData.call(this, tile).then(tile_data => {
                    // Attach tile-specific label atlas to mesh as a texture uniform
                    if (texture && tile_data) {
                        tile_data.uniforms.u_texture = texture;
                        tile_data.textures.push(texture); // assign texture ownership to tile
                        return tile_data;
                    }
                });
            });
    },

    // Sets up caching for draw properties
    _preprocess (draw) {
        return this.preprocessText(draw);
    },

    // Implements label building for TextLabels mixin
    buildTextLabels (tile_key, feature_queue) {
        let labels = [];
        for (let f=0; f < feature_queue.length; f++) {
            let fq = feature_queue[f];
            let text_info = this.texts[tile_key][fq.text_settings_key][fq.text];
            let feature_labels;
            if (text_info.text_settings.can_articulate){
                var sizes = text_info.size.map(function(size){ return size.collision_size; });
                fq.layout.no_curving = text_info.no_curving;
                feature_labels = this.buildLabels(sizes, fq.feature.geometry, fq.layout, text_info.total_size.collision_size);
            }
            else {
                feature_labels = this.buildLabels(text_info.size.collision_size, fq.feature.geometry, fq.layout);
            }
            for (let i = 0; i < feature_labels.length; i++) {
                let fql = Object.create(fq);
                fql.label = feature_labels[i];
                labels.push(fql);
            }
        }
        return labels;
    },

    // Builds one or more labels for a geometry
    buildLabels (size, geometry, layout, total_size) {
        let labels = [];

        if (geometry.type === "LineString") {
            Array.prototype.push.apply(labels, this.buildLineLabels(geometry.coordinates, size, layout, total_size));
        } else if (geometry.type === "MultiLineString") {
            let lines = geometry.coordinates;
            for (let i = 0; i < lines.length; ++i) {
                Array.prototype.push.apply(labels, this.buildLineLabels(lines[i], size, layout, total_size));
            }
        } else if (geometry.type === "Point") {
            labels.push(new LabelPoint(geometry.coordinates, size, layout));
        } else if (geometry.type === "MultiPoint") {
            let points = geometry.coordinates;
            for (let i = 0; i < points.length; ++i) {
                labels.push(new LabelPoint(points[i], size, layout));
            }
        } else if (geometry.type === "Polygon") {
            let centroid = Geo.centroid(geometry.coordinates);
            labels.push(new LabelPoint(centroid, size, layout));
        } else if (geometry.type === "MultiPolygon") {
            let centroid = Geo.multiCentroid(geometry.coordinates);
            labels.push(new LabelPoint(centroid, size, layout));
        }

        return labels;
    },

    // Build one or more labels for a line geometry
    buildLineLabels (line, size, layout, total_size) {
        let labels = [];
        let subdiv = Math.min(layout.subdiv, line.length - 1);
        if (subdiv > 1) {
            // Create multiple labels for line, with each allotted a range of segments
            // in which it will attempt to place
            let seg_per_div = (line.length - 1) / subdiv;
            for (let i = 0; i < subdiv; i++) {
                let start = Math.floor(i * seg_per_div);
                let end = Math.floor((i + 1) * seg_per_div) + 1;
                let line_segment = line.slice(start, end);

                let label = LabelLine.create(size, total_size, line_segment, layout);
                if (label){
                    labels.push(label);
                }
            }
        }
        else {
            let label = LabelLine.create(size, total_size, line, layout);
            if (label){
                labels.push(label);
            }
        }
        return labels;
    }
});

TextStyle.texture_id = 0; // namespaces per-tile label textures
