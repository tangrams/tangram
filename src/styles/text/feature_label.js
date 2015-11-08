import Utils from '../../utils/utils';
import Geo from '../../geo';
import {StyleParser} from '../style_parser';
import PointAnchor from '../points/point_anchor';

export default class FeatureLabel {

    constructor (feature, rule, context, text, tile, default_font_style) {
        this.text = text;
        this.feature = feature;
        this.tile_key = tile.key;
        this.style = this.constructFontStyle(feature, rule, context, default_font_style);
        this.style_key = this.constructStyleKey(this.style);
    }

    getHash () {
        let str = this.tile_key + this.style_key + this.text;
        return Utils.hashString(str);
    }

    constructFontStyle (feature, rule, context, default_font_style) {
        let style = {};
        rule.font = rule.font || default_font_style;

        // Use fill if specified, or default
        style.fill = (rule.font.fill && Utils.toCSSColor(StyleParser.parseColor(rule.font.fill, context))) || default_font_style.fill;

        // Use stroke if specified
        if (rule.font.stroke && rule.font.stroke.color) {
            style.stroke = Utils.toCSSColor(StyleParser.parseColor(rule.font.stroke.color));
            style.stroke_width = rule.font.stroke.width || default_font_style.stroke.width;
            style.stroke_width = style.stroke_width && parseFloat(style.stroke_width);
        }

        // Font properties are modeled after CSS names:
        // - family: Helvetica, Futura, etc.
        // - size: in pt, px, or em
        // - style: normal, italic, oblique
        // - weight: normal, bold, etc.
        // - transform: capitalize, uppercase, lowercase
        style.style = rule.font.style || default_font_style.style;
        style.weight = rule.font.weight || default_font_style.weight;
        style.family = rule.font.family || default_font_style.family;
        style.transform = rule.font.transform;

        // original size (not currently used, but useful for debugging)
        style.size = rule.font.size || rule.font.typeface || default_font_style.size; // TODO: 'typeface' legacy syntax, deprecate

        // calculated pixel size
        if (rule.font.px_size_by_zoom) { // zoom stops
            if (rule.font.px_size_by_zoom[context.zoom] == null) { // calc and cache
                rule.font.px_size_by_zoom[context.zoom] = Utils.interpolate(context.zoom, rule.font.px_size);
            }
            style.px_size = rule.font.px_size_by_zoom[context.zoom];
        }
        else {
            style.px_size = rule.font.px_size || default_font_style.px_size; // single size
        }

        style.stroke_width *= Utils.device_pixel_ratio;

        if (rule.font.typeface) { // 'typeface' legacy syntax, deprecate
            style.font_css = rule.font.typeface;
        }
        else {
            style.font_css = this.fontCSS(style);
        }

        // Word wrap and text alignment
        // Not a font properties, but affect atlas of unique text textures
        let text_wrap = rule.text_wrap; // use explicitly set value

        if (text_wrap == null && Geo.geometryType(feature.geometry.type) !== 'line') {
            // point labels (for point and polygon features) have word wrap on w/default max length,
            // line labels default off
            text_wrap = true;
        }

        // setting to 'true' causes default wrap value to be used
        if (text_wrap === true) {
            text_wrap = default_font_style.text_wrap;
        }
        style.text_wrap = text_wrap;

        // default alignment to match anchor
        if (!rule.align && rule.anchor && rule.anchor !== 'center') {
            if (PointAnchor.isLeftAnchor(rule.anchor)) {
                rule.align = 'right';
            }
            else if (PointAnchor.isRightAnchor(rule.anchor)) {
                rule.align = 'left';
            }
        }

        style.align = rule.align || default_font_style.align;

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

// Extract font size and units
// FeatureLabel.font_size_re = /((?:[0-9]*\.)?[0-9]+)\s*(px|pt|em|%)/;
