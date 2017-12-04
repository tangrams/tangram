import log from '../../utils/log';
import Utils from '../../utils/utils';
import Texture from '../../gl/texture';
import FontManager from './font_manager';
import Task from '../../utils/task';
import StyleParser from '../style_parser';
import debugSettings from '../../utils/debug_settings';

export default class CanvasText {

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

    textSizes (tile_id, texts) {
        return FontManager.loadFonts().then(() => {
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
                        let segments = splitLabelText(text, rtl);
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

        Task.finish(task, { texts });
        return true;
    }

    // Computes width and height of text based on current font style
    // Includes word wrapping, returns size info for whole text block and individual lines
    textSize (style, text, {transform, text_wrap, max_lines, stroke_width = 0, supersample}) {
        // Check cache first
        CanvasText.cache.text[style] = CanvasText.cache.text[style] || {};
        if (CanvasText.cache.text[style][text]) {
            CanvasText.cache.stats.text_hits++;
            return CanvasText.cache.text[style][text];
        }
        CanvasText.cache.stats.text_misses++;
        CanvasText.cache.text_count++;

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
        CanvasText.cache.text[style][text] = {
            lines,
            size: { collision_size, texture_size, logical_size, line_height }
        };
        return CanvasText.cache.text[style][text];
    }

    // Draw multiple lines of text
    drawTextMultiLine (lines, [x, y], size, { stroke, stroke_width = 0, transform, align, supersample }, type) {
        let line_height = size.line_height;
        let height = y;
        for (let line_num=0; line_num < lines.length; line_num++) {
            let line = lines[line_num];
            this.drawTextLine(line, [x, height], size, { stroke, stroke_width, transform, align, supersample }, type);
            height += line_height;
        }

        // Draw bounding boxes for debugging
        if (debugSettings.draw_label_collision_boxes) {
            this.context.save();

            let dpr = Utils.device_pixel_ratio * supersample;
            let horizontal_buffer = dpr * (this.horizontal_text_buffer + stroke_width);
            let vertical_buffer = dpr * this.vertical_text_buffer;
            let collision_size = size.collision_size;
            let lineWidth = 2;

            this.context.strokeStyle = 'blue';
            this.context.lineWidth = lineWidth;
            this.context.strokeRect(x + horizontal_buffer, y + vertical_buffer, dpr * collision_size[0], dpr * collision_size[1]);
            if (type === 'curved'){
                this.context.strokeRect(x + size.texture_size[0] + horizontal_buffer, y + vertical_buffer, dpr * collision_size[0], dpr * collision_size[1]);
            }

            this.context.restore();
        }

        if (debugSettings.draw_label_texture_boxes) {
            this.context.save();

            let texture_size = size.texture_size;
            let lineWidth = 2;

            this.context.strokeStyle = 'green';
            this.context.lineWidth = lineWidth;
            // stroke is applied internally, so the outer border is the edge of the texture
            this.context.strokeRect(x + lineWidth, y + lineWidth, texture_size[0] - 2 * lineWidth, texture_size[1] - 2 * lineWidth);

            if (type === 'curved'){
                this.context.strokeRect(x + lineWidth + size.texture_size[0], y + lineWidth, texture_size[0] - 2 * lineWidth, texture_size[1] - 2 * lineWidth);
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

                    if (text_settings.can_articulate){
                        text_info.texcoords = text_info.texcoords || {};
                        for (let t = 0; t < text_info.type.length; t++){

                            let type = text_info.type[t];
                            switch (type){
                                case 'straight':
                                    // Only render for current texture
                                    if (text_info.textures[t] !== cursor.texture_idx) {
                                        continue;
                                    }

                                    let word = (text_info.isRTL) ? text.split().reverse().join() : text;
                                    let cache = texture.texcoord_cache[style][word];

                                    let texcoord;
                                    if (cache.texcoord){
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

                                    break;

                                case 'curved':
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
                                    break;
                            }
                        }
                    }
                    else {
                        let lines = this.textSize(style, text, text_settings).lines;

                        for (let align in text_info.align) {
                            // Only render for current texture
                            if (text_info.align[align].texture_id !== cursor.texture_idx) {
                                continue;
                            }

                            this.drawTextMultiLine(lines, text_info.align[align].texture_position, text_info.size, {
                                stroke: text_settings.stroke,
                                stroke_width: text_settings.stroke_width,
                                transform: text_settings.transform,
                                supersample: text_settings.supersample,
                                align: align
                            });

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

        Task.finish(task, { textures: cursor.texture_names });
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

                if (text_info.text_settings.can_articulate){
                    text_info.textures = [];
                    texture.texcoord_cache[style] = texture.texcoord_cache[style] || {};

                    for (let t = 0; t < text_info.type.length; t++){
                        let type = text_info.type[t];

                        switch (type){
                            case 'straight':
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

                                break;

                            case 'curved':
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

                                break;
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
        return Promise.resolve({ textures });
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

        let [, px_size, units] = size.match(CanvasText.font_size_re) || [];
        units = units || 'px';

        if (units === "em") {
            px_size *= 16;
        } else if (units === "pt") {
            px_size /= 0.75;
        } else if (units === "%") {
            px_size /= 6.25;
        }

        px_size = StyleParser.parsePositiveNumber(px_size);
        px_size *= Utils.device_pixel_ratio;
        return px_size;
    }

    static pruneTextCache () {
        if (CanvasText.cache.text_count > CanvasText.cache.text_count_max) {
            CanvasText.cache.text = {};
            CanvasText.cache.text_count = 0;
            log('debug', 'CanvasText: pruning text cache');
        }

        if (Object.keys(CanvasText.cache.segment).length > CanvasText.cache.segment_count_max) {
            CanvasText.cache.segment = {};
            log('debug', 'CanvasText: pruning segment cache');
        }
    }

}

// Extract font size and units
CanvasText.font_size_re = /((?:[0-9]*\.)?[0-9]+)\s*(px|pt|em|%)?/;

// Cache sizes of rendered text
CanvasText.cache = {
    text: {},                   // size and line parsing, by text style, then text string
    text_count: 0,              // current size of cache (measured as # of entries)
    text_count_max: 2000,       // prune cache when it exceeds this size
    segment: {},                // segmentation of text (by run of characters or grapheme clusters), by text string
    segment_count_max: 2000,    // prune cache when it exceeds this size
    stats: { text_hits: 0, text_misses: 0, segment_hits: 0, segment_misses: 0 }
};

// Right-to-left / bi-directional text handling
// Taken from http://stackoverflow.com/questions/12006095/javascript-how-to-check-if-character-is-rtl
const rtlDirCheck = new RegExp('[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]');
function isTextRTL(s){
    return rtlDirCheck.test(s);
}

const neutral_chars = '\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00BF\u00D7\u00F7\u02B9-\u02FF\u2000-\u2BFF\u2010-\u2029\u202C\u202F-\u2BFF';
const neutralDirCheck = new RegExp('['+neutral_chars+']+');
function isTextNeutral(s){
    return neutralDirCheck.test(s);
}

const markRTL = '\u200F'; // explicit right-to-left marker

// test http://localhost:8000/#16.72917/30.08541/31.28466
const arabic_range = new RegExp('^['+neutral_chars+'\u0600-\u06FF]+'); // all characters are Arabic or neutral
const arabic_splitters = new RegExp('['+neutral_chars+'\u0622-\u0625\u0627\u062F-\u0632\u0648\u0671-\u0677\u0688-\u0699\u06C4-\u06CB\u06CF\u06D2\u06D3\u06EE\u06EF]');
const arabic_vowels = new RegExp('^[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]+');
const accents_and_vowels = "[\u0300-\u036F" + // Combining Diacritical Marks
"\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7" + // Hebrew
"\u07A6-\u07B0" + // Thaana
"\u0900-\u0903\u093A-\u094C\u094E\u094F\u0951-\u0957\u0962\u0963" + // Devanagari
"\u0981-\u0983\u09BC\u09BE-\u09CC\u09D7\u09E2\u09E3" + // Bengali
"\u0A01-\u0A03\u0A3C-\u0A4C\u0A51" + // Gurmukhi
"\u0A81-\u0A83\u0ABC\u0ABE-\u0ACC\u0AE2\u0AE3" + // Gujarati
"\u0B01-\u0B03\u0B3C\u0B3E-\u0B4C\u0B56\u0B57\u0B62\u0B63" + // Oriya
"\u0B82\u0BBE-\u0BCD\u0BD7" + // Tamil
"\u0C00-\u0C03\u0C3E-\u0C4C\u0C55\u0C56\u0C62\u0C63" + // Telugu
"\u0C81-\u0C83\u0CBC\u0CBE-\u0CCC\u0CD5\u0CD6\u0CE2\u0CE3" + // Kannada
"\u0D01-\u0D03\u0D3E-\u0D4C\u0D4E\u0D57\u0D62\u0D63" + // Malayalam
"\u0D82\u0D83\u0DCA-\u0DDF\u0DF2\u0DF3" + // Sinhala
"\u0E31\u0E34-\u0E3A\u0E47-\u0E4E" + // Thai
"\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECD" + // Lao
"\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F83\u0F86\u0F87\u0F8D-\u0FBC\u0FC6" + // Tibetan
"\u102B-\u1038\u103A-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D" + // Burmese
"\u17B4-\u17D1\u17D3" + // Khmer
"\u1A55-\u1A5E\u1A61-\u1A7C" + // Tai Tham
"\u1DC0-\u1DFF" + // Combining Diacritical Marks Supplement
"\u20D0-\u20FF" + // Combining Diacritical Marks for Symbols
"]";
const combo_characters = "[\u094D\u09CD\u0A4D\u0ACD\u0B4D\u0C4D\u0CCD\u0D4D\u0F84\u1039\u17D2\u1A60\u1A7F]";
const graphemeRegex = new RegExp("^.(?:" + accents_and_vowels + "+)?" + "(" + combo_characters + "\\W(?:" + accents_and_vowels + "+)?)*");

// Scripts that cannot be curved due (due to contextual shaping and/or layout complexity)
const curve_blacklist = {
    Mongolian: "\u1800-\u18AF"
};
const curve_blacklist_range = Object.keys(curve_blacklist).map(r => curve_blacklist[r]).join('');
const curve_blacklist_test = new RegExp('['+curve_blacklist_range+']');
function isTextCurveBlacklisted(s){
    return curve_blacklist_test.test(s);
}

// Splitting strategy for chopping a label into segments
const default_segment_length = 2; // character length of each segment when dividing up label text

function splitLabelText(text, rtl){
    // Use single-character segments for RTL, to avoid additional handling for neutral characters
    // (see https://github.com/tangrams/tangram/issues/541)
    const segment_length = rtl ? 1 : default_segment_length;

    if (text.length < segment_length) {
        return [text];
    }

    let key = text;
    if (CanvasText.cache.segment[key]) {
        CanvasText.cache.stats.segment_hits++;
        return CanvasText.cache.segment[key];
    }

    let segments = [];

    if (arabic_range.exec(text)) {
        segments = text.split(arabic_splitters);
        let offset = -1;
        for (var s = 0; s < segments.length - 1; s++) {
            if (s > 0) {
                let carryoverVowels = arabic_vowels.exec(segments[s]);
                if (carryoverVowels) {
                    segments[s] = segments[s].substring(carryoverVowels[0].length);
                    segments[s - 1] += carryoverVowels[0];
                    offset += carryoverVowels[0].length;
                }
            }
            offset += 1 + segments[s].length;
            segments[s] += text.slice(offset, offset + 1);
        }
        text = "";
    }

    while (text.length){
        let segment = '';
        let testText = text;
        let graphemeCount = 0;

        for (graphemeCount; graphemeCount < segment_length && testText.length; graphemeCount++) {
            let graphemeCluster = (graphemeRegex.exec(testText) || testText)[0];
            segment += graphemeCluster;
            testText = testText.substring(graphemeCluster.length);
        }

        segments.push(segment);
        text = text.substring(segment.length);
    }

    if (rtl) {
        segments.reverse();
    }

    CanvasText.cache.stats.segment_misses++;
    CanvasText.cache.segment[key] = segments;
    return segments;
}

// Private class to arrange text labels into multiple lines based on
// "text wrap" and "max line" values
class MultiLine {
    constructor (context, max_lines = Infinity, text_wrap = Infinity) {
        this.width = 0;
        this.height = 0;
        this.lines = [];

        this.max_lines = max_lines;
        this.text_wrap = text_wrap;
        this.context = context;
    }

    createLine (line_height){
        if (this.lines.length < this.max_lines){
            return new Line(line_height, this.text_wrap);
        }
        else {
            return false;
        }
    }

    push (line){
        if (this.lines.length < this.max_lines){
            // measure line width
            let line_width = this.context.measureText(line.text).width;
            line.width = line_width;

            if (line_width > this.width){
                this.width = Math.ceil(line_width);
            }

            // add to lines and increment height
            this.lines.push(line);
            this.height += line.height;
            return true;
        }
        else {
            this.addEllipsis();
            return false;
        }
    }

    // pushes to the lines array and returns a new line if possible (false otherwise)
    advance (line, line_height) {
        let can_push = this.push(line);
        if (can_push){
            return this.createLine(line_height);
        }
        else {
            return false;
        }
    }

    addEllipsis (){
        let last_line = this.lines[this.lines.length - 1];
        let ellipsis_width = Math.ceil(this.context.measureText(MultiLine.ellipsis).width);

        last_line.append(MultiLine.ellipsis);
        last_line.width += ellipsis_width;

        if (last_line.width > this.width) {
            this.width = last_line.width;
        }
    }

    finish (line){
        if (line){
            this.push(line);
        }
        else {
            this.addEllipsis();
        }
    }

    static parse (str, text_wrap, max_lines, line_height, ctx) {
        // Word wrapping
        // Line breaks can be caused by:
        //  - implicit line break when a maximum character threshold is exceeded per line (text_wrap)
        //  - explicit line break in the label text (\n)
        let words;
        if (typeof text_wrap === 'number') {
            words = str.split(' '); // split words on spaces
        }
        else {
            words = [str]; // no max line word wrapping (but new lines will still be in effect)
        }

        let multiline = new MultiLine(ctx, max_lines, text_wrap);
        let line = multiline.createLine(line_height);

        // First iterate on space-break groups (will be one if max line length off), then iterate on line-break groups
        for (let i = 0; i < words.length; i++) {
            let breaks = words[i].split('\n'); // split on line breaks
            let new_line = (i === 0) ? true : false;

            for (let n=0; n < breaks.length; n++) {
                if (!line){
                    break;
                }

                let word = breaks[n];

                // force punctuation (neutral chars) at the end of a RTL line, so they stay attached to original word
                if (isTextRTL(word) && isTextNeutral(word[word.length - 1])) {
                    word += markRTL;
                }

                let spaced_word = (new_line) ? word : ' ' + word;

                // if adding current word would overflow, add a new line instead
                // first word (i === 0) always appends
                if (text_wrap && i > 0 && line.exceedsTextwrap(spaced_word)) {
                    line = multiline.advance(line, line_height);
                    if (!line){
                        break;
                    }
                    line.append(word);
                    new_line = true;
                }
                else {
                    line.append(spaced_word);
                }

                // if line breaks present, add new line (unless on last line)
                if (n < breaks.length - 1) {
                    line = multiline.advance(line, line_height);
                    new_line = true;
                }
            }

            if (i === words.length - 1){
                multiline.finish(line);
            }
        }
        return multiline;
    }
}

MultiLine.ellipsis = '...';

// A Private class used by MultiLine to contain the logic for a single line
// including character count, width, height and text
class Line {
    constructor (height = 0, text_wrap = 0){
        this.chars = 0;
        this.text = '';

        this.height = Math.ceil(height);
        this.text_wrap = text_wrap;
    }

    append (text){
        this.chars += text.length;
        this.text += text;
    }

    exceedsTextwrap (text){
        return text.length + this.chars > this.text_wrap;
    }
}
