// Point rendering style

import {Style} from '../style';
import {StyleParser} from '../style_parser';
import gl from '../../gl/constants'; // web workers don't have access to GL context, so import all GL constants
import VertexLayout from '../../gl/vertex_layout';
import Builders from '../builders';
import Texture from '../../gl/texture';
import Utils from '../../utils/utils';

import log from 'loglevel';

export var Points = Object.create(Style);

Object.assign(Points, {
    name: 'points',
    built_in: true,
    selection: true,
    blend: 'overlay', // overlays drawn on top of all other styles, with blending

    init(options = {}) {
        Style.init.apply(this, arguments);

        // Base shaders
        this.vertex_shader_key = 'styles/points/points_vertex';
        this.fragment_shader_key = 'styles/points/points_fragment';

        var attribs = [
            { name: 'a_position', size: 3, type: gl.FLOAT, normalized: false },
            { name: 'a_shape', size: 4, type: gl.SHORT, normalized: true },
            { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
            { name: 'a_selection_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
            { name: 'a_texcoord', size: 2, type: gl.FLOAT, normalized: false } // TODO: pack into shorts
        ];

        // If we're not rendering as overlay, we need a layer attribute
        if (this.blend !== 'overlay') {
            this.defines.TANGRAM_ORDER_ATTRIBUTE = true;
            attribs.push({ name: 'a_layer', size: 1, type: gl.FLOAT, normalized: false });
        }

        this.vertex_layout = new VertexLayout(attribs);

        if (this.texture) {
            this.defines.TANGRAM_POINT_TEXTURE = true;
            this.shaders.uniforms = this.shaders.uniforms || {};
            this.shaders.uniforms.u_texture = this.texture;
        }
    },

    _parseFeature (feature, rule_style, context) {
        var style = this.feature_style;
        let tile = context.tile.key;

        style.color = this.parseColor(rule_style.color, context);

        // require color or texture
        if (!style.color && !this.texture) {
            return null;
        }

        style.sprite = rule_style.sprite;
        if (typeof style.sprite === 'function') {
            style.sprite = style.sprite(context);
        }

        // require sprite to draw?
        if (this.texture && !style.sprite &&
            Texture.textures[this.texture] && Texture.textures[this.texture].sprites) {
            return; // skip feature
        }

        style.z = (rule_style.z && StyleParser.cacheDistance(rule_style.z, context)) || StyleParser.defaults.z;

        // point style only supports sizes in pixel units, so unit conversion flag is off
        style.size = rule_style.size || { value: [32, 32] };
        style.size = StyleParser.cacheDistance(style.size, context, 'pixels');

        // scale size to 16-bit signed int, with a max allowed width + height of 128 pixels
        style.size = [
            Math.min((style.size[0] || style.size), 256),
            Math.min((style.size[1] || style.size), 256)
        ];

        style.size[0] *= Utils.device_pixel_ratio;
        style.size[1] *= Utils.device_pixel_ratio;

        style.angle = rule_style.angle || 0;
        if (typeof style.angle === 'function') {
            style.angle = style.angle(context);
        }

        // factor by which point scales from current zoom level to next zoom level
        style.scale = rule_style.scale || 1;

        // to store bbox by tiles
        style.tile = tile;

        // polygons rendering as points will render each individual polygon point by default, but
        // rendering a single point at the polygon's centroid can be enabled
        style.centroid = rule_style.centroid;

        // Sets texcoord scale if needed (e.g. for sprite sub-area)
        if (this.texture && style.sprite) {
            this.texcoord_scale = Texture.getSpriteTexcoords(this.texture, style.sprite);
            if (!this.texcoord_scale) {
                log.warn(`Style: in style '${this.name}', could not find sprite '${style.sprite}' for texture '${this.texture}'`);
            }
        } else {
            this.texcoord_scale = null;
        }

        return style;
    },

    preprocess (draw) {
        draw.color = draw.color && { value: draw.color };
        draw.z = draw.z && { value: draw.z };
        draw.size = draw.size && { value: draw.size };
    },

    /**
     * A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
     * A plain JS array matching the order of the vertex layout.
     */
    makeVertexTemplate(style) {
        var color = style.color || StyleParser.defaults.color;

        // position - x & y coords will be filled in per-vertex below
        this.vertex_template[0] = 0;
        this.vertex_template[1] = 0;
        this.vertex_template[2] = style.z || 0;

        // scaling vector - (x, y) components per pixel, z = angle, w = scaling factor
        this.vertex_template[3] = 0;
        this.vertex_template[4] = 0;
        this.vertex_template[5] = 0;
        this.vertex_template[6] = 0;

        // color
        this.vertex_template[7] = color[0] * 255;
        this.vertex_template[8] = color[1] * 255;
        this.vertex_template[9] = color[2] * 255;
        this.vertex_template[10] = color[3] * 255;

        // selection color
        this.vertex_template[11] = style.selection_color[0] * 255;
        this.vertex_template[12] = style.selection_color[1] * 255;
        this.vertex_template[13] = style.selection_color[2] * 255;
        this.vertex_template[14] = style.selection_color[3] * 255;

        // texture coords
        this.vertex_template[15] = 0;
        this.vertex_template[16] = 0;

        // Add layer attribute if needed
        if (this.defines.TANGRAM_ORDER_ATTRIBUTE) {
            this.vertex_template[17] = style.order;
        }

        return this.vertex_template;
    },

    buildPoints (points, style, vertex_data) {
        if (!style.size) {
            return;
        }

        var vertex_template = this.makeVertexTemplate(style);

        let size = style.size;
        let angle = style.angle;

        Builders.buildSpriteQuadsForPoints(
            points,
            Utils.scaleInt16(size[0], 256), Utils.scaleInt16(size[1], 256),
            Utils.scaleInt16(Utils.radToDeg(angle), 360),
            Utils.scaleInt16(style.scale, 256),
            vertex_data,
            vertex_template,
            this.vertex_layout.index.a_shape,
            { texcoord_index: this.vertex_layout.index.a_texcoord, texcoord_scale: this.texcoord_scale }
        );
    },

    buildPolygons(polygons, style, vertex_data) {
        // Render polygons as individual points, or centroid
        if (!style.centroid) {
            for (let poly=0; poly < polygons.length; poly++) {
                let polygon = polygons[poly];
                for (let r=0; r < polygon.length; r++) {
                    this.buildPoints(polygon[r], style, vertex_data);
                }
            }
        }
        else {
            let centroid = Utils.multiCentroid(polygons);
            this.buildPoints([centroid], style, vertex_data);
        }
    },

    buildLines(lines, style, vertex_data) {
        // Render lines as individual points
        for (let ln=0; ln < lines.length; ln++) {
            this.buildPoints(lines[ln], style, vertex_data);
        }
    }

});
