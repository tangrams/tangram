import Utils from '../../utils/utils';
import StyleParser from '../style_parser';

export default TextSettings;

const TextSettings = {

    // A key for grouping all labels of the same text style (e.g. same Canvas state, to minimize state changes)
    key (settings) {
        return [
            settings.style,
            settings.weight,
            settings.family,
            settings.px_size,
            settings.fill,
            settings.stroke,
            settings.stroke_width,
            settings.underline_width,
            settings.background_color,
            settings.background_width,
            settings.background_stroke_color,
            settings.background_stroke_width,
            settings.transform,
            settings.text_wrap,
            settings.max_lines,
            settings.supersample,
            Utils.device_pixel_ratio
        ].join('/');
    },

    defaults: {
        style: 'normal',
        weight: 'normal',
        size: '12px',
        px_size: 12,
        family: 'Helvetica',
        fill: [1, 1, 1, 1],
        text_wrap: 15,
        max_lines: 5,
        align: 'center'
    },

    compute (draw, context) {
        const style = {};

        draw.font = draw.font || this.defaults;

        style.supersample = draw.supersample_text ? 1.5 : 1; // optionally render text at 150% to improve clarity

        // LineString labels can articulate while point labels cannot. Needed for future texture coordinate calculations.
        style.can_articulate = draw.can_articulate;

        // Text fill
        style.fill = StyleParser.evalCachedColorPropertyWithAlpha(draw.font.fill, draw.font.alpha, context);
        style.fill = Utils.toCSSColor(style.fill); // convert to CSS for Canvas

        // Text stroke
        if (draw.font.stroke && draw.font.stroke.color) {
            style.stroke = StyleParser.evalCachedColorPropertyWithAlpha(draw.font.stroke.color, draw.font.stroke.alpha, context);
            style.stroke = Utils.toCSSColor(style.stroke); // convert to CSS for Canvas
            style.stroke_width = StyleParser.evalCachedProperty(draw.font.stroke.width, context);
        }

        // Text underline
        if (draw.font.underline === true && !style.can_articulate) {
            style.underline_width = 1.5 * style.supersample;
        }

        // Background box
        if (draw.font.background && !style.can_articulate) { // supported for point labels only
            // Background fill
            style.background_color = StyleParser.evalCachedColorPropertyWithAlpha(draw.font.background.color, draw.font.background.alpha, context);
            style.background_color = Utils.toCSSColor(style.background_color); // convert to CSS for Canvas
            if (style.background_color) {
                style.background_width = StyleParser.evalCachedProperty(draw.font.background.width, context);
            }

            // Background stroke
            style.background_stroke_color =
                draw.font.background.stroke &&
                draw.font.background.stroke.color &&
            StyleParser.evalCachedColorPropertyWithAlpha(draw.font.background.stroke.color, draw.font.background.stroke.alpha, context);
            if (style.background_stroke_color) {
                style.background_stroke_color = Utils.toCSSColor(style.background_stroke_color); // convert to CSS for Canvas

                // default background stroke to 1px when stroke color but no stroke width specified
                style.background_stroke_width = draw.font.background.stroke.width != null ?
                    StyleParser.evalCachedProperty(draw.font.background.stroke.width, context) : 1;
            }
        }

        // Font properties are modeled after CSS names:
        // - family: Helvetica, Futura, etc.
        // - size: in pt, px, or em
        // - style: normal, italic, oblique
        // - weight: normal, bold, etc.
        // - transform: capitalize, uppercase, lowercase

        // clamp weight to 1-1000 (see https://drafts.csswg.org/css-fonts-4/#valdef-font-weight-number)
        style.weight = StyleParser.evalCachedProperty(draw.font.weight, context) || this.defaults.weight;
        if (typeof style.weight === 'number') {
            style.weight = Math.min(Math.max(style.weight, 1), 1000);
        }

        if (draw.font.family) {
            style.family = draw.font.family;
            if (style.family !== this.defaults.family) {
                style.family += ', ' + this.defaults.family;
            }
        }
        else {
            style.family = this.defaults.family;
        }

        style.style = draw.font.style || this.defaults.style;
        style.transform = draw.font.transform;

        // calculated pixel size
        style.px_size = StyleParser.evalCachedProperty(draw.font.px_size, context) * style.supersample;

        style.font_css = this.fontCSS(style);

        // Word wrap and text alignment
        // Not a font properties, but affect atlas of unique text textures
        let text_wrap = draw.text_wrap; // use explicitly set value

        if (text_wrap == null && !style.can_articulate) {
            // point labels (for point and polygon features) have word wrap on w/default max length,
            // line labels default off
            text_wrap = true;
        }

        // setting to 'true' causes default wrap value to be used
        if (text_wrap === true) {
            text_wrap = this.defaults.text_wrap;
        }
        style.text_wrap = text_wrap;

        // max_lines setting to truncate very long labels with an ellipsis
        style.max_lines = draw.max_lines || this.defaults.max_lines;

        return style;
    },

    // Build CSS-style font string (to set Canvas draw state)
    fontCSS ({ style, weight, px_size, family }) {
        return [style, weight, px_size + 'px', family]
            .filter(x => x) // remove null props
            .join(' ');
    }

};
