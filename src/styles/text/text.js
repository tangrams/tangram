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

        let type = feature.geometry.type;
        draw.can_articulate = (type === "LineString" || type === "MultiLineString");

        // supersample text rendering for angled labels, to improve clarity
        draw.supersample_text = (type === "LineString" || type === "MultiLineString");

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

    // Override
    startData (tile) {
        this.queues[tile.key] = [];
        return Style.startData.call(this, tile);
    },

    // Override
    endData (tile) {
        let queue = this.queues[tile.key];
        delete this.queues[tile.key];

        return this.prepareTextLabels(tile, this.name, queue).
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
                            style.size = text_info.size.map(function(size){ return size.logical_size; });
                            style.texcoords = text_info.texcoords;
                        }
                        else {
                            style.size = text_info.size.logical_size;
                            style.angle = q.label.angle || 0;
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
                fq.layout.space_width = text_info.space_width;
                feature_labels = this.buildLabels(sizes, fq.feature.geometry, fq.layout);
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
    buildLabels (size, geometry, layout) {
        let labels = [];

        if (geometry.type === "LineString") {
            this.buildLineLabels(geometry.coordinates, size, layout, labels);
        } else if (geometry.type === "MultiLineString") {
            let lines = geometry.coordinates;
            for (let i = 0; i < lines.length; ++i) {
                this.buildLineLabels(lines[i], size, layout, labels);
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
    buildLineLabels (line, size, layout, labels) {
        let subdiv = Math.min(layout.subdiv, line.length - 1);
        if (subdiv > 1) {
            // Create multiple labels for line, with each allotted a range of segments
            // in which it will attempt to place
            let seg_per_div = (line.length - 1) / subdiv;
            for (let i = 0; i < subdiv; i++) {
                layout.segment_start = Math.floor(i * seg_per_div);
                layout.segment_end = Math.floor((i + 1) * seg_per_div);

                labels.push(new LabelLine(size, line, layout));
            }
            layout.segment_start = null;
            layout.segment_end = null;
        }
        else {
            let label = new LabelLine(size, line, layout);
            if (!label.throw_away){
                let chosen_label = placementStrategy(label);
                if (chosen_label){
                    labels.push(chosen_label);
                }
            }
        }
    }

});

const TARGET_STRAIGHT = 0.4; // Optimistic target ratio for straight labels (label length / line length)
const TARGET_KINKED = 0.5; // Optimistic target ratio for kinked labels (label length / line length)

// Place labels according to the following strategy:
// - choose the best straight label that satisfies the optimistic straight cutoff (if any)
// - else choose the best kinked label that satisfies the optimistic kinked cutoff (if any)
// - else choose the best straight label that satisfies its internal (less optimistic) cutoff (if any)
// - else choose the best kinked labels that satisfies its internal (less optimistic) cutoff (if any)
// - else don't place a label
function placementStrategy(label){
    let labels_straight = [];
    let labels_kinked = [];
    let best_straight_fitness = Infinity;
    let best_kinked_fitness = Infinity;

    // loop through all labels
    while (label && !label.throw_away) {
        if (label.kink_index > 0){
            // check if articulated label is above lowest cutoff
            if (label.fitness < best_kinked_fitness){
                best_kinked_fitness = label.fitness;
                labels_kinked.unshift(label);
            }
        }
        else {
            // check if straight label is above lowest straight cutoff
            if (label.fitness < best_straight_fitness){
                best_straight_fitness = label.fitness;
                labels_straight.unshift(label);
            }
        }

        label = LabelLine.nextLabel(label);
    }

    let best_straight = labels_straight[0];
    let best_kinked = labels_kinked[0];

    if (labels_straight.length && best_straight.fitness < TARGET_STRAIGHT){
        // return the best straight segment if it is above the stricter straight cutoff
        return best_straight;
    }
    else if (labels_kinked.length && best_kinked.fitness < TARGET_KINKED){
        // return the best kinked segment if it is above the stricter kinked cutoff
        return best_kinked;
    }
    else {
        // otherwise return best of what's left (if any)
        return best_straight || best_kinked;
    }
}

TextStyle.texture_id = 0; // namespaces per-tile label textures
