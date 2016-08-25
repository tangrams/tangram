import Utils from '../../utils/utils';
import Texture from '../../gl/texture';
import FontManager from './font_manager';
import debugSettings from '../../utils/debug_settings';

export default class CanvasText {

    constructor () {
        this.canvas = document.createElement('canvas');
        this.canvas.style.backgroundColor = 'transparent'; // render text on transparent background
        this.context = this.canvas.getContext('2d');
        this.text_buffer = 8; // pixel padding around text
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

        if (stroke && stroke_width > 0) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = stroke_width;
        }
        ctx.fillStyle = fill;

        ctx.font = font_css;
        ctx.miterLimit = 2;
    }

    textSizes (texts) {
        return FontManager.loadFonts().then(() => {
            for (let style in texts) {
                let text_infos = texts[style];
                let first = true;

                for (let text in text_infos) {
                    // Use cached size, or compute via canvas
                    if (!CanvasText.text_cache[style] || !CanvasText.text_cache[style][text]) {
                        let text_settings = text_infos[text].text_settings;
                        if (first) {
                            this.setFont(text_settings);
                            first = false;
                        }

                        CanvasText.text_cache[style] = CanvasText.text_cache[style] || {};
                        CanvasText.text_cache[style][text] = this.textSize(text, text_settings);
                        CanvasText.cache_stats.misses++;
                    }
                    else {
                        CanvasText.cache_stats.hits++;
                    }

                    // Only send text sizes back to worker (keep computed text line info
                    // on main thread, for future rendering)
                    text_infos[text].size = CanvasText.text_cache[style][text].size;
                }
            }

            return texts;
        });
    }

    // Computes width and height of text based on current font style
    // Includes word wrapping, returns size info for whole text block and individual lines
    textSize (text, {transform, text_wrap, max_lines}) {
        let str = this.applyTextTransform(text, transform);
        let ctx = this.context;
        let buffer = this.text_buffer * Utils.device_pixel_ratio;
        let leading = 2 * Utils.device_pixel_ratio; // make configurable and/or use Canvas TextMetrics when available
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

        let multiline = new MultiLine(ctx, max_lines, text_wrap);
        let line = multiline.createLine(line_height);

        // First iterate on space-break groups (will be one if max line length off), then iterate on line-break groups
        for (let w=0; w < words.length; w++) {
            let breaks = words[w].split('\n'); // split on line breaks

            for (let n=0; n < breaks.length; n++) {
                if (!line){
                    break;
                }

                let word = breaks[n].trim();

                if (!word) {
                    continue;
                }

                // if adding current word would overflow, add a new line instead
                if (line.exceedsTextwrap(word)) {
                    line = multiline.advance(line, line_height);
                    if (!line){
                        break;
                    }
                }

                line.append(word);

                // if line breaks present, add new line (unless on last line)
                if (n < breaks.length - 1) {
                    line = multiline.advance(line, line_height);
                }
            }

            if (w === words.length - 1){
                multiline.finish(line);
            }
        }

        // Final dimensions of text
        let height = multiline.height;
        let width = multiline.width;
        let lines = multiline.lines;

        let collision_size = [
            width / Utils.device_pixel_ratio,
            height / Utils.device_pixel_ratio
        ];

        let texture_size = [
            width + buffer * 2,
            height + buffer * 2
        ];

        let logical_size = texture_size.map(v => v / Utils.device_pixel_ratio);

        // Returns lines (w/per-line info for drawing) and text's overall bounding box + canvas size
        return {
            lines,
            size: { collision_size, texture_size, logical_size, line_height }
        };
    }

    // Draw one or more lines of text at specified location, adjusting for buffer and baseline
    drawText (lines, [x, y], size, { stroke, stroke_width, transform, align }) {
        align = align || 'center';

        for (let line_num=0; line_num < lines.length; line_num++) {
            let line = lines[line_num];
            let str = this.applyTextTransform(line.text, transform);
            let buffer = this.text_buffer * Utils.device_pixel_ratio;
            let texture_size = size.texture_size;
            let line_height = size.line_height;

            // Text alignment
            let tx;
            if (align === 'left') {
                tx = x + buffer;
            }
            else if (align === 'center') {
                tx = x + texture_size[0]/2 - line.width/2;
            }
            else if (align === 'right') {
                tx = x + texture_size[0] - line.width - buffer;
            }

            // In the absence of better Canvas TextMetrics (not supported by browsers yet),
            // 0.75 buffer produces a better approximate vertical centering of text
            let ty = y + buffer * 0.75 + (line_num + 1) * line_height;

            if (stroke && stroke_width > 0) {
                this.context.strokeText(str, tx, ty);
            }
            this.context.fillText(str, tx, ty);
        }

        // Draw bounding boxes for debugging
        if (debugSettings.draw_label_collision_boxes) {
            this.context.save();

            let dpr = Utils.device_pixel_ratio;
            let buffer = dpr * this.text_buffer;
            let collision_size = size.collision_size;
            let lineWidth = 2;

            this.context.strokeStyle = 'blue';
            this.context.lineWidth = lineWidth;
            this.context.strokeRect(x + buffer, y + buffer, dpr * collision_size[0], dpr * collision_size[1]);

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

            this.context.restore();
        }
    }

    rasterize (texts, texture_size) {
        for (let style in texts) {
            let text_infos = texts[style];
            let first = true;

            for (let text in text_infos) {
                let info = text_infos[text];
                let text_settings = info.text_settings;
                let lines = CanvasText.text_cache[style][text].lines; // get previously computed lines of text

                if (first) {
                    this.setFont(text_settings);
                    first = false;
                }

                // each alignment needs to be rendered separately
                for (let align in info.align) {
                    this.drawText(lines, info.align[align].texture_position, info.size, {
                        stroke: text_settings.stroke,
                        stroke_width: text_settings.stroke_width,
                        transform: text_settings.transform,
                        align: align
                    });

                    info.align[align].texcoords = Texture.getTexcoordsForSprite(
                        info.align[align].texture_position,
                        info.size.texture_size,
                        texture_size
                    );
                }
            }
        }
    }

    // Place text labels within an atlas of the given max size
    setTextureTextPositions (texts, max_texture_size) {
        // Find widest label
        let widest = 0;
        for (let style in texts) {
            let text_infos = texts[style];
            for (let text in text_infos) {
                let size = text_infos[text].size.texture_size;
                if (size[0] > widest) {
                    widest = size[0];
                }
            }
        }

        // Layout labels, stacked in columns
        let cx = 0, cy = 0; // current x/y position in atlas
        let height = 0;     // overall atlas height
        for (let style in texts) {
            let text_infos = texts[style];

            for (let text in text_infos) {
                let text_info = text_infos[text];
                // rendered size is same for all alignments
                let size = text_info.size.texture_size;

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
                        cx += widest;
                        cy = 0;
                        text_info.align[align].texture_position = [cx, cy];
                    }
                }
            }
        }

        return [cx + widest, height]; // overall atlas size
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

}

// Extract font size and units
CanvasText.font_size_re = /((?:[0-9]*\.)?[0-9]+)\s*(px|pt|em|%)?/;

// Cache sizes of rendered text
CanvasText.text_cache = {}; // by text style, then text string
CanvasText.cache_stats = { hits: 0, misses: 0 };

// Private class to arrange text labels into multiple lines based on
// "text wrap" and "max line" values
class MultiLine {
    constructor (context, max_lines = Infinity, text_wrap = Infinity) {
        this.width = 0;
        this.height = 0;
        this.lines = [];

        this.ellipsis = '...';
        this.ellipsis_width = context.measureText(this.ellipsis).width;

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
        // remove last space from previous line
        if (this.lines.length > 0){
            let last_line = this.lines[this.lines.length - 1];
            last_line.text = last_line.text.slice(0, last_line.text.length - 1);
        }

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
        last_line.append(this.ellipsis);
        last_line.width += this.ellipsis_width;
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
}

// A Private class used by MultiLine to contain the logic for a single line
// including character count, width, height and text
class Line {
    constructor (height = 0, text_wrap = 0){
        this.chars = 0;
        this.text = '';

        this.height = height;
        this.text_wrap = text_wrap;
    }

    append (text){
        text += ' '; // add space (to be removed later if necessary)
        this.chars += text.length;
        this.text += text;
    }

    exceedsTextwrap(text){
        return text.length + this.chars > this.text_wrap;
    }
}