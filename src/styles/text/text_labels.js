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
        if (text == null || text === '') {
            return; // no text for this feature
        }

        // Compute text style and layout settings for this feature label
        let text_settings = TextSettings.compute(feature, draw, context);
        let text_settings_key = TextSettings.key(text_settings);
        let layout = this.computeTextLayout({}, feature, draw, context, tile, text, text_settings);

        // first label in tile, or with this style?
        this.texts[tile.key] = this.texts[tile.key] || {};
        let sizes = this.texts[tile.key][text_settings_key] = this.texts[tile.key][text_settings_key] || {};

        // unique text strings, grouped by text drawing style
        if (!sizes[text]) {
            // first label with this text/style/tile combination, make a new label entry
            sizes[text] = {
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

    prepareTextLabels (tile, collision_group, queue) {
        if (Object.keys(this.texts[tile.key]||{}).length === 0) {
            return Promise.resolve({});
        }

        // first call to main thread, ask for text pixel sizes
        return WorkerBroker.postMessage(this.main_thread_target+'.calcTextSizes', this.texts[tile.key]).then(texts => {

            if (tile.canceled) {
                log('trace', `Style ${this.name}: stop tile build because tile was canceled: ${tile.key}, post-calcTextSizes()`);
                return;
            }

            this.texts[tile.key] = texts;
            if (!texts) {
                return;
            }

            return this.buildTextLabels(tile.key, queue);
        });
    },

    collideAndRenderTextLabels (tile, collision_group, labels) {
        if (!labels) {
            Collision.collide({}, collision_group, tile.key);
            return Promise.resolve({});
        }

        return Collision.collide(labels, collision_group, tile.key).then(labels => {
            if (tile.canceled) {
                log('trace', `stop tile build because tile was canceled: ${tile.key}, post-collide()`);
                return {};
            }

            if (labels.length === 0) {
                return {};
            }

            let texts = this.texts[tile.key];
            this.cullTextStyles(texts, labels);

            // set alignments
            labels.forEach(q => {
                let text_settings_key = q.text_settings_key;
                let text_info = texts[text_settings_key] && texts[text_settings_key][q.text];
                if (!text_info.text_settings.can_articulate){
                    text_info.align = text_info.align || {};
                    text_info.align[q.label.align] = {};
                }
            });

            // second call to main thread, for rasterizing the set of texts
            return WorkerBroker.postMessage(this.main_thread_target+'.rasterizeTexts', tile.key, texts).then(({ texts, texture }) => {
                if (tile.canceled) {
                    log('trace', `stop tile build because tile was canceled: ${tile.key}, post-rasterizeTexts()`);
                    return {};
                }

                return { labels, texts, texture };
            });
        });
    },

    // Remove unused text/style combinations to avoid unnecessary rasterization
    cullTextStyles(texts, labels) {
        // Count how many times each text/style combination is used
        for (let i=0; i < labels.length; i++) {
            let label = labels[i];
            texts[label.text_settings_key][label.text].ref++;
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
        canvas.clearTexcoordCache(tile_key);

        let texture_size = canvas.setTextureTextPositions(texts, this.max_texture_size, tile_key);
        log('trace', `text summary for tile ${tile_key}: fits in ${texture_size[0]}x${texture_size[1]}px`);

        // fits in max texture size?
        if (texture_size[0] < this.max_texture_size && texture_size[1] < this.max_texture_size) {
            // update canvas size & rasterize all the text strings we need
            canvas.resize(...texture_size);
            canvas.rasterize(texts, texture_size, tile_key);
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
        draw.font.fill = StyleParser.createPropertyCache(draw.font.fill);
        if (draw.font.stroke) {
            draw.font.stroke.color = StyleParser.createPropertyCache(draw.font.stroke.color);
        }

        // Convert font and text stroke sizes
        draw.font.px_size = StyleParser.createPropertyCache(draw.font.size || TextSettings.defaults.size, CanvasText.fontPixelSize);
        if (draw.font.stroke && draw.font.stroke.width != null) {
            draw.font.stroke.width = StyleParser.createPropertyCache(draw.font.stroke.width, parseFloat);
        }

        // Offset (2d array)
        draw.offset = StyleParser.createPropertyCache(draw.offset, v => (Array.isArray(v) && v.map(parseFloat)) || 0);

        // Buffer (1d value or or 2d array)
        draw.buffer = StyleParser.createPropertyCache(draw.buffer, v => (Array.isArray(v) ? v : [v, v]).map(parseFloat) || 0);

        // Repeat rules - for text labels, defaults to tile size
        draw.repeat_distance = StyleParser.createPropertyCache(draw.repeat_distance || Geo.tile_size, parseFloat);

        return draw;
    },

    // Additional text-specific layout settings
    computeTextLayout (target, feature, draw, context, tile, text, text_settings) {
        let layout = target || {};

        // common settings w/points
        layout = this.computeLayout(layout, feature, draw, context, tile);

        // tile boundary handling
        layout.cull_from_tile = (draw.cull_from_tile != null) ? draw.cull_from_tile : true;

        // standalone text can move into tile if specified
        layout.move_into_tile = (draw.move_into_tile != null) ? draw.move_into_tile : true;

        // repeat rules include the text
        if (layout.repeat_distance) {
            layout.repeat_group += '/' + text;
        }

        // Max number of subdivisions to try
        layout.subdiv = tile.overzoom2;

        layout.align = draw.align;

        // used to fudge width value as text may overflow bounding box if it has italic, bold, etc style
        layout.italic = (text_settings.style !== 'normal');

        return layout;
    }

};
