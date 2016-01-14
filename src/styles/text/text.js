// Text rendering style

import Texture from '../../gl/texture';
import WorkerBroker from '../../utils/worker_broker';
import Utils from '../../utils/utils';
import Geo from '../../geo';
import {Style} from '../style';
import {Points} from '../points/points';
import CanvasText from './canvas_text';
import Collision from '../../labels/collision';
import LabelPoint from '../../labels/label_point';
import LabelLine from '../../labels/label_line';
import TextSettings from './text_settings';
import {StyleParser} from '../style_parser';

import log from 'loglevel';

export let TextStyle = Object.create(Points);

Object.assign(TextStyle, {
    name: 'text',
    super: Points,
    built_in: true,
    selection: false, // no feature selection for text by default

    init() {
        this.super.init.apply(this, arguments);

        // Provide a hook for this object to be called from worker threads
        this.main_thread_target = 'TextStyle-' + this.name;
        if (Utils.isMainThread) {
            WorkerBroker.addTarget(this.main_thread_target, this);
        }

        // Point style (parent class) requires texturing to be turned on
        // (labels are always drawn with textures)
        this.defines.TANGRAM_POINT_TEXTURE = true;

        // Manually un-multiply alpha, because Canvas text rasterization is pre-multiplied
        this.defines.TANGRAM_UNMULTIPLY_ALPHA = true;

        this.reset();
    },

    reset() {
        this.super.reset.call(this);
        if (Utils.isMainThread) {
            this.canvas = new CanvasText();
        }
        else if (Utils.isWorkerThread) {
            this.texts = {}; // unique texts, grouped by tile, by style
        }
    },

    // Called on worker thread to release tile-specific resources
    freeTile (tile) {
        delete this.texts[tile];
    },

    // Free tile-specific resources before finshing style construction
    finishTile(tile) {
        this.freeTile(tile);
        return Style.endData.call(this, tile);
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

        // Collect text - default source is feature.properties.name
        let text;
        let source = draw.text_source || 'name';

        if (typeof source === 'string') {
            text = feature.properties[source];
        } else if (typeof source === 'function') {
            text = source(context);
        }

        if (text == null) {
            return; // no text for this feature
        }

        // Compute text style and layout settings for this feature label
        let layout = this.computeLayout({}, feature, draw, context, tile, text);
        let text_settings = TextSettings.compute(feature, draw, context);
        let text_settings_key = TextSettings.key(text_settings);

        // first label in tile, or with this style?
        this.texts[tile.key] = this.texts[tile.key] || {};
        this.texts[tile.key][text_settings_key] = this.texts[tile.key][text_settings_key] || {};

        // unique text strings, grouped by text drawing style
        if (!this.texts[tile.key][text_settings_key][text]) {
            // first label with this text/style/tile combination, make a new label entry
            this.texts[tile.key][text_settings_key][text] = {
                text_settings,
                ref: 0 // # of times this text/style combo appears in tile
            };
        }

        // Queue the feature for processing
        if (!this.tile_data[tile.key]) {
            this.startData(tile.key);
        }

        if (!this.queues[tile.key]) {
            this.queues[tile.key] = [];
        }

        this.queues[tile.key].push({
            feature, draw, context,
            text, text_settings_key, layout
        });

        // Register with collision manager
        Collision.addStyle(this.name, tile.key);
    },

    // Override
    endData (tile) {
        let queue = this.queues[tile];
        this.queues[tile] = [];

        if (Object.keys(this.texts[tile]||{}).length === 0) {
            return Promise.resolve();
        }

        // first call to main thread, ask for text pixel sizes
        return WorkerBroker.postMessage(this.main_thread_target+'.calcTextSizes', tile, this.texts[tile]).then(texts => {
            if (!texts) {
                Collision.collide({}, this.name, tile);
                return this.finishTile(tile);
            }
            this.texts[tile] = texts;

            let labels = this.createLabels(tile, queue);

            return Collision.collide(labels, this.name, tile).then(labels => {
                if (labels.length === 0) {
                    return this.finishTile(tile); // no labels visible for this tile
                }

                this.cullTextStyles(texts, labels);

                // second call to main thread, for rasterizing the set of texts
                return WorkerBroker.postMessage(this.main_thread_target+'.rasterizeTexts', tile, texts).then(({ texts, texture }) => {
                    if (texts) {
                        this.texts[tile] = texts;

                        // Build queued features
                        labels.forEach(q => {
                            let text_settings_key = q.text_settings_key;
                            let text_info = this.texts[tile] && this.texts[tile][text_settings_key] && this.texts[tile][text_settings_key][q.text];

                            // setup styling object expected by Style class
                            let style = this.feature_style;
                            style.label = q.label;
                            style.size = text_info.size.logical_size;
                            style.angle = Utils.radToDeg(q.label.angle) || 0;
                            style.texcoords = text_info.texcoords;

                            Style.addFeature.call(this, q.feature, q.draw, q.context);
                        });
                    }

                    return this.finishTile(tile).then(tile_data => {
                        // Attach tile-specific label atlas to mesh as a texture uniform
                        if (texture && tile_data) {
                            tile_data.uniforms = { u_texture: texture };
                            tile_data.textures = [texture]; // assign texture ownership to tile
                            return tile_data;
                        }
                    });
                });
            });
        });
    },

    createLabels (tile, feature_queue) {
        let labels = [];

        for (let f=0; f < feature_queue.length; f++) {
            let { feature, draw, context, text, text_settings_key, layout } = feature_queue[f];
            let text_info = this.texts[tile][text_settings_key][text];

            let feature_labels = this.buildLabelsFromGeometry(text_info.size.collision_size, feature.geometry, layout);
            for (let i = 0; i < feature_labels.length; i++) {
                let label = feature_labels[i];
                labels.push({
                    feature, draw, context,
                    text, text_settings_key, layout, label
                });
            }
        }

        return labels;
    },

    // Remove unused text/style combinations to avoid unnecessary rasterization
    cullTextStyles(texts, labels) {
        // Count how many times each text/style combination is used
        for (let i=0; i < labels.length; i++) {
            texts[labels[i].text_settings_key][labels[i].text].ref++;
        }

        // Remove text/style combinations that have no visible labels
        for (let style in texts) {
            for (let text in texts[style]) {
                // no labels for this text
                if (texts[style][text].ref < 1) {
                    // console.log(`drop label text ${text} in style ${style}`);
                    delete texts[style][text];
                }
            }
        }

        for (let style in texts) {
            // no labels for this style
            if (Object.keys(texts[style]).length === 0) {
                // console.log(`drop label text style ${style}`);
                delete texts[style];
            }
        }
    },

    // Called on main thread from worker, to compute the size of each text string,
    // were it to be rendered. This info is then used to perform initial label culling, *before*
    // labels are actually rendered.
    calcTextSizes (tile, texts) {
        return this.canvas.textSizes(tile, texts);
    },

    // Called on main thread from worker, to create atlas of labels for a tile
    rasterizeTexts (tile, texts) {
        let canvas = new CanvasText();
        let texture_size = canvas.setTextureTextPositions(texts);
        log.trace(`text summary for tile ${tile}: fits in ${texture_size[0]}x${texture_size[1]}px`);

        // update canvas size & rasterize all the text strings we need
        canvas.resize(...texture_size);
        canvas.rasterize(tile, texts, texture_size);

        // create a texture
        let t = 'labels-' + tile + '-' + (TextStyle.texture_id++);
        let texture = new Texture(this.gl, t);
        texture.setCanvas(canvas.canvas, {
            filtering: 'linear',
            UNPACK_PREMULTIPLY_ALPHA_WEBGL: true
        });

        return { texts, texture: t }; // texture is returned by name (not instance)
    },

    // Sets up caching for draw rule properties
    _preprocess (draw) {
        if (!draw.font) {
            return;
        }

        // Colors
        draw.font.fill = StyleParser.cacheObject(draw.font.fill);
        if (draw.font.stroke) {
            draw.font.stroke.color = StyleParser.cacheObject(draw.font.stroke.color);
        }

        // Convert font and text stroke sizes
        draw.font.px_size = StyleParser.cacheObject(draw.font.size, CanvasText.fontPixelSize);
        if (draw.font.stroke && draw.font.stroke.width != null) {
            draw.font.stroke.width = StyleParser.cacheObject(draw.font.stroke.width, parseFloat);
        }

        // Offset (2d array)
        draw.offset = StyleParser.cacheObject(draw.offset, v => (Array.isArray(v) && v.map(parseFloat)) || 0);

        // Buffer (1d value or or 2d array)
        draw.buffer = StyleParser.cacheObject(draw.buffer, v => (Array.isArray(v) ? v : [v, v]).map(parseFloat) || 0);

        // Repeat rules
        draw.repeat_distance = StyleParser.cacheObject(draw.repeat_distance, parseFloat);

        return draw;
    },

    // Additional text-specific layout settings
    computeLayout (target, feature, draw, context, tile, text) {
        let layout = target || {};

        // common settings w/points
        layout = Points.computeLayout(layout, feature, draw, context, tile);

        // tile boundary handling
        layout.cull_from_tile = (draw.cull_from_tile != null) ? draw.cull_from_tile : true;
        layout.move_into_tile = (draw.move_into_tile != null) ? draw.move_into_tile : true;

        // label line exceed percentage
        if (draw.line_exceed && draw.line_exceed.substr(-1) === '%') {
            layout.line_exceed = parseFloat(draw.line_exceed.substr(0,draw.line_exceed.length-1));
        }
        else {
            layout.line_exceed = 80;
        }

        // repeat minimum distance
        layout.repeat_distance = StyleParser.cacheProperty(draw.repeat_distance, context);
        if (layout.repeat_distance == null) {
            layout.repeat_distance = Geo.tile_size;
        }
        layout.repeat_distance *= layout.units_per_pixel;

        // repeat group key
        if (typeof draw.repeat_group === 'function') {
            layout.repeat_group = draw.repeat_group(context);
        }
        else if (typeof draw.repeat_group === 'string') {
            layout.repeat_group = draw.repeat_group;
        }
        else {
            layout.repeat_group = draw.key; // default to unique set of matching layers
        }
        layout.repeat_group += '/' + text;

        return layout;
    },

    // Builds one or more labels for a geometry
    buildLabelsFromGeometry (size, geometry, options) {
        let labels = [];

        if (geometry.type === "LineString") {
            let lines = geometry.coordinates;

            labels.push(new LabelLine(size, lines, options));
        } else if (geometry.type === "MultiLineString") {
            let lines = geometry.coordinates;

            for (let i = 0; i < lines.length; ++i) {
                let line = lines[i];
                labels.push(new LabelLine(size, line, options));
            }
        } else if (geometry.type === "Point") {
            labels.push(new LabelPoint(geometry.coordinates, size, options));
        } else if (geometry.type === "MultiPoint") {
            let points = geometry.coordinates;

            for (let i = 0; i < points.length; ++i) {
                let point = points[i];
                labels.push(new LabelPoint(point, size, options));
            }
        } else if (geometry.type === "Polygon") {
            let centroid = Geo.centroid(geometry.coordinates[0]);
            labels.push(new LabelPoint(centroid, size, options));
        } else if (geometry.type === "MultiPolygon") {
            let centroid = Geo.multiCentroid(geometry.coordinates);
            labels.push(new LabelPoint(centroid, size, options));
        }

        return labels;
    }

});

TextStyle.texture_id = 0; // namespaces per-tile label textures
