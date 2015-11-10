// Text rendering style

import Texture from '../../gl/texture';
import WorkerBroker from '../../utils/worker_broker';
import Utils from '../../utils/utils';
import {Points} from '../points/points';
import CanvasText from './canvas_text';
import LabelBuilder from './label_builder';
import FeatureLabel from './feature_label';
import LabelOptions from './label_options';
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
        this.default_font_style = {
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
        this.textures = {};
        this.canvas = {};
        this.aabbs = {};
    },

    // Called on main thread to release tile-specific resources
    freeTile (tile) {
        delete this.texts[tile];
        delete this.textures[tile];
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

        if (!this.texts[tile.key]) {
            // this is the first label in the tile, make a new tile entry
            // eg "osm/15/9650/12319/15"
            this.texts[tile.key] = {};
        }

        let label_feature = new FeatureLabel(feature, draw, context, text, tile, this.default_font_style);
        if (!label_feature.style) {
            return;
        }

        let style_key = label_feature.style_key;
        if (!this.texts[tile.key][style_key]) {
            // first label with this style in this tile, make a new style entry
            // example: "100 24px Helvetica/rgb(102,102,102)/rgb(255,255,255)/8"
            this.texts[tile.key][style_key] = {};
        }

        // label priority (lower is higher)
        let priority = draw.priority;
        if (priority != null) {
            if (typeof priority === 'function') {
                priority = priority(context);
            }
        }
        else {
            priority = -1 >>> 0; // default to max priority value if none set
        }

        // label offset in pixel (applied in screen space)
        let offset = draw.offset || [0, 0];
        offset[0] = parseFloat(offset[0]);
        offset[1] = parseFloat(offset[1]); // y-point down

        // label anchors (point labels only)
        // label will be adjusted in the given direction, relatove to its original point
        // one of: left, right, top, bottom, top-left, top-right, bottom-left, bottom-right
        let anchor = draw.anchor;

        // label buffer in pixel
        let buffer = draw.buffer;
        if (buffer != null) {
            if (!Array.isArray(buffer)) {
                buffer = [buffer, buffer]; // buffer can be 1D or 2D
            }

            buffer[0] = parseFloat(buffer[0]);
            buffer[1] = parseFloat(buffer[1]);
        }

        // label line exceed percentage
        let line_exceed;
        if (draw.line_exceed && draw.line_exceed.substr(-1) === '%') {
            line_exceed = draw.line_exceed.substr(0,draw.line_exceed.length-1);
        }

        // unique text strings, grouped by text drawing style
        if (!this.texts[tile.key][style_key][text]) {
            // first label with this text/style/tile combination, make a new label entry
            this.texts[tile.key][style_key][text] = {
                text_style: label_feature.style,
                units_per_pixel: tile.units_per_pixel,
                priority,
                offset,
                buffer,
                anchor,
                line_exceed,
                move_into_tile: draw.move_into_tile,
                ref: 0
            };
        }

        if (!this.tile_data[tile.key]) {
            this.startData(tile.key);
        }
        this.tile_data[tile.key].queue.push({
            feature, draw, context,
            text, style_key
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
                        let style_key = q.style_key;
                        let text_info = this.texts[tile] && this.texts[tile][style_key] && this.texts[tile][style_key][text];
                        q.label.texcoords = text_info.texcoords;

                        this.super.addFeature.call(this, q.feature, q.draw, q.context, q.label, text_info);
                    });
                }

                tile_data.queue = []; // TODO: free earlier?
                this.freeTile(tile);
                return this.super.endData.apply(this, arguments);
            });
        });
    },

    createLabels (tile, features) {
        let priorities = {}; // labels, group by priority

        for (let f=0; f < features.length; f++) {
            // let { feature, text, text_info, style_key } = features[f];
            let { feature, draw, context, text, style_key } = features[f];
            let text_info = this.texts[tile][style_key][text];
            let options = new LabelOptions(text_info);

            let labels = LabelBuilder.buildFromGeometry(text, text_info.size, feature.geometry, options);
            for (let i = 0; i < labels.length; ++i) {
                let label = labels[i];

                priorities[text_info.priority] = priorities[text_info.priority] || [];
                priorities[text_info.priority].push({ feature, draw, context, text, style_key, label });
            }
        }

        return priorities;
    },

    // test all labels for collisions -
    // when two collide, discard the lower-priority label
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
                let { feature, label, style_key } = labels[priority][i];

                // test the label for intersections with other labels in the tile
                if (!label.discard(this.aabbs[tile])) {
                    keep_labels.push(labels[priority][i]);

                    // increment a count of how many times this style is used in the tile
                    texts[style_key][label.text].ref++;
                }
            }
        }

        for (let style in texts) {
            for (let text in texts[style]) {
                if (texts[style][text].ref < 1) { // if this style isn't being used
                    delete texts[style][text]; // cleanup
                }
            }
        }

        for (let style in texts) {
            let text_infos = texts[style];
            if (Object.keys(text_infos).length === 0) {
                // No labels for this style
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

        // update the canvas to texture size
        canvas.resize(...texture_size);

        // create a texture
        let texture = 'labels-' + tile + '-' + (TextStyle.texture_id++);
        this.textures[tile] = new Texture(this.gl, texture);

        // ask for rasterization for the text set
        canvas.rasterize(tile, texts, texture_size);

        this.textures[tile].setCanvas(canvas.canvas, {
            filtering: 'linear',
            UNPACK_PREMULTIPLY_ALPHA_WEBGL: true
        });

        // we don't need tile canvas/texture once it has been copied to to GPU
        delete this.textures[tile];
        delete this.canvas[tile];

        return { texts, texture };
    },

    _preprocess (draw) {
        if (!draw.font) {
            return;
        }

        // Setup caching for colors
        draw.font.fill = StyleParser.cacheObject(draw.font.fill);
        if (draw.font.stroke) {
            draw.font.stroke.color = StyleParser.cacheObject(draw.font.stroke.color);
        }

        // Convert font and text stroke and setup caching
        draw.font.px_size = StyleParser.cacheObject(draw.font.size, CanvasText.fontPixelSize);
        if (draw.font.stroke && draw.font.stroke.width != null) {
            draw.font.stroke.width = StyleParser.cacheObject(draw.font.stroke.width, parseFloat);
        }
    },

    // Parse feature is called "late", after all labels have been created
    // The usual parsing done by _parseFeature() is handled by addFeature() above
    _parseFeature (feature, draw, context, label) {
        let text = label.text;
        let style = this.feature_style;

        style.label = label;

        // TODO: point style (parent class) requires a color, setting it to white for now,
        // but could be made conditional in the vertex layout to save space
        style.color = TextStyle.white;

        // tell the point style (base class) that we want to render polygon labels at the polygon's centroid
        style.centroid = true;

        // points can be placed off the ground
        style.z = (draw.z && StyleParser.cacheDistance(draw.z, context)) || StyleParser.defaults.z;

        return style;
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

TextStyle.texture_id = 0;
TextStyle.white = [1, 1, 1, 1];
