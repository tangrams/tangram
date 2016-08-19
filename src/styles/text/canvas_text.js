import Utils from '../../utils/utils';
import Texture from '../../gl/texture';
import FontManager from './font_manager';

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
    setFont ({ font_css, fill, stroke, stroke_width, px_size }) {
        this.px_size = px_size;
        let ctx = this.context;
        let dpr = Utils.device_pixel_ratio;

        ctx.font = font_css;
        if (stroke && stroke_width > 0) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = stroke_width * dpr;
        }
        ctx.fillStyle = fill;
        ctx.miterLimit = 2;
    }

    textSizes (texts) {
        return FontManager.loadFonts().then(() => {
            for (let style in texts) {
                let text_infos = texts[style];
                let first = true;
                let space_width = this.context.measureText(' ').width;

                for (let text in text_infos) {
                    let text_info = text_infos[text];
                    text_info.space_width = space_width;

                    let text_settings = text_info.text_settings;

                    if (first) {
                        this.setFont(text_settings);
                        first = false;
                    }

                    CanvasText.text_cache[style] = CanvasText.text_cache[style] || {};

                    if (text_settings.can_articulate){
                        var words = text.split(' ');
                        var words_LTR = reorderWordsLTR(words);
                        text_info.segments = words;

                        text_info.size = [];
                        for (let i = 0; i < words_LTR.length; i++){
                            let word = words_LTR[i];
                            if (!CanvasText.text_cache[style][word]) {
                                CanvasText.text_cache[style][word] = this.textSize(word, text_settings);
                            }
                            text_info.size.push(CanvasText.text_cache[style][word].size);
                        }
                    }
                    else {
                        if (!CanvasText.text_cache[style][text]) {
                            CanvasText.text_cache[style][text] = this.textSize(text, text_settings, 0);
                        }
                        // Only send text sizes back to worker (keep computed text line info
                        // on main thread, for future rendering)
                        text_info.size = CanvasText.text_cache[style][text].size;
                    }
                }
            }

            return texts;
        });
    }

    // Computes width and height of text based on current font style
    // Includes word wrapping, returns size info for whole text block and individual lines
    textSize (text, {transform, text_wrap, stroke_width = 0}) {
        let dpr = Utils.device_pixel_ratio;
        let str = this.applyTextTransform(text, transform);
        let ctx = this.context;
        let vertical_buffer = this.vertical_text_buffer * dpr;
        let horizontal_buffer = dpr * (stroke_width + this.horizontal_text_buffer);
        let leading = 2 * dpr; // make configurable and/or use Canvas TextMetrics when available
        let line_height = this.px_size + leading; // px_size already in device pixels

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
        let new_line_template = { width: 0, chars: 0, text: '' };
        let line = Object.assign({}, new_line_template); // current line
        let lines = []; // completed lines
        let max_width = 0; // max width to fit all lines

        // add current line buffer to completed lines, optionally start new line
        function addLine (new_line) {
            line.text = line.text.trim();
            if (line.text.length === 0) {
                return;
            }

            var text = line.text;
            let line_width = ctx.measureText(text).width;

            line.width = line_width;
            lines.push(line);

            max_width = Math.max(max_width, Math.ceil(line_width));

            if (new_line) {
                line = Object.assign({}, new_line_template);
            }
        }

        // First iterate on space-break groups (will be one if max line length off), then iterate on line-break groups
        for (let w=0; w < words.length; w++) {
            let breaks = words[w].split('\n'); // split on line breaks

            for (let n=0; n < breaks.length; n++) {
                let word = breaks[n];

                // if adding current word would overflow, add a new line instead
                if (line.chars + word.length > text_wrap && line.chars > 0) {
                    addLine(true);
                }

                // add current word (plus space)
                line.chars += word.length + 1;
                line.text += word + ' ';

                // if line breaks present, add new line (unless on last line)
                if (breaks.length > 1 && n < breaks.length - 1) {
                    addLine(true);
                }
            }
        }
        addLine(false);

        // Final dimensions of text
        let height = lines.length * line_height;

        let collision_size = [
            max_width / dpr,
            height / dpr
        ];

        let texture_size = [
            max_width + 2 * horizontal_buffer,
            height + 2 * vertical_buffer
        ];

        let logical_size = [
            texture_size[0] / dpr,
            texture_size[1] / dpr,
        ];

        // Returns lines (w/per-line info for drawing) and text's overall bounding box + canvas size
        return {
            lines,
            size: { collision_size, texture_size, logical_size, line_height }
        };
    }

    // Draw one or more lines of text at specified location, adjusting for buffer and baseline
    drawTextMultiLine (lines, [x, y], size, { stroke, stroke_width, transform, align }) {
        let line_height = size.line_height;
        for (let line_num=0; line_num < lines.length; line_num++) {
            let line = lines[line_num];
            this.drawTextLine(line, [x, y], size, { stroke, stroke_width, transform, align });
            y += line_height;
        }
    }

    drawTextLine (line, [x, y], size, { stroke, stroke_width, transform, align }) {
        let dpr = Utils.device_pixel_ratio;
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

        if (stroke && stroke_width > 0) {
            this.context.strokeText(str, tx, ty);
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
                    text_info.multi_texcoords = [];

                    for (let i = 0; i < words.length; i++){
                        let word = words[i];
                        let texcoord;

                        if (CanvasText.texcoord_cache[tile_key][style][word].texcoord){
                            texcoord = CanvasText.texcoord_cache[tile_key][style][word].texcoord;
                        }
                        else {
                            let texture_position = CanvasText.texcoord_cache[tile_key][style][word].texture_position;
                            let size = CanvasText.text_cache[style][word].size;
                            let line = CanvasText.text_cache[style][word].lines[0];

                            this.drawTextLine(line, texture_position, size, text_settings);

                            texcoord = Texture.getTexcoordsForSprite(
                                texture_position,
                                size.texture_size,
                                texture_size
                            );

                            CanvasText.texcoord_cache[tile_key][style][word].texcoord = texcoord;
                        }

                        text_info.multi_texcoords.push(texcoord);
                    }
                }
                else {
                    let lines = CanvasText.text_cache[style][text].lines; // get previously computed lines of text
                    for (let align in text_info.align) {
                        this.drawTextMultiLine(lines, text_info.align[align].texture_position, text_info.size, {
                            stroke: text_settings.stroke,
                            stroke_width: text_settings.stroke_width,
                            transform: text_settings.transform,
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
    }

    // Place text labels within an atlas of the given max size
    setTextureTextPositions (texts, max_texture_size, tile_key) {
        if (!CanvasText.texcoord_cache[tile_key]) {
            CanvasText.texcoord_cache[tile_key] = {};
        }

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
                    for (let i = 0; i < text_info.size.length; i++) {
                        let word = text_info.segments[i];

                        if (!CanvasText.texcoord_cache[tile_key][style][word]) {
                            let size = text_info.size[i].texture_size;
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

    clearTexcoordCache (tile_key) {
        CanvasText.texcoord_cache[tile_key] = {};
    }

}

// Extract font size and units
CanvasText.font_size_re = /((?:[0-9]*\.)?[0-9]+)\s*(px|pt|em|%)?/;

// Cache sizes of rendered text
CanvasText.text_cache = {}; // by text style, then text string
CanvasText.cache_stats = { hits: 0, misses: 0 };

CanvasText.texcoord_cache = {};

// Right-to-left / bi-directional text handling
// Taken from http://stackoverflow.com/questions/12006095/javascript-how-to-check-if-character-is-rtl
function isRTL(s){
    var weakChars       = '\u0000-\u0040\u005B-\u0060\u007B-\u00BF\u00D7\u00F7\u02B9-\u02FF\u2000-\u2BFF\u2010-\u2029\u202C\u202F-\u2BFF',
        rtlChars        = '\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC',
        rtlDirCheck     = new RegExp('^['+weakChars+']*['+rtlChars+']');

    return rtlDirCheck.test(s);
}

function reorderWordsLTR(words) {
    var words_LTR = [];
    var words_RTL = [];

    // loop through words and re-order RTL groups in reverse order (but in LTR visual order)
    for (var i = 0; i < words.length; i++){
        var str = words[i];
        var rtl = isRTL(str);
        if (rtl){
            words_RTL.push(str);
        }
        else {
            while (words_RTL.length > 0){
                words_LTR.push(words_RTL.pop());
            }
            words_LTR.push(str);
        }
    }

    while (words_RTL.length > 0){
        words_LTR.push(words_RTL.pop());
    }

    return words_LTR;
}
