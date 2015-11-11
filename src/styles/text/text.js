// Text rendering style

import Texture from '../../gl/texture';
import WorkerBroker from '../../utils/worker_broker';
import Utils from '../../utils/utils';
import {Points} from '../points/points';
import CanvasText from './canvas_text';
import LabelBuilder from './label_builder';
import TextSettings from './text_settings';
import LayoutSettings from './layout_settings';
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

        // default font style
        this.default_style = {
            style: 'normal',
            weight: null,
            size: '12px',
            px_size: 12,
            family: 'Helvetica',
            fill: 'white',
            text_wrap: 15,
            align: 'center'
        };

        this.reset();
    },

    reset() {
        this.super.reset.call(this);
        this.texts = {}; // unique texts, grouped by tile, by style
        this.canvas = {};
        this.aabbs = {};
    },

    // Called on main thread to release tile-specific resources
    freeTile (tile) {
        delete this.texts[tile];
        delete this.canvas[tile];
        delete this.aabbs[tile];
    },

    // Override
    startData (tile) {
        let tile_data = this.super.startData.apply(this, arguments);
        tile_data.queue = [];
        return tile_data;
    },

    // Override to queue features instead of processing immediately
    addFeature (feature, draw, context) {
        let tile = context.tile;
        if (tile.generation !== this.generation) {
            return;
        }

        // Called here because otherwise it will be delayed until the feature queue is parsed,
        // and we want the preprocessing done before we evaluate text style below
        this.preprocess(draw);

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
        let layout = LayoutSettings.compute(feature, draw, context, tile);
        let text_settings = TextSettings.compute(feature, draw, context, this.default_style);
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
        this.tile_data[tile.key].queue.push({
            feature, draw, context,
            text, text_settings_key, layout
        });
    },

    // Override
    endData (tile) {
        let tile_data = this.tile_data[tile];
        let count = Object.keys(this.texts[tile]||{}).length;

        if (!count) {
            return Promise.resolve();
        }

        // first call to main thread, ask for text pixel sizes
        return WorkerBroker.postMessage(this.main_thread_target, 'calcTextSizes', tile, this.texts[tile]).then(texts => {
            if (!texts) {
                this.freeTile(tile);
                return this.super.endData.apply(this, arguments);
            }
            this.texts[tile] = texts;

            let labels = this.createLabels(tile, tile_data.queue);
            if (!labels) {
                this.freeTile(tile);
                return this.super.endData.apply(this, arguments);
            }

            labels = this.discardLabels(tile, labels, texts);

            // No labels for this tile
            if (Object.keys(texts).length === 0) {
                this.freeTile(tile);
                WorkerBroker.postMessage(this.main_thread_target, 'freeTile', tile);
                // early exit
                return;
            }

            // second call to main thread, for rasterizing the set of texts
            return WorkerBroker.postMessage(this.main_thread_target, 'rasterizeTexts', tile, texts).then(({ texts, texture }) => {
                if (texts) {
                    this.texts[tile] = texts;

                    // Attach tile-specific label atlas to mesh as a texture uniform
                    tile_data.uniforms = { u_texture: texture };
                    tile_data.textures = [texture]; // assign texture ownership to tile - TODO: implement in VBOMesh

                    // Build queued features
                    labels.forEach(q => {
                        let text = q.label.text;
                        let text_settings_key = q.text_settings_key;
                        let text_info = this.texts[tile] && this.texts[tile][text_settings_key] && this.texts[tile][text_settings_key][text];
                        q.label.texcoords = text_info.texcoords;

                        this.super.addFeature.call(this, q.feature, q.draw, q.context, q.label);
                    });
                }

                tile_data.queue = []; // TODO: free earlier?
                this.freeTile(tile);
                return this.super.endData.apply(this, arguments);
            });
        });
    },

    createLabels (tile, feature_queue) {
        let priorities = {}; // labels, group by priority

        for (let f=0; f < feature_queue.length; f++) {
            let { feature, draw, context, text, text_settings_key, layout } = feature_queue[f];
            let text_info = this.texts[tile][text_settings_key][text];

            let labels = LabelBuilder.buildFromGeometry(text, text_info.size, feature.geometry, layout);
            for (let i = 0; i < labels.length; ++i) {
                let label = labels[i];
                priorities[layout.priority] = priorities[layout.priority] || [];
                priorities[layout.priority].push({ feature, draw, context, text, text_settings_key, label });
            }
        }

        return priorities;
    },

    // Test labels for collisions, higher to lower priority
    // When two collide, discard the lower-priority label
    discardLabels (tile, labels, texts) {
        this.aabbs[tile] = [];
        let keep_labels = [];

        // Process labels by priority
        let priorities = Object.keys(labels).sort((a, b) => a - b);
        for (let priority of priorities) {
            if (!labels[priority]) { // no labels at this priority, skip to next
                continue;
            }

            for (let i = 0; i < labels[priority].length; i++) {
                let { label, text_settings_key } = labels[priority][i];

                // test the label for intersections with other labels in the tile
                if (!label.discard(this.aabbs[tile])) {
                    keep_labels.push(labels[priority][i]);

                    // increment a count of how many times this style is used in the tile
                    texts[text_settings_key][label.text].ref++;
                }
            }
        }

        // Remove text/style combinations that have no visible labels
        for (let style in texts) {
            for (let text in texts[style]) {
                // no labels for this text
                if (texts[style][text].ref < 1) {
                    delete texts[style][text];
                }
            }
        }
        for (let style in texts) {
            // no labels for this style
            if (Object.keys(texts[style]).length === 0) {
                delete texts[style];
            }
        }

        return keep_labels;
    },

    // Called on main thread from worker, to compute the size of each text string,
    // were it to be rendered. This info is then used to perform initial label culling, *before*
    // labels are actually rendered.
    calcTextSizes (tile, texts) {
        if(!this.canvas[tile]) {
            this.canvas[tile] = new CanvasText();
        }
        return this.canvas[tile].textSizes(tile, texts);
    },

    // Called on main thread from worker, to create atlas of labels for a tile
    rasterizeTexts (tile, texts) {
        if (!this.canvas[tile]) {
            return Promise.resolve({});
        }

        let canvas = this.canvas[tile];
        let texture_size = canvas.setTextureTextPositions(texts);
        log.trace(`text summary for tile ${tile}: fits in ${texture_size[0]}x${texture_size[1]}px`);

        // update canvas size & rasterize all the text strings we need
        canvas.resize(...texture_size);
        canvas.rasterize(tile, texts, texture_size);

        // create a texture
        let t = 'labels-' + tile + '-' + (Text.texture_id++);
        let texture = new Texture(this.gl, t);
        texture.setCanvas(canvas.canvas, {
            filtering: 'linear',
            UNPACK_PREMULTIPLY_ALPHA_WEBGL: true
        });

        // we don't need tile canvas once it has been copied to to GPU
        delete this.canvas[tile];

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
    },

    // Parse feature is called "late", after all labels have been created
    // The usual parsing done by _parseFeature() is handled by addFeature() above
    // Here we just pass the label through to the build functions below
    _parseFeature (feature, draw, context, label) {
        this.feature_style.label = label;
        return this.feature_style;
    },

    build (style, vertex_data) {
        let vertex_template = this.makeVertexTemplate(style);
        let label = style.label;

        this.texcoord_scale = label.texcoords;

        this.buildQuad(
            [label.position],
            label.size.texture_text_size,
            Utils.radToDeg(label.angle) || 0, vertex_data,
            vertex_template, label.options.offset
        );
    },

    buildLines (lines, style, vertex_data) {
        this.build(style, vertex_data);
    },

    buildPoints (points, style, vertex_data) {
        this.build(style, vertex_data);
    },

    buildPolygons (points, style, vertex_data) {
        this.build(style, vertex_data);
    }

});

Text.texture_id = 0; // namespaces per-tile label textures
