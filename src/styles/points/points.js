// Point rendering style

import {Style} from '../style';
import {StyleParser} from '../style_parser';
import gl from '../../gl/constants'; // web workers don't have access to GL context, so import all GL constants
import VertexLayout from '../../gl/vertex_layout';
import Builders from '../builders';
import Texture from '../../gl/texture';
import Geo from '../../geo';
import Utils from '../../utils/utils';
import Vector from '../../vector';
import PointAnchor from './point_anchor';

import log from 'loglevel';

export var Points = Object.create(Style);

Object.assign(Points, {
    name: 'points',
    built_in: true,
    selection: true, // turn feature selection on
    blend: 'overlay', // overlays drawn on top of all other styles, with blending

    init(options = {}) {
        Style.init.apply(this, arguments);

        // Base shaders
        this.vertex_shader_key = 'styles/points/points_vertex';
        this.fragment_shader_key = 'styles/points/points_fragment';

        var attribs = [
            { name: 'a_position', size: 4, type: gl.SHORT, normalized: true },
            { name: 'a_shape', size: 4, type: gl.SHORT, normalized: true },
            { name: 'a_texcoord', size: 2, type: gl.UNSIGNED_SHORT, normalized: true },
            { name: 'a_offset', size: 2, type: gl.SHORT, normalized: true },
            { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true }
        ];

        // Optional feature selection
        if (this.selection) {
            attribs.push({ name: 'a_selection_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true });
        }

        // If we're not rendering as overlay, we need a layer attribute
        if (this.blend !== 'overlay') {
            this.defines.TANGRAM_LAYER_ORDER = true;
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

        let sprite = style.sprite = StyleParser.evalProp(rule_style.sprite, context);
        style.sprite_default = rule_style.sprite_default; // optional fallback if 'sprite' not found

        // if point has texture and sprites, require a valid sprite to draw
        if (this.texture && Texture.textures[this.texture] && Texture.textures[this.texture].sprites) {
            if (!sprite && !style.sprite_default) {
                return;
            }
            else if (!Texture.textures[this.texture].sprites[sprite]) {
                // If sprite not found, check for default sprite
                if (style.sprite_default) {
                    sprite = style.sprite_default;
                    if (!Texture.textures[this.texture].sprites[sprite]) {
                        log.warn(`Style: in style '${this.name}', could not find default sprite '${sprite}' for texture '${this.texture}'`);
                        return;
                    }
                }
                else {
                    log.warn(`Style: in style '${this.name}', could not find sprite '${sprite}' for texture '${this.texture}'`);
                    return;
                }
            }
        }

        // Sets texcoord scale if needed (e.g. for sprite sub-area)
        let sprite_info;
        if (this.texture && sprite) {
            sprite_info = Texture.getSpriteInfo(this.texture, sprite);
            this.texcoord_scale = sprite_info.texcoords;
        } else {
            this.texcoord_scale = null;
        }

        // points can be placed off the ground
        style.z = (rule_style.z && StyleParser.cacheDistance(rule_style.z, context)) || StyleParser.defaults.z;

        // point size defined explicitly, or defaults to sprite size, or generic fallback
        style.size = rule_style.size;
        if (!style.size) {
            if (sprite_info) {
                style.size = { value: sprite_info.size };
            }
            else {
                style.size = { value: [16, 16] };
            }
        }

        // point style only supports sizes in pixel units, so unit conversion flag is off
        style.size = StyleParser.cacheProperty(style.size, context);

        // scale size to 16-bit signed int, with a max allowed width + height of 128 pixels
        style.size = [
            Math.min((style.size[0] || style.size), 256),
            Math.min((style.size[1] || style.size), 256)
        ];

        style.angle = StyleParser.evalProp(rule_style.angle, context) || 0;

        // factor by which point scales from current zoom level to next zoom level
        style.scale = rule_style.scale || 1;

        // to store bbox by tiles
        style.tile = tile;

        // polygons rendering as points will render each individual polygon point by default, but
        // rendering a single point at the polygon's centroid can be enabled
        style.centroid = rule_style.centroid;

        // Offset applied to point in screen space
        style.offset = (Array.isArray(rule_style.offset) && rule_style.offset.map(parseFloat)) || [0, 0];

        // anchor
        style.offset = PointAnchor.computeOffset(style.offset, style.size, rule_style.anchor);

        return style;
    },

    _preprocess (draw) {
        draw.color = StyleParser.colorCacheObject(draw.color);
        draw.z = StyleParser.cacheObject(draw.z, StyleParser.cacheUnits);
        draw.size = StyleParser.cacheObject(draw.size, parseFloat);
        return draw;
    },

    /**
     * A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
     * A plain JS array matching the order of the vertex layout.
     */
    makeVertexTemplate(style) {
        let color = style.color || StyleParser.defaults.color;

        // position - x & y coords will be filled in per-vertex below
        this.fillVertexTemplate('a_position', 0, { size: 2 });
        this.fillVertexTemplate('a_position', style.z || 0, { size: 1, offset: 2 });
        // layer order - w coord of 'position' attribute (for packing efficiency)
        this.fillVertexTemplate('a_position', style.order || 0, { size: 1, offset: 3 });

        // scaling vector - (x, y) components per pixel, z = angle, w = scaling factor
        this.fillVertexTemplate('a_shape', 0, { size: 4 });

        // texture coords
        this.fillVertexTemplate('a_texcoord', 0, { size: 2 });

        // offsets
        this.fillVertexTemplate('a_offset', 0, { size: 2 });

        // color
        this.fillVertexTemplate('a_color', Vector.mult(color, 255), { size: 4 });

        // selection color
        if (this.selection) {
            this.fillVertexTemplate('a_selection_color', Vector.mult(style.selection_color, 255), { size: 4 });
        }

        return this.vertex_template;
    },

    buildQuad (points, size, angle, vertex_data, vertex_template, offset) {
        Builders.buildQuadsForPoints(
            points,
            vertex_data,
            vertex_template,
            {
                texcoord_index: this.vertex_layout.index.a_texcoord,
                position_index: this.vertex_layout.index.a_position,
                shape_index: this.vertex_layout.index.a_shape,
                offset_index: this.vertex_layout.index.a_offset
            },
            {
                quad: [ Utils.scaleInt16(size[0], 256), Utils.scaleInt16(size[1], 256) ],
                quad_scale: Utils.scaleInt16(1, 256),
                offset,
                angle: Utils.scaleInt16(angle, 360),
                texcoord_scale: this.texcoord_scale,
                texcoord_normalize: 65535
            }
        );
    },

    buildPoints (points, style, vertex_data) {
        if (!style.size) {
            return;
        }

        this.buildQuad(points, style.size, style.angle, vertex_data, this.makeVertexTemplate(style), style.offset);
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
            let centroid = Geo.multiCentroid(polygons);
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
