import Utils from '../../utils/utils';
import Geo from '../../geo';
import {StyleParser} from '../style_parser';
import PointAnchor from '../points/point_anchor';

var TextSettings;

export default TextSettings = {

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
            settings.transform,
            settings.text_wrap,
            settings.align,
            Utils.device_pixel_ratio
        ].join('/');
    },

    defaults: {
        style: 'normal',
        weight: null,
        size: '12px',
        px_size: 12,
        family: 'Helvetica',
        fill: 'white',
        text_wrap: 15,
        align: 'center'
    },

    compute (feature, draw, context) {
        let style = {};

        draw.font = draw.font || this.defaults;

        // Use fill if specified, or default
        style.fill = (draw.font.fill && Utils.toCSSColor(StyleParser.cacheColor(draw.font.fill, context))) || this.defaults.fill;

        // Font properties are modeled after CSS names:
        // - family: Helvetica, Futura, etc.
        // - size: in pt, px, or em
        // - style: normal, italic, oblique
        // - weight: normal, bold, etc.
        // - transform: capitalize, uppercase, lowercase
        style.style = draw.font.style || this.defaults.style;
        style.weight = draw.font.weight || this.defaults.weight;
        if (draw.font.family) {
            style.family = draw.font.family;
            if (style.family !== this.defaults.family) {
                style.family += ', ' + this.defaults.family;
            }
        }
        else {
            style.family = this.defaults.family;
        }

        style.transform = draw.font.transform;

        // original size (not currently used, but useful for debugging)
        style.size = draw.font.size || this.defaults.size;

        // calculated pixel size
        style.px_size = StyleParser.cacheProperty(draw.font.px_size, context) || this.defaults.px_size;

        // Use stroke if specified
        if (draw.font.stroke && draw.font.stroke.color) {
            style.stroke = Utils.toCSSColor(StyleParser.cacheColor(draw.font.stroke.color, context) || this.defaults.stroke);
            style.stroke_width = StyleParser.cacheProperty(draw.font.stroke.width, context) || this.defaults.stroke_width;
            style.stroke_width *= Utils.device_pixel_ratio;
        }

        style.font_css = this.fontCSS(style);

        // Word wrap and text alignment
        // Not a font properties, but affect atlas of unique text textures
        let text_wrap = draw.text_wrap; // use explicitly set value
        if (text_wrap == null && Geo.geometryType(feature.geometry.type) !== 'line') {
            // point labels (for point and polygon features) have word wrap on w/default max length,
            // line labels default off
            text_wrap = true;
        }

        // setting to 'true' causes default wrap value to be used
        if (text_wrap === true) {
            text_wrap = this.defaults.text_wrap;
        }
        style.text_wrap = text_wrap;

        // default alignment to match anchor
        if (!draw.align && draw.anchor && draw.anchor !== 'center') {
            if (PointAnchor.isLeftAnchor(draw.anchor)) {
                draw.align = 'right';
            }
            else if (PointAnchor.isRightAnchor(draw.anchor)) {
                draw.align = 'left';
            }
        }

        style.align = draw.align || this.defaults.align;

        return style;
    },

    // Build CSS-style font string (to set Canvas draw state)
    fontCSS ({ style, weight, px_size, family }) {
        return [style, weight, px_size + 'px', family]
            .filter(x => x) // remove null props
            .join(' ');
    }

};
