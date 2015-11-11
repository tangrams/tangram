import Utils from '../../utils/utils';
import Geo from '../../geo';
import {StyleParser} from '../style_parser';
import PointAnchor from '../points/point_anchor';

export default class FeatureLabel {

    constructor (feature, draw, context, text, tile, default_style) {
        this.text = text;
        this.feature = feature;
        this.tile_key = tile.key;
        this.layout = this.constructLayout(feature, draw, context, tile);
        this.style = this.constructTextStyle(feature, draw, context, default_style);
        this.style_key = this.constructStyleKey(this.style);
    }

    getHash () {
        let str = this.tile_key + this.style_key + this.text;
        return Utils.hashString(str);
    }

   constructLayout (feature, draw, context, tile) {
        let layout = {};
        layout.units_per_pixel = tile.units_per_pixel || 1;

        // label anchors (point labels only)
        // label will be adjusted in the given direction, relatove to its original point
        // one of: left, right, top, bottom, top-left, top-right, bottom-left, bottom-right
        layout.anchor = draw.anchor;

        // label offset in pixel (applied in screen space)
        layout.offset = (Array.isArray(draw.offset) && draw.offset.map(parseFloat)) || [0, 0];

        // label buffer in pixel
        let buffer = draw.buffer;
        if (buffer != null) {
            if (!Array.isArray(buffer)) {
                buffer = [buffer, buffer]; // buffer can be 1D or 2D
            }

            buffer[0] = parseFloat(buffer[0]);
            buffer[1] = parseFloat(buffer[1]);
        }
        layout.buffer = buffer || [0, 0];

        // label priority (lower is higher)
        let priority = draw.priority;
        if (priority != null) {
            if (typeof priority === 'function') {
                priority = priority(context);
            }
        }
        else {
            priority = -1 >>> 0; // default to max priority value if none set
        }
        layout.priority = priority;

        // label line exceed percentage
        if (draw.line_exceed && draw.line_exceed.substr(-1) === '%') {
            layout.line_exceed = draw.line_exceed.substr(0,draw.line_exceed.length-1);
        }
        else {
            layout.line_exceed = 80;
        }

        layout.cull_from_tile = (draw.cull_from_tile != null) ? draw.cull_from_tile : true;
        layout.move_into_tile = (draw.move_into_tile != null) ? draw.move_into_tile : true;

        return layout;
    }

    constructTextStyle (feature, draw, context, default_style) {
        let style = {};

        draw.font = draw.font || default_style;

        // Use fill if specified, or default
        style.fill = (draw.font.fill && Utils.toCSSColor(StyleParser.cacheColor(draw.font.fill, context))) || default_style.fill;

        // Font properties are modeled after CSS names:
        // - family: Helvetica, Futura, etc.
        // - size: in pt, px, or em
        // - style: normal, italic, oblique
        // - weight: normal, bold, etc.
        // - transform: capitalize, uppercase, lowercase
        style.style = draw.font.style || default_style.style;
        style.weight = draw.font.weight || default_style.weight;
        style.family = draw.font.family || default_style.family;
        style.transform = draw.font.transform;

        // original size (not currently used, but useful for debugging)
        style.size = draw.font.size || draw.font.typeface || default_style.size; // TODO: 'typeface' legacy syntax, deprecate

        // calculated pixel size
        style.px_size = StyleParser.cacheProperty(draw.font.px_size, context) || default_style.px_size;

        // Use stroke if specified
        if (draw.font.stroke && draw.font.stroke.color) {
            style.stroke = Utils.toCSSColor(StyleParser.cacheColor(draw.font.stroke.color, context) || default_style.stroke);
            style.stroke_width = StyleParser.cacheProperty(draw.font.stroke.width, context) || default_style.stroke_width;
            style.stroke_width *= Utils.device_pixel_ratio;
        }

        if (draw.font.typeface) { // 'typeface' legacy syntax, deprecate
            style.font_css = draw.font.typeface;
        }
        else {
            style.font_css = this.fontCSS(style);
        }

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
            text_wrap = default_style.text_wrap;
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

        style.align = draw.align || default_style.align;

        return style;
    }

    // Build CSS-style font string (to set Canvas draw state)
    fontCSS ({ style, weight, px_size, family }) {
        return [style, weight, px_size + 'px', family]
            .filter(x => x) // remove null props
            .join(' ');
    }

    // A key for grouping all labels of the same text style (e.g. same Canvas state, to minimize state changes)
    constructStyleKey (settings) {
        return [
            settings.style,
            settings.weight,
            settings.family,
            settings.px_size,
            settings.fill,
            settings.stroke,
            settings.stroke_width,
            settings.transform,
            settings.typeface,
            settings.text_wrap,
            settings.align
        ].join('/'); // typeface for legacy
    }

}
