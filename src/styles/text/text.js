// Text rendering style

import Geo from '../../geo';
import {Style} from '../style';
import {Points} from '../points/points';
import Collision from '../../labels/collision';
import LabelPoint from '../../labels/label_point';
import LabelLine from '../../labels/label_line';

export let TextStyle = Object.create(Points);

Object.assign(TextStyle, {
    name: 'text',
    super: Points,
    built_in: true,
    selection: false, // no feature selection for text by default

    init() {
        this.super.init.apply(this, arguments);

        // Point style (parent class) requires texturing to be turned on
        // (labels are always drawn with textures)
        this.defines.TANGRAM_POINT_TEXTURE = true;

        // Disable dual point/text mode
        this.defines.TANGRAM_MULTI_SAMPLER = false;

        // Manually un-multiply alpha, because Canvas text rasterization is pre-multiplied
        this.defines.TANGRAM_UNMULTIPLY_ALPHA = true;

        // Fade out text when tile is zooming out, e.g. acting as proxy tiles
        this.defines.TANGRAM_FADE_ON_ZOOM_OUT = true;
        this.defines.TANGRAM_FADE_ON_ZOOM_OUT_RATE = 2; // fade at 2x, e.g. fully transparent at 0.5 zoom level away

        this.reset();
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

        let q = this.parseTextFeature(feature, draw, context, tile);
        if (!q) {
            return;
        }

        q.feature = feature;
        q.context = context;
        q.layout.vertex = false; // vertex placement option not applicable to standalone labels

        // Queue the feature for processing
        if (!this.tile_data[tile.key]) {
            this.startData(tile);
        }
        this.queues[tile.key].push(q);

        // Register with collision manager
        Collision.addStyle(this.name, tile.key);
    },

    // Implements label creation for TextLabels mixin
    createTextLabels (tile_key, feature_queue) {
        let labels = [];
        for (let f=0; f < feature_queue.length; f++) {
            let fq = feature_queue[f];
            let text_info = this.texts[tile_key][fq.text_settings_key][fq.text];
            let feature_labels = this.buildLabels(text_info.size.collision_size, fq.feature.geometry, fq.layout);
            for (let i = 0; i < feature_labels.length; i++) {
                let fql = Object.create(fq);
                fql.label = feature_labels[i];
                labels.push(fql);
            }
        }
        return labels;
    },

    // Override
    startData (tile) {
        this.queues[tile.key] = [];
        return Style.startData.call(this, tile);
    },

    // Override
    endData (tile) {
        return this.renderTextLabels(tile, this.name, this.queues[tile.key]).then(({ labels, texts, texture }) => {
            if (texts) {
                this.texts[tile.key] = texts;

                // Build queued features
                labels.forEach(q => {
                    let text_settings_key = q.text_settings_key;
                    let text_info = this.texts[tile.key] && this.texts[tile.key][text_settings_key] && this.texts[tile.key][text_settings_key][q.text];

                    // setup styling object expected by Style class
                    let style = this.feature_style;
                    style.label = q.label;
                    style.size = text_info.size.logical_size;
                    style.angle = q.label.angle || 0;
                    style.texcoords = text_info.texcoords;

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

    // Builds one or more labels for a geometry
    buildLabels (size, geometry, options) {
        let labels = [];

        if (geometry.type === "LineString") {
            this.buildLineLabels(size, geometry.coordinates, options, labels);
        } else if (geometry.type === "MultiLineString") {
            let lines = geometry.coordinates;
            for (let i = 0; i < lines.length; ++i) {
                this.buildLineLabels(size, lines[i], options, labels);
            }
        } else if (geometry.type === "Point") {
            labels.push(new LabelPoint(geometry.coordinates, size, options));
        } else if (geometry.type === "MultiPoint") {
            let points = geometry.coordinates;

            for (let i = 0; i < points.length; ++i) {
                labels.push(new LabelPoint(points[i], size, options));
            }
        } else if (geometry.type === "Polygon") {
            let centroid = Geo.centroid(geometry.coordinates);
            labels.push(new LabelPoint(centroid, size, options));
        } else if (geometry.type === "MultiPolygon") {
            let centroid = Geo.multiCentroid(geometry.coordinates);
            labels.push(new LabelPoint(centroid, size, options));
        }

        return labels;
    },

    // Build one or more labels for a line geometry
    buildLineLabels (size, line, options, labels) {
        let subdiv = Math.min(options.subdiv, line.length - 1);
        if (subdiv > 1) {
            // Create multiple labels for line, with each allotted a range of segments
            // in which it will attempt to place
            let seg_per_div = (line.length - 1) / subdiv;
            for (let i=0; i < subdiv; i++) {
                options.segment_start = Math.floor(i * seg_per_div);
                options.segment_end = Math.floor((i+1) * seg_per_div);
                labels.push(new LabelLine(size, line, options));
            }
            options.segment_start = null;
            options.segment_end = null;
        }
        else {
            labels.push(new LabelLine(size, line, options));
        }
    }

});

TextStyle.texture_id = 0; // namespaces per-tile label textures
