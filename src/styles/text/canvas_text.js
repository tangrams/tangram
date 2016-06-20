import log from '../../utils/log';
import Utils from '../../utils/utils';
import Texture from '../../gl/texture';

import FontFaceObserver from 'fontfaceobserver';

export default class CanvasText {

    constructor () {
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
    setFont ({ font_css, fill, stroke, stroke_width, px_size }) {
        this.px_size = px_size;
        this.text_buffer = 8; // pixel padding around text
        let ctx = this.context;

        ctx.font = font_css;
        if (stroke) {
            ctx.strokeStyle = stroke;
            ctx.lineWidth = stroke_width;
        }
        else {
            ctx.strokeStyle = null;
            ctx.lineWidth = 0;
        }
        ctx.fillStyle = fill;
        ctx.miterLimit = 2;
    }

    textSizes (texts) {
        return CanvasText.fonts_loaded.then(() => {
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
                        CanvasText.text_cache[style][text] =
                            this.textSize(text, text_settings.transform, text_settings.text_wrap);
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
    textSize (text, transform, text_wrap) {
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
        let new_line_template = { width: 0, chars: 0, text: '' };
        let line = Object.assign({}, new_line_template); // current line
        let lines = []; // completed lines
        let max_width = 0; // max width to fit all lines

        // add current line buffer to completed lines, optionally start new line
        function addLine (new_line) {
            line.text = line.text.trim();
            if (line.text.length > 0) {
                line.width = ctx.measureText(line.text).width;
                max_width = Math.max(max_width, Math.ceil(line.width));
                lines.push(line);
            }
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
            max_width / Utils.device_pixel_ratio,
            height / Utils.device_pixel_ratio
        ];

        let texture_size = [
            max_width + buffer * 2,
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
    drawText (lines, [x, y], size, { stroke, transform, align }) {
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

            if (stroke) {
                this.context.strokeText(str, tx, ty);
            }
            this.context.fillText(str, tx, ty);
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

                this.drawText(lines, info.position, info.size, {
                    stroke: text_settings.stroke,
                    transform: text_settings.transform,
                    align: text_settings.align
                });

                info.texcoords = Texture.getTexcoordsForSprite(
                    info.position,
                    info.size.texture_size,
                    texture_size
                );
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
                let size = text_info.size.texture_size;
                if (cy + size[1] < max_texture_size) {
                    text_info.position = [cx, cy]; // add label to current column
                    cy += size[1];
                    if (cy > height) {
                        height = cy;
                    }
                }
                else { // start new column if taller than texture
                    cx += widest;
                    cy = 0;
                    text_info.position = [cx, cy];
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

    // Load set of custom font faces
    // `fonts` is an object where the key is a font family name, and the value is one or more font face
    // definitions. The value can be either a single object, or an array of such objects.
    // If the special string value 'external' is used, it indicates the the font will be loaded via external CSS.
    static loadFonts (fonts) {
        let queue = [];
        for (let family in fonts) {
            if (Array.isArray(fonts[family])) {
                fonts[family].forEach(face => queue.push(this.loadFontFace(family, face)));
            }
            else {
                queue.push(this.loadFontFace(family, fonts[family]));
            }
        }

        CanvasText.fonts_loaded = Promise.all(queue.filter(x => x));
        return CanvasText.fonts_loaded;
    }

    // Load a single font face
    // `face` contains the font face definition, with optional parameters for `weight`, `style`, and `url`.
    // If the `url` is defined, the font is injected into the document as a CSS font-face.
    // If the object's value is the special string 'external', or if no `url` is defined, then the font face
    // is assumed is assumed to been loaded via external CSS. In either case, the function returns a promise
    // that resolves when the font face has loaded, or times out.
    static loadFontFace (family, face) {
        if (face == null || (typeof face !== 'object' && face !== 'external')) {
            return;
        }

        let options = { family };

        if (typeof face === 'object') {
            Object.assign(options, face);

            // If URL is defined, inject font into document
            if (typeof face.url === 'string') {
                this.injectFontFace(options);
            }
        }

        // Wait for font to load
        return (new FontFaceObserver(family, options)).load().then(
            () => {
                // Promise resolves, font is available
                log('debug', `Font face '${family}' is available`, options);
            },
            () => {
                // Promise rejects, font is not available
                log('debug', `Font face '${family}' is NOT available`, options);
            }
        );
    }

    // Loads a font face via CSS injection
    // TODO: consider support for multiple format URLs per face, unicode ranges
    static injectFontFace ({ family, url, weight, style }) {
        let css = `
            @font-face {
                font-family: '${family}';
                font-weight: ${weight || 'normal'};
                font-style: ${style || 'normal'};
                src: url(${encodeURI(url)});
            }
        `;

        let style_el = document.createElement('style');
        style_el.appendChild(document.createTextNode(""));
        document.head.appendChild(style_el);
        style_el.sheet.insertRule(css, 0);
        log('trace', 'Injecting CSS font face:', css);
    }

}

// Extract font size and units
CanvasText.font_size_re = /((?:[0-9]*\.)?[0-9]+)\s*(px|pt|em|%)?/;

// Cache sizes of rendered text
CanvasText.text_cache = {}; // by text style, then text string
CanvasText.cache_stats = { hits: 0, misses: 0 };

// Font detection
CanvasText.fonts_loaded = Promise.resolve(); // resolves when all requested fonts have been detected
