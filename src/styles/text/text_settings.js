import Utils from '../../utils/utils';
import Geo from '../../utils/geo';
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
            settings.background,
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
        fill: 'white',
        fill_array: [1, 1, 1, 1],
        text_wrap: 15,
        max_lines: 5,
        align: 'center'
    },

    compute (feature, draw, context) {
        const style = {};
        const geomType = Geo.geometryType(feature.geometry.type);

        draw.font = draw.font || this.defaults;

        // LineString labels can articulate while point labels cannot. Needed for future texture coordinate calculations.
        style.can_articulate = draw.can_articulate;

        // Use fill if specified, or default
        style.fill = draw.font.fill && StyleParser.evalCachedColorProperty(draw.font.fill, context);
        if (geomType === 'point') { // background color box for point labels only
            style.background = draw.font.background && StyleParser.evalCachedColorProperty(draw.font.background, context);
        }

        // optional alpha override
        const alpha = StyleParser.evalCachedProperty(draw.font.alpha, context);
        if (alpha != null) {
            style.fill = [...(style.fill ? style.fill : this.defaults.fill_array)]; // copy to avoid modifying underlying object
            style.fill[3] = alpha;

            if (style.background) {
                style.background = [...style.background]; // copy to avoid modifying underlying object
                style.background[3] = alpha;
            }
        }
        style.fill = (style.fill && Utils.toCSSColor(style.fill)) || this.defaults.fill; // convert to CSS for Canvas
        style.background = (style.background && Utils.toCSSColor(style.background));

        // Font properties are modeled after CSS names:
        // - family: Helvetica, Futura, etc.
        // - size: in pt, px, or em
        // - style: normal, italic, oblique
        // - weight: normal, bold, etc.
        // - transform: capitalize, uppercase, lowercase

        // clamp weight to 1-1000 (see https://drafts.csswg.org/css-fonts-4/#valdef-font-weight-number)
        style.weight = StyleParser.evalCachedProperty(draw.font.weight, context) || this.defaults.weight;
        style.weight = Math.min(Math.max(style.weight, 1), 1000);

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
        style.supersample = draw.supersample_text ? 1.5 : 1; // optionally render text at 150% to improve clarity
        style.px_size = StyleParser.evalCachedProperty(draw.font.px_size, context) * style.supersample;

        // Use stroke if specified
        if (draw.font.stroke && draw.font.stroke.color) {
            style.stroke = StyleParser.evalCachedColorProperty(draw.font.stroke.color, context);
            if (style.stroke) {
                // optional alpha override
                const stroke_alpha = StyleParser.evalCachedProperty(draw.font.stroke.alpha, context);
                if (stroke_alpha != null) {
                    style.stroke = [...style.stroke]; // copy to avoid modifying underlying object
                    style.stroke[3] = stroke_alpha;
                }
                style.stroke = Utils.toCSSColor(style.stroke); // convert to CSS for Canvas
            }
            style.stroke_width = StyleParser.evalCachedProperty(draw.font.stroke.width, context);
        }

        style.font_css = this.fontCSS(style);

        // Word wrap and text alignment
        // Not a font properties, but affect atlas of unique text textures
        let text_wrap = draw.text_wrap; // use explicitly set value

        if (text_wrap == null && geomType !== 'line') {
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
