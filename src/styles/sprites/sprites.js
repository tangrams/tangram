// Sprite rendering style

import {Style} from '../style';
import {StyleParser} from '../style_parser';
import gl from '../../gl/constants'; // web workers don't have access to GL context, so import all GL constants
import VertexLayout from '../../gl/vertex_layout';
import Builders from '../builders';
import Utils from '../../utils/utils';
import Geo from '../../geo';
import boxIntersect from 'box-intersect';


export var Sprites = Object.create(Style);

Object.assign(Sprites, {
    name: 'sprites',
    built_in: true,

    init() {
        Style.init.apply(this);

        // Base shaders
        this.vertex_shader_key = 'styles/sprites/sprites_vertex';
        this.fragment_shader_key = 'styles/sprites/sprites_fragment';

        this.selection = true;
        this.bboxes = {};

        var attribs = [
            { name: 'a_position', size: 3, type: gl.FLOAT, normalized: false },
            { name: 'a_shape', size: 4, type: gl.SHORT, normalized: true },
            { name: 'a_selection_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
            { name: 'a_texcoord', size: 2, type: gl.FLOAT, normalized: false }, // TODO: pack into shorts
            { name: 'a_layer', size: 1, type: gl.FLOAT, normalized: false }
        ];
        this.vertex_layout = new VertexLayout(attribs);
    },

    _parseFeature (feature, rule_style, context) {
        var style = this.feature_style;

        style.z = (rule_style.z && StyleParser.parseDistance(rule_style.z || 0, context)) || StyleParser.defaults.z;
        style.texture = rule_style.texture;
        style.sprite = rule_style.sprite;

        // sprite style only supports sizes in pixel units, so unit conversion flag is off
        style.size = rule_style.size && StyleParser.parseDistance(rule_style.size, context, false);

        // scale size to 16-bit signed int, with a max allowed width + height of 128 pixels
        style.size = [
            Math.min((style.size[0] || style.size), 256),
            Math.min((style.size[1] || style.size), 256)
        ];

        style.angle = rule_style.angle || 0;
        if (typeof style.angle === 'function') {
            style.angle = style.angle(context);
        }

        // factor by which sprites scales from current zoom level to next zoom level
        style.scale = rule_style.scale || 1;

        // to store bbox by tiles
        style.tile = tile;

        this.setTexcoordScale(style); // Sets texcoord scale if needed (e.g. for sprite sub-area)

        return style;
    },

    /**
     * A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
     * A plain JS array matching the order of the vertex layout.
     */
    makeVertexTemplate(style) {
        // Basic attributes, others can be added (see texture UVs below)
        var template = [
            // position - (x, y) coords will be filled in per-vertex below
            0, 0, style.z || 0,
            // scaling vector - (x, y) components per pixel, z = angle, w = scaling factor
            0, 0, 0, 0,
            // selection color
            style.selection_color[0] * 255, style.selection_color[1] * 255, style.selection_color[2] * 255, style.selection_color[3] * 255,
            // texture coords
            0, 0,
            // draw order
            style.order
        ];

        return template;
    },

    getBBox (size, position) {
        let upp = Geo.units_per_pixel;
        let half_merc_width = size[0] * upp * 0.5;
        let half_merc_height = size[1] * upp * 0.5;

        return [
            position[0] - half_merc_width, 
            position[1] - half_merc_height, 
            position[0] + half_merc_width, 
            position[1] + half_merc_height
        ];
    },

    getOBBox (size, position, angle) {
        let upp = Geo.units_per_pixel;
        let mw = size[0] * upp * 0.5; // half mercator height
        let mh = size[1] * upp * 0.5; // half mercator width
    
        let c = Math.cos(angle);
        let s = Math.sin(angle);

        let p0 = [ mw * c - mh * s, mw * s + mh * c ];
        let p1 = [ mh * s - mw * c, -(mw * s + mh * c) ];
        let p2 = [ -(mw * c + mh * s), mh * c - mw * s ];
        let p3 = [ mw * c + mh * s, mw * s - mh * c ];

        return [
            Math.min([p0[0], p1[0], p2[0], p3[0]]),
            Math.min([p0[1], p1[1], p2[1], p3[1]]),
            Math.max([p0[0], p1[0], p2[0], p3[0]]),
            Math.max([p0[1], p1[1], p2[1], p3[1]])
        ];
    },

    overlap (tile, size, position, theta) {
        let bbox;

        if (theta) {
            bbox = this.getOBBox(size, position, theta);
        } else { 
            bbox = this.getBBox(size, position);
        }
         
        if (this.bboxes[tile] === undefined) {
            this.bboxes[tile] = [];
        }

        this.bboxes[tile].push(bbox);
        let bboxes = this.bboxes;

        return boxIntersect(this.bboxes[tile], function(i, j) {
            if (bboxes[tile][i] == bbox || bboxes[tile][j] == bbox) {
                return true; // early exit
            }
        });
    },

    buildPoints (points, style, vertex_data) {
        if (!style.size) {
            return;
        }

        var vertex_template = this.makeVertexTemplate(style);
        
        if (this.overlap(style.tile, style.size, points[0])) {
            return;
        }

        Builders.buildSpriteQuadsForPoints(
            points,
            Utils.scaleInt16(style.size[0], 128), Utils.scaleInt16(style.size[1], 128),
            Utils.scaleInt16(style.angle, 360),
            Utils.scaleInt16(style.scale, 256),
            vertex_data,
            vertex_template,
            this.vertex_layout.index.a_shape,
            { texcoord_index: this.vertex_layout.index.a_texcoord, texcoord_scale: this.texcoord_scale }
        );
    }

});
