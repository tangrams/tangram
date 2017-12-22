// Text label rendering methods, can be mixed into a rendering style

import StyleParser from '../style_parser';
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
        delete this.texts[tile.id];
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

        // first label in tile, or with this style?
        this.texts[tile.id] = this.texts[tile.id] || {};
        let sizes = this.texts[tile.id][text_settings_key] = this.texts[tile.id][text_settings_key] || {};

        if (text instanceof Object){
            let results = [];

            // add both left/right text elements to repeat group to improve repeat culling
            // avoids one component of a boundary label (e.g. Colorado) being culled too aggressively when it also
            // appears in nearby boundary labels (e.g. Colorado/Utah & Colorado/New Mexico repeat as separate groups)
            let repeat_group_prefix = text.left + '-' + text.right; // NB: should be all text keys, not just left/right

            for (let key in text){
                let current_text = text[key];
                if (!current_text) {
                    continue;
                }

                let layout = this.computeTextLayout({}, feature, draw, context, tile, current_text, text_settings, repeat_group_prefix, key);
                if (!sizes[current_text]) {
                    // first label with this text/style/tile combination, make a new label entry
                    sizes[current_text] = {
                        text_settings,
                        ref: 0 // # of times this text/style combo appears in tile
                    };
                }

                results.push({
                    draw, text : current_text, text_settings_key, layout
                });
            }

            return (results.length > 0 && results); // return null if no boundary labels found
        }
        else {
            // unique text strings, grouped by text drawing style
            let layout = this.computeTextLayout({}, feature, draw, context, tile, text, text_settings);
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
        }
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

        if (source != null && typeof source === 'object') {
            // left/right boundary labels
            text = {};
            for (let key in source) {
                text[key] = this.parseTextSourceValue(source[key], feature, context);
            }
        }
        else {
            // single label
            text = this.parseTextSourceValue(source, feature, context);
        }

        return text;
    },

    parseTextSourceValue (source, feature, context) {
        let text;
        if (Array.isArray(source)) {
            for (let s=0; s < source.length; s++) {
                if (typeof source[s] === 'string') {
                    text = feature.properties[source[s]];
                } else if (typeof source[s] === 'function') {
                    text = source[s](context);
                }

                if (text) {
                    return text; // stop if we found a text property
                }
            }
        }
        else if (typeof source === 'string') {
            text = feature.properties[source];
        }
        else if (source instanceof Function) {
            text = source(context);
        }

        return text;
    },

    prepareTextLabels (tile, collision_group, queue) {
        if (Object.keys(this.texts[tile.id]||{}).length === 0) {
            return Promise.resolve([]);
        }

        // first call to main thread, ask for text pixel sizes
        return WorkerBroker.postMessage(this.main_thread_target+'.calcTextSizes', tile.id, this.texts[tile.id]).then(({ texts }) => {
            if (tile.canceled) {
                log('trace', `Style ${this.name}: stop tile build because tile was canceled: ${tile.key}, post-calcTextSizes()`);
                return [];
            }

            this.texts[tile.id] = texts || [];
            if (!texts) {
                Collision.abortTile(tile.id);
                return [];
            }

            return this.buildTextLabels(tile, queue);
        });
    },

    collideAndRenderTextLabels (tile, collision_group, queue) {
        return this.prepareTextLabels(tile, collision_group, queue).then(labels => {
            if (labels.length === 0) {
                Collision.collide([], collision_group, tile.id);
                return Promise.resolve({});
            }

            return Collision.collide(labels, collision_group, tile.id).then(labels => {
                if (tile.canceled) {
                    log('trace', `stop tile build because tile was canceled: ${tile.key}, post-collide()`);
                    return {};
                }

                let texts = this.texts[tile.id];
                if (texts == null || labels.length === 0) {
                    return {};
                }

                this.cullTextStyles(texts, labels);

                // set alignments
                labels.forEach(q => {
                    let text_settings_key = q.text_settings_key;
                    let text_info = texts[text_settings_key] && texts[text_settings_key][q.text];
                    if (!text_info.text_settings.can_articulate){
                        text_info.align = text_info.align || {};
                        text_info.align[q.label.align] = {};
                    }
                    else {
                        // consider making it a set
                        if (!text_info.type) {
                            text_info.type = [];
                        }

                        if (text_info.type.indexOf(q.label.type) === -1){
                            text_info.type.push(q.label.type);
                        }
                    }
                });

                // second call to main thread, for rasterizing the set of texts
                return WorkerBroker.postMessage(this.main_thread_target+'.rasterizeTexts', tile.id, tile.key, texts).then(({ texts, textures }) => {
                    if (tile.canceled) {
                        log('trace', `stop tile build because tile was canceled: ${tile.key}, post-rasterizeTexts()`);
                        return {};
                    }

                    return { labels, texts, textures };
                });
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
    calcTextSizes (tile_id, texts) {
        return this.canvas.textSizes(tile_id, texts);
    },

    // Called on main thread from worker, to create atlas of labels for a tile
    rasterizeTexts (tile_id, tile_key, texts) {
        let canvas = new CanvasText(); // one per style per tile (style may be rendering multiple tiles at once)
        let max_texture_size = Math.min(this.max_texture_size, 2048); // cap each label texture at 2048x2048

        return canvas.setTextureTextPositions(texts, max_texture_size).then(({ textures }) => {
            if (!textures) {
                return {};
            }

            let texture_prefix = ['labels', this.name, tile_key, tile_id, text_texture_id, ''].join('-');
            text_texture_id++;

            return canvas.rasterize(texts, textures, tile_id, texture_prefix, this.gl).then(({ textures }) => {
                if (!textures) {
                    return {};
                }
                return { texts, textures };
            });
        });
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
            draw.font.stroke.width = StyleParser.createPropertyCache(draw.font.stroke.width, StyleParser.parsePositiveNumber);
        }

        // Offset (2d array)
        draw.offset = StyleParser.createPropertyCache(draw.offset,
            v => Array.isArray(v) && v.map(StyleParser.parseNumber)
        );

        // Buffer (1d value or or 2d array) - must be >= 0
        draw.buffer = StyleParser.createPropertyCache(draw.buffer,
            v => (Array.isArray(v) ? v : [v, v]).map(StyleParser.parsePositiveNumber)
        );

        // Repeat rules - for text labels, defaults to tile size
        draw.repeat_distance = StyleParser.createPropertyCache(draw.repeat_distance || Geo.tile_size, StyleParser.parsePositiveNumber);

        return draw;
    },

    // Additional text-specific layout settings
    computeTextLayout (target, feature, draw, context, tile, text, text_settings, repeat_group_prefix, orientation) {
        let layout = target || {};

        // common settings w/points
        layout = this.computeLayout(layout, feature, draw, context, tile);

        // tile boundary handling
        layout.cull_from_tile = (draw.cull_from_tile != null) ? draw.cull_from_tile : true;

        // standalone text can move into tile if specified
        layout.move_into_tile = (draw.move_into_tile != null) ? draw.move_into_tile : true;

        // repeat rules include the text
        if (layout.repeat_distance) {
            if (repeat_group_prefix) {
                layout.repeat_group += '/' + repeat_group_prefix;
            }
            layout.repeat_group += '/' + text;
        }

        // Max number of subdivisions to try
        layout.subdiv = tile.overzoom2;

        layout.align = draw.align;

        // used to fudge width value as text may overflow bounding box if it has italic, bold, etc style
        // TODO rename to more generic, not italic-specific (bold)
        layout.italic = (text_settings.style !== 'normal');

        // used to determine orientation of text if the text_source has a `left` or `right` key
        if (orientation === 'right') {
            layout.orientation = 1;
        }
        else if (orientation === 'left'){
            layout.orientation = -1;
        }

        return layout;
    }

};
