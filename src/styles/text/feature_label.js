/*global Label */

import Utils from '../../utils/utils';
import {StyleParser} from '../style_parser';

export default class FeatureLabel {

    constructor (feature, rule, context, text, tile, font_style) {
        this.text = text;
        this.feature = feature;
        this.tile_key = tile.key;
        this.style = this.constructFontStyle(rule, context, font_style);
        this.style_key = this.constructStyleKey(this.style);
    }

    getHash () {
        let str = this.tile_key + this.style_key + this.text;
        return Utils.hashString(str);
    }

    constructFontStyle (rule, context, font_style) {
        let style = {};

        // Use fill if specified, or default
        style.fill = (rule.font.fill && Utils.toCanvasColor(StyleParser.parseColor(rule.font.fill, context))) || font_style.fill;

        // Use stroke if specified
        if (rule.font.stroke && rule.font.stroke.color) {
            style.stroke = Utils.toCanvasColor(StyleParser.parseColor(rule.font.stroke.color));
            style.stroke_width = rule.font.stroke.width || font_style.stroke.width;
        }

        // Use default typeface
        style.font = rule.font.typeface || font_style.typeface;
        style.capitalized = rule.font.capitalized || font_style.capitalized;

        let size_regex = /([0-9]*\.)?[0-9]+(px|pt|em|%)/g;
        let ft_size = style.font.match(size_regex)[0];
        let size_kind = ft_size.replace(/([0-9]*\.)?[0-9]+/g, '');

        style.px_logical_size = Utils.toPixelSize(ft_size.replace(/([a-z]|%)/g, ''), size_kind);
        style.px_size = style.px_logical_size * Utils.device_pixel_ratio;
        style.stroke_width *= Utils.device_pixel_ratio;
        style.font = style.font.replace(size_regex, style.px_size + "px");

        return style;
    }

    constructStyleKey ({ font, fill, stroke, stroke_width }) {
        return `${font}/${fill}/${stroke}/${stroke_width}`;
    }
}
