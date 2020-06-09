import log from '../../utils/log';
import Utils from '../../utils/utils';
import Texture from '../../gl/texture';
import FontManager from './font_manager';
import Task from '../../utils/task';
import StyleParser from '../style_parser';
import MultiLine from './text_wrap';
import { splitLabelText, isTextRTL, isTextNeutral, isTextCurveBlacklisted } from './text_segments';
import debugSettings from '../../utils/debug_settings';

export default class TextCanvas {

    constructor () {
        this.createCanvas();                // create initial canvas and context
        this.vertical_text_buffer = 8;      // vertical pixel padding around text
        this.horizontal_text_buffer = 4;    // text styling such as italic emphasis is not measured by the Canvas API, so padding is necessary
    }

    createCanvas () {
        this.canvas = document.createElement('canvas');
        this.canvas.style.backgroundColor = 'transparent'; // render text on transparent background
        this.context = this.canvas.getContext('2d');
    }

    resize (width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.context.clearRect(0, 0, width, height);
    }

    // Set font style params for canvas drawing
    setFont ({ font_css, fill, stroke, stroke_width, px_size, supersample }) {
        this.px_size = px_size;
        let ctx = this.context;
        let dpr = Utils.device_pixel_ratio * supersample;

        if (stroke && stroke_width > 0) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = stroke_width * dpr;
        }
        ctx.fillStyle = fill;

        ctx.font = font_css;
        ctx.miterLimit = 2;
    }

    async textSizes (tile_id, texts) {
        await FontManager.loadFonts();
        return Task.add({
            type: 'textSizes',
            run: this.processTextSizesTask.bind(this),
            texts,
            tile_id,
            cursor: {
                styles: Object.keys(texts),
                texts: null,
                style_idx: null,
                text_idx: null
            }
        });
    }

    processTextSizesTask (task) {
        let { cursor, texts  } = task;
        cursor.style_idx = cursor.style_idx || 0;

        while (cursor.style_idx < cursor.styles.length) {
            let style = cursor.styles[cursor.style_idx];
            if (cursor.text_idx == null) {
                cursor.text_idx = 0;
                cursor.texts = Object.keys(texts[style]);
            }

            let text_infos = texts[style];
            let first = true;

            while (cursor.text_idx < cursor.texts.length) {
                let text = cursor.texts[cursor.text_idx];
                let text_info = text_infos[text];
                let text_settings = text_info.text_settings;

                if (first) {
                    this.setFont(text_settings);
                    first = false;
                }

                // add size of full text string
                text_info.size = this.textSize(style, text, text_settings).size;

                // if text may curve, calculate per-segment as well
                if (text_settings.can_articulate) {
                    let rtl = false;
                    let bidi = false;
                    if (isTextRTL(text)) {
                        if (!isTextNeutral(text)) {
                            bidi = true;
                        }
                        else {
                            rtl = true;
                        }
                    }

                    text_info.isRTL = rtl;
                    text_info.no_curving = bidi || isTextCurveBlacklisted(text); // used in LabelLine to prevent curved labels
                    text_info.vertical_buffer = this.vertical_text_buffer;
                    text_info.segment_sizes = [];

                    if (!text_info.no_curving) {
                        let segments = splitLabelText(text, rtl, TextCanvas.cache);
                        text_info.segments = segments;
                        for (let i = 0; i < segments.length; i++){
                            text_info.segment_sizes.push(this.textSize(style, segments[i], text_settings).size);
                        }
                    }
                }

                cursor.text_idx++;

                if (!Task.shouldContinue(task)) {
                    return false;
                }
            }
            cursor.text_idx = null;
            cursor.style_idx++;
        }

        Task.finish(task, texts);
        return true;
    }

    // Computes width and height of text based on current font style
    // Includes word wrapping, returns size info for whole text block and individual lines
    textSize (style, text, {transform, text_wrap, max_lines, stroke_width = 0, supersample}) {
        // Check cache first
        TextCanvas.cache.text[style] = TextCanvas.cache.text[style] || {};
        if (TextCanvas.cache.text[style][text]) {
            TextCanvas.cache.stats.text_hits++;
            return TextCanvas.cache.text[style][text];
        }
        TextCanvas.cache.stats.text_misses++;
        TextCanvas.cache.text_count++;

        // Calc and store in cache
        let dpr = Utils.device_pixel_ratio * supersample;
        let str = this.applyTextTransform(text, transform);
        let ctx = this.context;
        let vertical_buffer = this.vertical_text_buffer * dpr;
        let horizontal_buffer = dpr * (stroke_width + this.horizontal_text_buffer);
        let leading = 2 * dpr; // make configurable and/or use Canvas TextMetrics when available
        let line_height = this.px_size + leading; // px_size already in device pixels

        // Parse string into series of lines if it exceeds the text wrapping value or contains line breaks
        let multiline = MultiLine.parse(str, text_wrap, max_lines, line_height, ctx);

        // Final dimensions of text
        let height = multiline.height;
        let width = multiline.width;
        let lines = multiline.lines;

        let collision_size = [
            width / dpr,
            height / dpr
        ];

        let texture_size = [
            width + 2 * horizontal_buffer,
            height + 2 * vertical_buffer
        ];

        let logical_size = [
            texture_size[0] / dpr,
            texture_size[1] / dpr,
        ];

        // Returns lines (w/per-line info for drawing) and text's overall bounding box + canvas size
        TextCanvas.cache.text[style][text] = {
            lines,
            size: { collision_size, texture_size, logical_size, line_height }
        };
        return TextCanvas.cache.text[style][text];
    }

    // Draw multiple lines of text
    drawTextMultiLine (lines, [x, y], size, { stroke, stroke_width = 0, background, transform, align, supersample }, type) {
        // optional background box
        if (background) {
            const texture_size = size.texture_size;
            const dpr = Utils.device_pixel_ratio * supersample;
            const horizontal_buffer = dpr * (this.horizontal_text_buffer + stroke_width);
            const vertical_buffer = dpr * this.vertical_text_buffer;
            const collision_size = size.collision_size;
            const box_buffer = 4 * dpr; // pixel buffer on each side of label box

            this.context.save();
            this.context.fillStyle = background;
            this.context.fillRect(
                x + horizontal_buffer + (type === 'curved' ? texture_size[0] : 0) - box_buffer,
                y + vertical_buffer - box_buffer,
                dpr * collision_size[0] + box_buffer * 2,
                dpr * collision_size[1] + box_buffer * 2
            );
            this.context.restore();
        }

        // draw text
        let height = y;
        for (let line_num=0; line_num < lines.length; line_num++) {
            let line = lines[line_num];
            this.drawTextLine(line, [x, height], size, { stroke, stroke_width, transform, align, supersample }, type);
            height += size.line_height;
        }

        // Draw bounding boxes for debugging
        if (debugSettings.draw_label_collision_boxes) {
            const dpr = Utils.device_pixel_ratio * supersample;
            const horizontal_buffer = dpr * (this.horizontal_text_buffer + stroke_width);
            const vertical_buffer = dpr * this.vertical_text_buffer;
            const collision_size = size.collision_size;
            const lineWidth = 2;

            this.context.save();
            this.context.strokeStyle = 'blue';
            this.context.lineWidth = lineWidth;
            this.context.strokeRect(x + horizontal_buffer, y + vertical_buffer, dpr * collision_size[0], dpr * collision_size[1]);
            if (type === 'curved'){
                this.context.strokeRect(x + size.texture_size[0] + horizontal_buffer, y + vertical_buffer, dpr * collision_size[0], dpr * collision_size[1]);
            }
            this.context.restore();
        }

        if (debugSettings.draw_label_texture_boxes) {
            const texture_size = size.texture_size;
            const lineWidth = 2;

            this.context.save();
            this.context.strokeStyle = 'green';
            this.context.lineWidth = lineWidth;
            // stroke is applied internally, so the outer border is the edge of the texture
            this.context.strokeRect(x + lineWidth, y + lineWidth, texture_size[0] - 2 * lineWidth, texture_size[1] - 2 * lineWidth);
            if (type === 'curved') {
                this.context.strokeRect(x + lineWidth + texture_size[0], y + lineWidth, texture_size[0] - 2 * lineWidth, texture_size[1] - 2 * lineWidth);
            }
            this.context.restore();
        }
    }

    // Draw single line of text at specified location, adjusting for buffer and baseline
    drawTextLine (line, [x, y], size, { stroke, stroke_width = 0, transform, align, supersample }, type) {
        let dpr = Utils.device_pixel_ratio * supersample;
        align = align || 'center';

        let vertical_buffer = this.vertical_text_buffer * dpr;
        let texture_size = size.texture_size;
        let line_height = size.line_height;
        let horizontal_buffer = dpr * (stroke_width + this.horizontal_text_buffer);

        let str = this.applyTextTransform(line.text, transform);

        // Text alignment
        let tx;
        if (align === 'left') {
            tx = x + horizontal_buffer;
        }
        else if (align === 'center') {
            tx = x + texture_size[0]/2 - line.width/2;
        }
        else if (align === 'right') {
            tx = x + texture_size[0] - line.width - horizontal_buffer;
        }

        // In the absence of better Canvas TextMetrics (not supported by browsers yet),
        // 0.75 buffer produces a better approximate vertical centering of text
        let ty = y + vertical_buffer * 0.75 + line_height;

        // Draw stroke and fill separately for curved text. Offset stroke in texture atlas by shift.
        if (stroke && stroke_width > 0) {
            let shift = (type === 'curved') ? texture_size[0] : 0;
            this.context.strokeText(str, tx + shift, ty);
        }
        this.context.fillText(str, tx, ty);
    }

    rasterize (texts, textures, tile_id, texture_prefix, gl) {
        return Task.add({
            type: 'rasterizeLabels',
            run: this.processRasterizeTask.bind(this),
            cancel: this.cancelRasterizeTask.bind(this),
            pause_factor: 2,         // pause 2 frames when task run past allowed time
            user_moving_view: false, // don't run task when user is moving view
            texts,
            textures,
            texture_prefix,
            gl,
            tile_id,
            cursor: {
                styles: Object.keys(texts),
                texts: null,
                style_idx: 0,
                text_idx: null,
                texture_idx: 0,
                texture_resize: true,
                texture_names: []
            }
        });
    }

    processRasterizeTask (task) {
        let { cursor, texts, textures } = task;
        let texture;

        // Rasterize one texture at a time, so we only have to keep one canvas in memory (they can be large)
        while (cursor.texture_idx < task.textures.length) {
            texture = textures[cursor.texture_idx];

            if (cursor.texture_resize) {
                cursor.texture_resize = false;
                this.resize(...texture.texture_size);
            }

            while (cursor.style_idx < cursor.styles.length) {
                let style = cursor.styles[cursor.style_idx];
                if (cursor.text_idx == null) {
                    cursor.text_idx = 0;
                    cursor.texts = Object.keys(texts[style]);
                }

                let text_infos = texts[style];
                let first = true;

                while (cursor.text_idx < cursor.texts.length) {
                    let text = cursor.texts[cursor.text_idx];
                    let text_info = text_infos[text];
                    let text_settings = text_info.text_settings;

                    // set font on first occurence of new font style
                    if (first) {
                        this.setFont(text_settings);
                        first = false;
                    }

                    if (text_settings.can_articulate) {
                        text_info.texcoords = text_info.texcoords || {};
                        for (let t = 0; t < text_info.type.length; t++) {
                            let type = text_info.type[t];
                            if (type === 'straight') {
                                // Only render for current texture
                                if (text_info.textures[t] !== cursor.texture_idx) {
                                    continue;
                                }

                                let word = (text_info.isRTL) ? text.split().reverse().join() : text;
                                let cache = texture.texcoord_cache[style][word];

                                let texcoord;
                                if (cache.texcoord) {
                                    texcoord = cache.texcoord;
                                }
                                else {
                                    let texture_position = cache.texture_position;
                                    let { size, lines } = this.textSize(style, word, text_settings);

                                    this.drawTextMultiLine(lines, texture_position, size, text_settings, type);

                                    texcoord = Texture.getTexcoordsForSprite(
                                        texture_position,
                                        size.texture_size,
                                        texture.texture_size
                                    );

                                    cache.texcoord = texcoord;
                                }

                                text_info.texcoords[type] = {
                                    texcoord,
                                    texture_id: cache.texture_id
                                };
                            }
                            else if (type === 'curved') {
                                let words = text_info.segments;
                                text_info.texcoords.curved = text_info.texcoords.curved || [];
                                text_info.texcoords_stroke = text_info.texcoords_stroke || [];

                                for (let w = 0; w < words.length; w++){
                                    // Only render for current texture
                                    if (text_info.textures[t][w] !== cursor.texture_idx) {
                                        continue;
                                    }

                                    let word = words[w];
                                    let cache = texture.texcoord_cache[style][word];

                                    let texcoord;
                                    let texcoord_stroke;
                                    if (cache.texcoord){
                                        texcoord = cache.texcoord;
                                        texcoord_stroke = cache.texcoord_stroke;
                                        text_info.texcoords_stroke.push(texcoord_stroke);
                                    }
                                    else {
                                        let texture_position = cache.texture_position;
                                        let { size, lines } = this.textSize(style, word, text_settings);

                                        this.drawTextMultiLine(lines, texture_position, size, text_settings, type);

                                        texcoord = Texture.getTexcoordsForSprite(
                                            texture_position,
                                            size.texture_size,
                                            texture.texture_size
                                        );

                                        let texture_position_stroke = [
                                            texture_position[0] + size.texture_size[0],
                                            texture_position[1]
                                        ];

                                        texcoord_stroke = Texture.getTexcoordsForSprite(
                                            texture_position_stroke,
                                            size.texture_size,
                                            texture.texture_size
                                        );

                                        cache.texcoord = texcoord;
                                        cache.texcoord_stroke = texcoord_stroke;

                                        // NB: texture_id is the same between stroke and fill, so it's not duplicated here
                                        text_info.texcoords_stroke.push(texcoord_stroke);
                                    }

                                    text_info.texcoords.curved.push({
                                        texcoord,
                                        texture_id: cache.texture_id
                                    });
                                }
                            }
                        }
                    }
                    else {
                        let lines = this.textSize(style, text, text_settings).lines;
                        const aligned_text_settings = { ...text_settings };

                        for (let align in text_info.align) {
                            // Only render for current texture
                            if (text_info.align[align].texture_id !== cursor.texture_idx) {
                                continue;
                            }

                            aligned_text_settings.align = align;
                            this.drawTextMultiLine(lines, text_info.align[align].texture_position, text_info.size, aligned_text_settings);

                            text_info.align[align].texcoords = Texture.getTexcoordsForSprite(
                                text_info.align[align].texture_position,
                                text_info.size.texture_size,
                                texture.texture_size
                            );
                        }
                    }

                    cursor.text_idx++;

                    if (!Task.shouldContinue(task)) {
                        return false;
                    }
                }
                cursor.text_idx = null;
                cursor.style_idx++;
            }

            // Create GL texture (canvas element will be reused for next texture)
            let tname = task.texture_prefix + cursor.texture_idx;
            Texture.create(task.gl, tname, {
                element: this.canvas,
                filtering: 'linear',
                UNPACK_PREMULTIPLY_ALPHA_WEBGL: true
            });
            Texture.retain(tname);
            cursor.texture_names.push(tname);

            cursor.texture_idx++;
            cursor.texture_resize = true;
            cursor.style_idx = 0;
        }

        Task.finish(task, cursor.texture_names);
        return true;
    }

    // Free any textures that have been allocated part-way through label rasterization for a tile
    cancelRasterizeTask (task) {
        log('trace', `RasterizeTask: release textures [${task.cursor.texture_names.join(', ')}]`);
        task.cursor.texture_names.forEach(t => Texture.release(t));
    }

    // Place text labels within an atlas of the given max size
    setTextureTextPositions (texts, max_texture_size) {
        let texture = {
                cx: 0,
                cy: 0,
                width: 0,
                height: 0,
                column_width: 0,
                texture_id: 0,
                texcoord_cache: {}
            },
            textures = [];

        for (let style in texts) {
            let text_infos = texts[style];

            for (let text in text_infos) {
                let text_info = text_infos[text];
                let texture_position;

                if (text_info.text_settings.can_articulate) {
                    text_info.textures = [];
                    texture.texcoord_cache[style] = texture.texcoord_cache[style] || {};

                    for (let t = 0; t < text_info.type.length; t++) {
                        let type = text_info.type[t];

                        if (type === 'straight') {
                            let word = (text_info.isRTL) ? text.split().reverse().join() : text;

                            if (!texture.texcoord_cache[style][word]) {
                                let size = text_info.size.texture_size;
                                texture_position = this.placeText(size[0], size[1], style, texture, textures, max_texture_size);
                                texture.texcoord_cache[style][word] = {
                                    texture_id: texture.texture_id,
                                    texture_position
                                };
                            }

                            text_info.textures[t] = texture.texture_id;
                        }
                        else if (type === 'curved') {
                            text_info.textures[t] = [];

                            for (let w = 0; w < text_info.segment_sizes.length; w++) {
                                let word = text_info.segments[w];

                                if (!texture.texcoord_cache[style][word]) {
                                    let size = text_info.segment_sizes[w].texture_size;
                                    let width = 2 * size[0]; // doubled to account for side-by-side rendering of fill and stroke
                                    texture_position = this.placeText(width, size[1], style, texture, textures, max_texture_size);
                                    texture.texcoord_cache[style][word] = {
                                        texture_id: texture.texture_id,
                                        texture_position
                                    };
                                }

                                text_info.textures[t].push(texture.texture_id);
                            }

                        }
                    }
                }
                else {
                    // rendered size is same for all alignments
                    let size = text_info.size.texture_size;

                    // but each alignment needs to be rendered separately
                    for (let align in text_info.align) {
                        texture_position = this.placeText (size[0], size[1], style, texture, textures, max_texture_size);
                        text_info.align[align].texture_id = texture.texture_id;
                        text_info.align[align].texture_position = texture_position;
                    }
                }
            }
        }

        // save final texture
        if (texture.column_width > 0 && texture.height > 0) {
            textures[texture.texture_id] = {
                texture_size: [texture.width, texture.height],
                texcoord_cache: texture.texcoord_cache
            };
        }

        // return computed texture sizes and UV cache
        return textures;
    }

    // Place text sprite in texture atlas, enlarging current texture, or starting new one if max texture size reached
    placeText (text_width, text_height, style, texture, textures, max_texture_size) {
        let texture_position;

        // TODO: what if first label is wider than entire max texture?

        if (texture.cy + text_height > max_texture_size) {
            // start new column
            texture.cx += texture.column_width;
            texture.cy = 0;
            texture.column_width = text_width;
        }
        else {
            // expand current column
            texture.column_width = Math.max(texture.column_width, text_width);
        }

        if (texture.cx + texture.column_width <= max_texture_size) {
            // add label to current texture
            texture_position = [texture.cx, texture.cy];

            texture.cy += text_height;

            // expand texture if needed
            texture.height = Math.max(texture.height, texture.cy);
            texture.width = Math.max(texture.width, texture.cx + texture.column_width);
        }
        else {
            // start new texture
            // save size and cache of last texture
            textures[texture.texture_id] = {
                texture_size: [texture.width, texture.height],
                texcoord_cache: texture.texcoord_cache
            };
            texture.texcoord_cache = {}; // reset cache
            texture.texcoord_cache[style] = {};

            texture.texture_id++;
            texture.cx = 0;
            texture.cy = text_height;
            texture.column_width = text_width;
            texture.width = text_width;
            texture.height = text_height;
            texture_position = [0, 0]; // TODO: allocate zero array once
        }

        return texture_position;
    }

    // Called before rasterization
    applyTextTransform (text, transform) {
        if (transform === 'capitalize') {
            return text.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1);
            });
        }
        else if (transform === 'uppercase') {
            return text.toUpperCase();
        }
        else if (transform === 'lowercase') {
            return text.toLowerCase();
        }
        return text;
    }

    // Convert font CSS-style size ('12px', '14pt', '1.5em', etc.) to pixel size (adjusted for device pixel ratio)
    // Defaults units to pixels if not specified
    static fontPixelSize (size) {
        if (size == null) {
            return;
        }
        size = (typeof size === 'string') ? size : String(size); // need a string for regex

        let [, px_size, units] = size.match(TextCanvas.font_size_re) || [];
        units = units || 'px';

        if (units === 'em') {
            px_size *= 16;
        } else if (units === 'pt') {
            px_size /= 0.75;
        } else if (units === '%') {
            px_size /= 6.25;
        }

        px_size = StyleParser.parsePositiveNumber(px_size);
        px_size *= Utils.device_pixel_ratio;
        return px_size;
    }

    static pruneTextCache () {
        if (TextCanvas.cache.text_count > TextCanvas.cache.text_count_max) {
            TextCanvas.cache.text = {};
            TextCanvas.cache.text_count = 0;
            log('debug', 'TextCanvas: pruning text cache');
        }

        if (Object.keys(TextCanvas.cache.segment).length > TextCanvas.cache.segment_count_max) {
            TextCanvas.cache.segment = {};
            log('debug', 'TextCanvas: pruning segment cache');
        }
    }

}

// Extract font size and units
TextCanvas.font_size_re = /((?:[0-9]*\.)?[0-9]+)\s*(px|pt|em|%)?/;

// Cache sizes of rendered text
TextCanvas.cache = {
    text: {},                   // size and line parsing, by text style, then text string
    text_count: 0,              // current size of cache (measured as # of entries)
    text_count_max: 2000,       // prune cache when it exceeds this size
    segment: {},                // segmentation of text (by run of characters or grapheme clusters), by text string
    segment_count_max: 2000,    // prune cache when it exceeds this size
    stats: { text_hits: 0, text_misses: 0, segment_hits: 0, segment_misses: 0 }
};

