import Utils from '../../utils/utils';
import {StyleParser} from '../style_parser';

export default class FeatureLabel {

    constructor (feature, rule, context, text, tile, default_font_style) {
        this.text = text;
        this.feature = feature;
        this.tile_key = tile.key;
        this.style = this.constructFontStyle(rule, context, default_font_style);
        this.style_key = this.constructStyleKey(this.style);
    }

    getHash () {
        let str = this.tile_key + this.style_key + this.text;
        return Utils.hashString(str);
    }

    constructFontStyle (rule, context, default_font_style) {
        let style = {};

        // Use fill if specified, or default
        style.fill = (rule.font.fill && Utils.toCanvasColor(StyleParser.parseColor(rule.font.fill, context))) || default_font_style.fill;

        // Use stroke if specified
        if (rule.font.stroke && rule.font.stroke.color) {
            style.stroke = Utils.toCanvasColor(StyleParser.parseColor(rule.font.stroke.color));
            style.stroke_width = rule.font.stroke.width || default_font_style.stroke.width;
        }

        // Font properties are modeled after CSS names:
        // - family: Helvetica, Futura, etc.
        // - size: in pt, px, or em
        // - style: normal, italic, oblique
        // - weight: normal, bold, etc.
        style.style = rule.font.style || default_font_style.style;
        style.weight = rule.font.weight || default_font_style.weight;
        style.family = rule.font.family || default_font_style.family;
        // style.capitalized = rule.font.capitalized || default_font_style.capitalized; // TODO new syntax

        let size = rule.font.size || rule.font.typeface || default_font_style.size;
        let size_regex = /([0-9]*\.)?[0-9]+(px|pt|em|%)/g;
        let ft_size = (size.match(size_regex) || [])[0];
        let size_kind = ft_size.replace(/([0-9]*\.)?[0-9]+/g, '');

        // TODO: improve pt/em conversion
        style.px_logical_size = Utils.toPixelSize(ft_size.replace(/([a-z]|%)/g, ''), size_kind);
        style.px_size = style.px_logical_size * Utils.device_pixel_ratio;
        style.stroke_width *= Utils.device_pixel_ratio;
        style.size = size.replace(size_regex, style.px_size + "px");

        if (rule.font.typeface) { // legacy syntax
            style.font_css = rule.font.typeface.replace(size_regex, style.px_size + "px");
        }
        else {
            style.font_css = this.fontCSS(style);
        }

        return style;
    }

    // Build CSS-style font string
    fontCSS ({ style, weight, size, family }) {
        return [style, weight, size, family]
            .filter(x => x) // remove null props
            . join(' ');
    }

    constructStyleKey ({ style, weight, family, size, fill, stroke, stroke_width, typeface }) {
        return [style, weight, family, size, fill, stroke, stroke_width, typeface].join('/'); // typeface for legacy
    }
}
