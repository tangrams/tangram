import Utils from '../../utils/utils';
import Geo from '../../geo';
import {StyleParser} from '../style_parser';
import LabelPoint from './label_point';

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
        style.fill = (rule.font.fill && Utils.toCanvasColor(StyleParser.parseColor(rule.font.fill, context))) || default_font_style.fill;

        // Use stroke if specified
        if (rule.font.stroke && rule.font.stroke.color) {
            style.stroke = Utils.toCanvasColor(StyleParser.parseColor(rule.font.stroke.color));
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

        let size = rule.font.size || rule.font.typeface || default_font_style.size; // TODO: 'typeface' legacy syntax, deprecate
        let size_regex = /([0-9]*\.)?[0-9]+(px|pt|em|%)/g;
        let ft_size = (size.match(size_regex) || [])[0];
        let size_kind = ft_size.replace(/([0-9]*\.)?[0-9]+/g, '');

        // TODO: improve pt/em conversion
        style.px_logical_size = parseInt(Utils.toPixelSize(ft_size.replace(/([a-z]|%)/g, ''), size_kind));
        style.px_size = style.px_logical_size * Utils.device_pixel_ratio;
        style.stroke_width *= Utils.device_pixel_ratio;
        style.size = size.replace(size_regex, style.px_size + "px");

        if (rule.font.typeface) { // 'typeface' legacy syntax, deprecate
            style.font_css = rule.font.typeface.replace(size_regex, style.px_size + "px");
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
            if (LabelPoint.isLeftAnchor(rule.anchor)) {
                rule.align = 'right';
            }
            else if (LabelPoint.isRightAnchor(rule.anchor)) {
                rule.align = 'left';
            }
        }

        style.align = rule.align || default_font_style.align;

        return style;
    }

    // Build CSS-style font string (to set Canvas draw state)
    fontCSS ({ style, weight, size, family }) {
        return [style, weight, size, family]
            .filter(x => x) // remove null props
            .join(' ');
    }

    // A key for grouping all labels of the same text style (e.g. same Canvas state, to minimize state changes)
    constructStyleKey (settings) {
        return [
            settings.style,
            settings.weight,
            settings.family,
            settings.size,
            settings.fill,
            settings.stroke,
            settings.stroke_width,
            settings.transform,
            settings.typeface,
            settings.text_wrap,
            settings.align
        ].join('/'); // typeface for legacy
    }

    // Called before rasterization
    static applyTextTransform (text, transform) {
        if (transform === 'capitalize') {
            return text.replace(/\w\S*/g, function (txt) {
                return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
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

}
