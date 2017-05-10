import log from '../../utils/log';
import Utils from '../../utils/utils';
import Texture from '../../gl/texture';
import FontManager from './font_manager';
import debugSettings from '../../utils/debug_settings';

const codon_length = 2; // length of chunks when breaking up label text

export default class CanvasText {

    constructor () {
        this.canvas = document.createElement('canvas');
        this.canvas.style.backgroundColor = 'transparent'; // render text on transparent background
        this.context = this.canvas.getContext('2d');
        this.vertical_text_buffer = 8; // vertical pixel padding around text
        this.horizontal_text_buffer = 4; // text styling such as italic emphasis is not measured by the Canvas API, so padding is necessary
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

    textSizes (texts) {
        let dpr;
        return FontManager.loadFonts().then(() => {
            for (let style in texts) {
                CanvasText.initTextCache(style);

                let text_infos = texts[style];
                let first = true;

                for (let text in text_infos) {
                    let text_info = text_infos[text];
                    let text_settings = text_info.text_settings;

                    if (first) {
                        this.setFont(text_settings);
                        dpr = Utils.device_pixel_ratio * text_settings.supersample;
                        first = false;
                    }

                    if (text_settings.can_articulate){
                        let words = text.split(' ');

                        // RTL is true if every word is RTL
                        // BIDI is true if there is RTL and LTR
                        let hasRTL = false;
                        let hasLTR = false;
                        let bidi = false;
                        for (var i = 0; i < words.length; i++){
                            if (isTextRTL(words[i])) {
                                if (hasLTR){
                                    bidi = true;
                                    break;
                                }
                                hasRTL = true;
                            }
                            else {
                                if (hasRTL){
                                    bidi = true;
                                    break;
                                }
                                hasLTR = true;
                            }
                        }

                        let rtl = (hasRTL && !hasLTR) && !bidi;
                        let shaped = isTextShaped(text);

                        text_info.isRTL = rtl;
                        text_info.no_curving = bidi || shaped; // used in LabelLine to prevent curved labels
                        text_info.vertical_buffer = this.vertical_text_buffer;
                        text_info.size = [];

                        if (!text_info.no_curving) {
                            let segments = splitLabelText(text, rtl);
                            if (rtl) {
                                segments.reverse();
                            }

                            text_info.segments = segments;
                            for (let i = 0; i < segments.length; i++){
                                text_info.size.push(this.textSize(style, segments[i], text_settings).size);
                            }
                        }

                        // add full text as well
                        text_info.total_size = this.textSize(style, text, text_settings).size;
                    }
                    else {
                        // Only send text sizes back to worker (keep computed text line info
                        // on main thread, for future rendering)
                        text_info.size = this.textSize(style, text, text_settings).size;
                    }
                }
            }

            return texts;
        });
    }

    // Computes width and height of text based on current font style
    // Includes word wrapping, returns size info for whole text block and individual lines
    textSize (style, text, {transform, text_wrap, max_lines, stroke_width = 0, supersample}) {
        // Check cache first
        if (CanvasText.text_cache[style][text]) {
            CanvasText.cache_stats.hits++;
            return CanvasText.text_cache[style][text];
        }
        CanvasText.cache_stats.misses++;
        CanvasText.text_cache_count++;

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
        CanvasText.text_cache[style][text] = {
            lines,
            size: { collision_size, texture_size, logical_size, line_height }
        };
        return CanvasText.text_cache[style][text];
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

    rasterize (texts, texture_size, tile_key) {
        for (let style in texts) {
            let text_infos = texts[style];
            let first = true;

            for (let text in text_infos) {
                let text_info = text_infos[text];
                let text_settings = text_info.text_settings;

                // set font on first occurence of new font style
                if (first) {
                    this.setFont(text_settings);
                    first = false;
                }

                if (text_settings.can_articulate){
                    let words = text_info.segments;

                    text_info.texcoords = {};
                    for (let i = 0; i < text_info.type.length; i++){

                        let type = text_info.type[i];
                        switch (type){
                            case 'straight':
                                let word = (text_info.isRTL) ? text.split().reverse().join() : text;
                                let texcoord;

                                if (CanvasText.texcoord_cache[tile_key][style][word].texcoord){
                                    texcoord = CanvasText.texcoord_cache[tile_key][style][word].texcoord;
                                }
                                else {
                                    let texture_position = CanvasText.texcoord_cache[tile_key][style][word].texture_position;
                                    let size = CanvasText.text_cache[style][word].size;
                                    let line = CanvasText.text_cache[style][word].lines;

                                    this.drawTextMultiLine(line, texture_position, size, text_settings, type);

                                    texcoord = Texture.getTexcoordsForSprite(
                                        texture_position,
                                        size.texture_size,
                                        texture_size
                                    );

                                    CanvasText.texcoord_cache[tile_key][style][word].texcoord = texcoord;
                                }

                                text_info.texcoords[type] = texcoord;
                                break;
                            case 'curved':
                                text_info.texcoords.curved = [];
                                text_info.texcoords_stroke = [];
                                for (let i = 0; i < words.length; i++){
                                    let word = words[i];
                                    let texcoord;
                                    let texcoord_stroke;

                                    if (CanvasText.texcoord_cache[tile_key][style][word].texcoord){
                                        texcoord = CanvasText.texcoord_cache[tile_key][style][word].texcoord;
                                        texcoord_stroke = CanvasText.texcoord_cache[tile_key][style][word].texcoord_stroke;

                                        text_info.texcoords_stroke.push(texcoord_stroke);
                                    }
                                    else {
                                        let texture_position = CanvasText.texcoord_cache[tile_key][style][word].texture_position;
                                        let size = CanvasText.text_cache[style][word].size;
                                        let line = CanvasText.text_cache[style][word].lines;

                                        this.drawTextMultiLine(line, texture_position, size, text_settings, type);

                                        texcoord = Texture.getTexcoordsForSprite(
                                            texture_position,
                                            size.texture_size,
                                            texture_size
                                        );

                                        let texture_position_stroke = [
                                            texture_position[0] + size.texture_size[0],
                                            texture_position[1]
                                        ];

                                        texcoord_stroke = Texture.getTexcoordsForSprite(
                                            texture_position_stroke,
                                            size.texture_size,
                                            texture_size
                                        );

                                        CanvasText.texcoord_cache[tile_key][style][word].texcoord = texcoord;
                                        CanvasText.texcoord_cache[tile_key][style][word].texcoord_stroke = texcoord_stroke;

                                        text_info.texcoords_stroke.push(texcoord_stroke);
                                    }

                                    text_info.texcoords.curved.push(texcoord);
                                }
                                break;
                        }
                    }
                }
                else {
                    let lines = CanvasText.text_cache[style][text].lines; // get previously computed lines of text
                    for (let align in text_info.align) {
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
                            texture_size
                        );
                    }
                }
            }
        }
        CanvasText.clearTexcoordCache(tile_key);
    }

    // Place text labels within an atlas of the given max size
    setTextureTextPositions (texts, max_texture_size, tile_key) {
        CanvasText.clearTexcoordCache(tile_key);
        CanvasText.texcoord_cache[tile_key] = {};

        // Keep track of column width
        let column_width = 0;

        // Layout labels, stacked in columns
        let cx = 0, cy = 0; // current x/y position in atlas
        let height = 0;     // overall atlas height
        for (let style in texts) {
            if (!CanvasText.texcoord_cache[tile_key][style]) {
               CanvasText.texcoord_cache[tile_key][style] = {};
            }

            let text_infos = texts[style];

            for (let text in text_infos) {
                let text_info = text_infos[text];

                if (text_info.text_settings.can_articulate){
                    let texture_position;

                    for (let i = 0; i < text_info.type.length; i++){
                        let type = text_info.type[i];
                        switch (type){
                            case 'straight':
                                let size = text_info.total_size.texture_size;
                                let word = (text_info.isRTL) ? text.split().reverse().join() : text;

                                if (size[0] > column_width) {
                                    column_width = size[0];
                                }
                                if (cy + size[1] < max_texture_size) {
                                    texture_position = [cx, cy];

                                    cy += size[1];
                                    if (cy > height) {
                                        height = cy;
                                    }
                                }
                                else { // start new column if taller than texture
                                    cx += column_width;
                                    column_width = 0;
                                    cy = 0;
                                    texture_position = [cx, cy];
                                }

                                CanvasText.texcoord_cache[tile_key][style][word] = {
                                    texture_position: texture_position
                                };
                                break;
                            case 'curved':
                                for (let i = 0; i < text_info.size.length; i++) {
                                    let word = text_info.segments[i];

                                    if (!CanvasText.texcoord_cache[tile_key][style][word]) {

                                        let size = text_info.size[i].texture_size;
                                        let width = 2 * size[0];
                                        if (width > column_width) {
                                            column_width = width;
                                        }
                                        if (cy + size[1] < max_texture_size) {
                                            texture_position = [cx, cy];

                                            cy += size[1];
                                            if (cy > height) {
                                                height = cy;
                                            }
                                        }
                                        else { // start new column if taller than texture
                                            cx += column_width;
                                            column_width = 0;
                                            cy = 0;
                                            texture_position = [cx, cy];
                                        }

                                        CanvasText.texcoord_cache[tile_key][style][word] = {
                                            texture_position: texture_position
                                        };
                                    }
                                }
                                break;
                        }
                    }
                }
                else {
                    // rendered size is same for all alignments
                    let size = text_info.size.texture_size;
                    if (size[0] > column_width) {
                        column_width = size[0];
                    }

                    // but each alignment needs to be rendered separately
                    for (let align in text_info.align) {
                        if (cy + size[1] < max_texture_size) {
                            text_info.align[align].texture_position = [cx, cy]; // add label to current column
                            cy += size[1];
                            if (cy > height) {
                                height = cy;
                            }
                        }
                        else { // start new column if taller than texture
                            cx += column_width;
                            column_width = 0;
                            cy = 0;
                            text_info.align[align].texture_position = [cx, cy];
                        }
                    }
                }
            }
        }

        return [cx + column_width, height]; // overall atlas size
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

        px_size = parseFloat(px_size);
        px_size *= Utils.device_pixel_ratio;
        return px_size;
    }

    static clearTexcoordCache (tile_key) {
        delete CanvasText.texcoord_cache[tile_key];
    }

    static initTextCache (style) {
        CanvasText.text_cache[style] = CanvasText.text_cache[style] || {};
    }

    static pruneTextCache () {
        if (CanvasText.text_cache_count > CanvasText.text_cache_count_max) {
            CanvasText.text_cache = {};
            CanvasText.text_cache_count = 0;
            log('debug', 'CanvasText: pruning text cache');
        }

        if (Object.keys(CanvasText.segment_cache).length > CanvasText.segment_cache_count_max) {
            CanvasText.segment_cache = {};
            log('debug', 'CanvasText: pruning segment cache');
        }
    }

}

// Extract font size and units
CanvasText.font_size_re = /((?:[0-9]*\.)?[0-9]+)\s*(px|pt|em|%)?/;

// Cache sizes of rendered text
CanvasText.text_cache = {}; // by text style, then text string
CanvasText.text_cache_count = 0;     // current size of cache (measured as # of entries)
CanvasText.text_cache_count_max = 4000; // prune cache when it exceeds this size
CanvasText.cache_stats = { hits: 0, misses: 0 };
CanvasText.texcoord_cache = {};

// Contextual Shaping Languages - Unicode ranges
const context_langs = {
    Arabic: "\u0600-\u06FF",
    Bengali: "\u0980-\u09FF",
    Devanagari: "\u0900-\u097F",
    Mongolian: "\u1800-\u18AF",
    Tibetan: "\u0F00-\u0FFF"
};

const accents_and_vowels = "[:\u0300-\u036F" + // Combining Diacritical Marks
"\u0A01-\u0A03\u0A3C-\u0A4C\u0A51" + // Gurmukhi
"\u0A81-\u0A83\u0ABC\u0ABE-\u0ACC\u0AE2\u0AE3" + // Gujarati
"\u0B01-\u0B03\u0B3C\u0B3E-\u0B4C\u0B56\u0B57\u0B62\u0B63" + // Oriya
"\u0B82\u0BBE-\u0BCD\u0BD7" + // Tamil
"\u0C00-\u0C03\u0C3E-\u0C4C\u0C55\u0C56\u0C62\u0C63" + // Telugu
"\u0D82\u0D83\u0DCA-\u0DDF\u0DF2\u0DF3" + // Sinhala
"\u102B-\u1038\u103A-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D" + // Burmese
"\u1A55-\u1A5E\u1A61-\u1A7C" + // Tai Tham
"\u1DC0-\u1DFF" + // Combining Diacritical Marks Supplement
"\u20D0-\u20FF" + // Combining Diacritical Marks for Symbols
"\u17B4-\u17D1\u17D3" + // Khmer
"\u0C80-\u0C83\u0CBC\u0CBE-\u0CCC\u0CD5\u0CD6\u0CE2\u0CE3" + // Kannada
"\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECD" + // Lao
"]";
const combo_characters = "[\u094D\u09CD\u1039\u17D2\u0A4D\u0ACD\u0C4D\u0CCD\u0B4D\u1A60\u1A7F\u0DCA]";
const graphemeRegex = new RegExp("^.(?:" + accents_and_vowels + "+)?" + "(" + combo_characters + "\\W(?:" + accents_and_vowels + "+)?)?");

let reg_ex_shaping = '[';
for (let key in context_langs){
    reg_ex_shaping += context_langs[key];
}
reg_ex_shaping += ']';

let shaping_test = new RegExp(reg_ex_shaping);

function isTextShaped(s){
    return shaping_test.test(s);
}

// Right-to-left / bi-directional text handling
// Taken from http://stackoverflow.com/questions/12006095/javascript-how-to-check-if-character-is-rtl
const rtlDirCheck = new RegExp('^[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00BF\u00D7\u00F7\u02B9-\u02FF\u2000-\u2BFF\u2010-\u2029\u202C\u202F-\u2BFF\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]+$');
function isTextRTL(s){
    return rtlDirCheck.test(s);
}

const neutralDirCheck = new RegExp('[\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00BF\u00D7\u00F7\u02B9-\u02FF\u2000-\u2BFF\u2010-\u2029\u202C\u202F-\u2BFF]$');
function isTextNeutral(s){
    return neutralDirCheck.test(s);
}

const markRTL = '\u200F'; // explicit right-to-left marker

CanvasText.segment_cache = {};
CanvasText.segment_cache_count_max = 1000;
CanvasText.cache_stats.segment_hits = 0;
CanvasText.cache_stats.segment_misses = 0;

// Splitting strategy for chopping a label into segments
function splitLabelText(text, rtl){
    if (text.length < codon_length) {
        return [text];
    }

    let key = text;
    if (CanvasText.segment_cache[key]) {
        CanvasText.cache_stats.segment_hits++;
        return CanvasText.segment_cache[key].map(v => v); // copy to avoid modification
    }

    let segments = [];
    while (text.length){
        let segment = '';
        let testText = text;
        let graphemeCount = 0;

        for (graphemeCount; graphemeCount < codon_length && testText.length > 0; graphemeCount++) {
            let graphemeCluster = (graphemeRegex.exec(testText) || testText)[0];
            segment += graphemeCluster;
            testText = testText.substring(graphemeCluster.length);
        }

        // if RTL, check to see if segment starts or ends on a neutral character
        // in which case we need to add the neutral segments separately
        let take = 0;
        if (rtl) {
            while (segment.length > 0 && isTextNeutral(segment[0])) {
                segments.push(segment[0]);
                segment = segment.substring(1);
                take++;
            }

            let neutral_segment = [];
            while (segment.length > 0 && isTextNeutral(segment[segment.length - 1])) {
                neutral_segment.unshift(segment[segment.length - 1]); // add trailing neutrals in reverse order
                segment = segment.substring(0, segment.length - 1);
                take++;
            }

            if (segment.length) {
                segments.push(segment);
            }

            if (neutral_segment.length > 0) {
                segments = segments.concat(neutral_segment);
            }
        }
        else {
            segments.push(segment);
        }

        text = text.substring(segment.length + take);
    }

    CanvasText.cache_stats.segment_misses++;
    CanvasText.segment_cache[key] = segments;
    return segments.map(v => v); // copy to avoid modification
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
