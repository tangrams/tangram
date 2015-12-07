import Geo from '../../geo';
import {StyleParser} from '../style_parser';

var LayoutSettings;

export default LayoutSettings = {

   compute (feature, draw, text, context, tile) {
        let layout = {};
        layout.units_per_pixel = tile.units_per_pixel || 1;

        // label anchors (point labels only)
        // label will be adjusted in the given direction, relatove to its original point
        // one of: left, right, top, bottom, top-left, top-right, bottom-left, bottom-right
        layout.anchor = draw.anchor;

        // label offset in pixel (applied in screen space)
        layout.offset = StyleParser.cacheProperty(draw.offset, context) || [0, 0];

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

        // collision flag
        layout.collide = (draw.collide === false) ? false : true;

        // tile boundary handling
        layout.cull_from_tile = (draw.cull_from_tile != null) ? draw.cull_from_tile : true;
        layout.move_into_tile = (draw.move_into_tile != null) ? draw.move_into_tile : true;

        return layout;
    }

};
