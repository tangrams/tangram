// Text label rendering methods, can be mixed into a rendering style

import {StyleParser} from '../style_parser';
import Texture from '../../gl/texture';
import Geo from '../../geo';
import log from '../../utils/log';
import Thread from '../../utils/thread';
import WorkerBroker from '../../utils/worker_broker';
import Collision from '../../labels/collision';
import TextSettings from '../text/text_settings';
import CanvasText from '../text/canvas_text';

// namespaces label textures (ensures new texture name when a tile is built multiple times)
let text_texture_id = 0;

export const TextLabels = {

    resetText () {
        if (Thread.is_main) {
            this.canvas = new CanvasText();
        }
        else if (Thread.is_worker) {
            this.texts = {}; // unique texts, grouped by tile, by style
        }
    },

    freeText (tile) {
        delete this.texts[tile.key];
    },

    parseTextFeature (feature, draw, context, tile) {
        // Compute label text
        let text = this.parseTextSource(feature, draw, context);
        if (text == null) {
            return; // no text for this feature
        }

        // Compute text style and layout settings for this feature label
        let layout = this.computeTextLayout({}, feature, draw, context, tile, text);
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

        return {
            draw, text, text_settings_key, layout
        };
    },

    // Compute the label text, default is value of feature.properties.name
    // - String value indicates a feature property look-up, e.g. `short_name` means use feature.properties.short_name
    // - Function will use the return value as the label text (for custom labels)
    // - Array (of strings and/or functions) defines a list of fallbacks, evaluated according to the above rules,
    //   with the first non-null value used as the label text
    //   e.g. `[name:es, name:en, name]` prefers Spanish names, followed by English, and last the default local name
    parseTextSource (feature, draw, context) {
        let text;
        let source = draw.text_source || 'name';

        if (Array.isArray(source)) {
            for (let s=0; s < source.length; s++) {
                if (typeof source[s] === 'string') {
                    text = feature.properties[source[s]];
                } else if (typeof source[s] === 'function') {
                    text = source[s](context);
                }

                if (text) {
                    break; // stop if we found a text property
                }
            }
        }
        else if (typeof source === 'string') {
            text = feature.properties[source];
        } else if (typeof source === 'function') {
            text = source(context);
        }
        return text;
    },

    renderTextLabels (tile, collision_group, queue) {
        if (Object.keys(this.texts[tile.key]||{}).length === 0) {
            return Promise.resolve({});
        }

        // first call to main thread, ask for text pixel sizes
        return WorkerBroker.postMessage(this.main_thread_target+'.calcTextSizes', this.texts[tile.key]).then(texts => {

            if (tile.canceled) {
                log('trace', `Style ${this.name}: stop tile build because tile was canceled: ${tile.key}, post-calcTextSizes()`);
                return {};
            }

            if (!texts) {
                Collision.collide({}, collision_group, tile.key);
                return {};
            }
            this.texts[tile.key] = texts;

            let labels = this.createTextLabels(tile.key, queue);

            return Collision.collide(labels, collision_group, tile.key).then(labels => {
                if (tile.canceled) {
                    log('trace', `stop tile build because tile was canceled: ${tile.key}, post-collide()`);
                    return {};
                }

                if (labels.length === 0) {
                    return {};
                }

                this.cullTextStyles(texts, labels);

                // second call to main thread, for rasterizing the set of texts
                return WorkerBroker.postMessage(this.main_thread_target+'.rasterizeTexts', tile.key, texts).then(({ texts, texture }) => {
                    if (tile.canceled) {
                        log('trace', `stop tile build because tile was canceled: ${tile.key}, post-rasterizeTexts()`);
                        return {};
                    }

                    return { labels, texts, texture };
                });
            });
        });
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
    },

    // Called on main thread from worker, to compute the size of each text string,
    // were it to be rendered. This info is then used to perform initial label culling, *before*
    // labels are actually rendered.
    calcTextSizes (texts) {
        return this.canvas.textSizes(texts);
    },

    // Called on main thread from worker, to create atlas of labels for a tile
    rasterizeTexts (tile_key, texts) {
        let canvas = new CanvasText();
        let texture_size = canvas.setTextureTextPositions(texts, this.max_texture_size);
        log('trace', `text summary for tile ${tile_key}: fits in ${texture_size[0]}x${texture_size[1]}px`);

        // fits in max texture size?
        if (texture_size[0] < this.max_texture_size && texture_size[1] < this.max_texture_size) {
            // update canvas size & rasterize all the text strings we need
            canvas.resize(...texture_size);
            canvas.rasterize(texts, texture_size);
        }
        else {
            log('error', [
                `Label atlas for tile ${tile_key} is ${texture_size[0]}x${texture_size[1]}px, `,
                `but max GL texture size is ${this.max_texture_size}x${this.max_texture_size}px`].join(''));
        }

        // create a texture
        let t = 'labels-' + tile_key + '-' + (text_texture_id++);
        Texture.create(this.gl, t, {
            element: canvas.canvas,
            filtering: 'linear',
            UNPACK_PREMULTIPLY_ALPHA_WEBGL: true
        });
        Texture.retain(t);

        return { texts, texture: t }; // texture is returned by name (not instance)
    },

    preprocessText (draw) {
        // Font settings are required
        if (!draw || !draw.font || typeof draw.font !== 'object') {
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
    computeTextLayout (target, feature, draw, context, tile, text) {
        let layout = target || {};

        // common settings w/points
        layout = this.computeLayout(layout, feature, draw, context, tile);

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

        // Max number of subdivisions to try
        layout.subdiv = tile.overzoom2;

        return layout;
    }

};
