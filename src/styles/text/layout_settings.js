import Geo from '../../geo';
import {StyleParser} from '../style_parser';

// Common layout settings
export var LayoutSettings = {

   compute (target, feature, draw, context, tile) {
        let layout = target || {};
        layout.id = feature;
        layout.units_per_pixel = tile.units_per_pixel || 1;

        // collision flag
        layout.collide = (draw.collide === false) ? false : true;

        // label anchors (point labels only)
        // label position will be adjusted in the given direction, relative to its original point
        // one of: left, right, top, bottom, top-left, top-right, bottom-left, bottom-right
        layout.anchor = draw.anchor;

        // label offset and buffer in pixel (applied in screen space)
        layout.offset = StyleParser.cacheProperty(draw.offset, context) || StyleParser.zeroPair;
        layout.buffer = StyleParser.cacheProperty(draw.buffer, context) || StyleParser.zeroPair;

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

        return layout;
    }

};

// Additional text-specific layout settings
export var TextLayoutSettings = {

   compute (target, feature, draw, context, tile, text) {
        let layout = target || {};

        // common settings
        layout = LayoutSettings.compute(layout, feature, draw, context, tile);

        // tile boundary handling
        layout.cull_from_tile = (draw.cull_from_tile != null) ? draw.cull_from_tile : true;
        layout.move_into_tile = (draw.move_into_tile != null) ? draw.move_into_tile : true;

        // label line exceed percentage
        if (draw.line_exceed && draw.line_exceed.substr(-1) === '%') {
            layout.line_exceed = parseFloat(draw.line_exceed.substr(0,draw.line_exceed.length-1));
        }
        else {
            layout.line_exceed = 80;
        }

        // repeat minimum distance
        layout.repeat_distance = StyleParser.cacheProperty(draw.repeat_distance, context);
        if (layout.repeat_distance == null) {
            layout.repeat_distance = Geo.tile_size;
        }
        layout.repeat_distance *= layout.units_per_pixel;

        // repeat group key
        if (typeof draw.repeat_group === 'function') {
            layout.repeat_group = draw.repeat_group(context);
        }
        else if (typeof draw.repeat_group === 'string') {
            layout.repeat_group = draw.repeat_group;
        }
        else {
            layout.repeat_group = draw.key; // default to unique set of matching layers
        }
        layout.repeat_group += '/' + text;

        return layout;
    }

};
