// Polygon rendering style

import {Style} from '../style';
import {StyleParser} from '../style_parser';
import gl from '../../gl/constants'; // web workers don't have access to GL context, so import all GL constants
import VertexLayout from '../../gl/vertex_layout';
import Builders from '../builders';

export var Polygons = Object.create(Style);

Object.assign(Polygons, {
    name: 'polygons',
    built_in: true,

    init() {
        Style.init.apply(this, arguments);

        // Base shaders
        this.vertex_shader_key = 'styles/polygons/polygons_vertex';
        this.fragment_shader_key = 'styles/polygons/polygons_fragment';

        // Turn feature selection on
        this.selection = true;

        // Basic attributes, others can be added (see texture UVs below)
        var attribs = [
            { name: 'a_position', size: 3, type: gl.FLOAT, normalized: false },
            { name: 'a_normal', size: 3, type: gl.FLOAT, normalized: false },
            // { name: 'a_normal', size: 3, type: gl.BYTE, normalized: true }, // attrib isn't a multiple of 4!
            // { name: 'a_color', size: 3, type: gl.FLOAT, normalized: false },
            { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
            // { name: 'a_selection_color', size: 4, type: gl.FLOAT, normalized: false },
            { name: 'a_selection_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
            { name: 'a_layer', size: 1, type: gl.FLOAT, normalized: false }
        ];

        // Tell the shader we have a normal and order attributes
        this.defines.TANGRAM_NORMAL_ATTRIBUTE = true;
        this.defines.TANGRAM_ORDER_ATTRIBUTE = true;

        // Optional texture UVs
        if (this.texcoords) {
            this.defines.TANGRAM_TEXTURE_COORDS = true;

            // Add vertex attribute for UVs only when needed
            attribs.push({ name: 'a_texcoord', size: 2, type: gl.FLOAT, normalized: false });
        }

        this.vertex_layout = new VertexLayout(attribs);
    },

    _parseFeature (feature, rule_style, context) {
        var style = this.feature_style;

        style.color = this.parseColor(rule_style.color, context);
        if (!style.color) {
            return null;
        }

        // height defaults to feature height, but extrude style can dynamically adjust height by returning a number or array (instead of a boolean)
        style.z = (rule_style.z && StyleParser.cacheDistance(rule_style.z, context)) || StyleParser.defaults.z;
        style.height = feature.properties.height || StyleParser.defaults.height;
        style.min_height = feature.properties.min_height || StyleParser.defaults.min_height;
        style.extrude = rule_style.extrude;
        if (style.extrude) {
            if (typeof style.extrude === 'function') {
                style.extrude = style.extrude(context);
            }

            if (typeof style.extrude === 'number') {
                style.height = style.extrude;
            }
            else if (Array.isArray(style.extrude)) {
                style.min_height = style.extrude[0];
                style.height = style.extrude[1];
            }
        }

        // style.outline = style.outline || {};
        // if (rule_style.outline) {
        //     style.outline.color = StyleParser.parseColor(rule_style.outline.color, context);
        //     style.outline.width = StyleParser.parseDistance(rule_style.outline.width, context);
        //     style.outline.tile_edges = rule_style.outline.tile_edges;
        //     style.outline.cap = rule_style.outline.cap || rule_style.cap;
        //     style.outline.join = rule_style.outline.join || rule_style.join;
        // }
        // else {
        //     style.outline.color = null;
        //     style.outline.width = null;
        //     style.outline.tile_edges = false;
        // }

        return style;
    },

    preprocess (draw) {
        draw.color = draw.color && { value: draw.color };
        draw.z = draw.z && { value: draw.z };
    },

    /**
     * A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
     * A plain JS array matching the order of the vertex layout.
     */
    makeVertexTemplate(style) {
        // position - x & y coords will be filled in per-vertex below
        this.vertex_template[0] = 0;
        this.vertex_template[1] = 0;
        this.vertex_template[2] = style.z || 0;

        // normal
        this.vertex_template[3] = 0;
        this.vertex_template[4] = 0;
        this.vertex_template[5] = 1;

        // color
        this.vertex_template[6] = style.color[0] * 255;
        this.vertex_template[7] = style.color[1] * 255;
        this.vertex_template[8] = style.color[2] * 255;
        this.vertex_template[9] = style.color[3] * 255;

        // selection color
        this.vertex_template[10] = style.selection_color[0] * 255;
        this.vertex_template[11] = style.selection_color[1] * 255;
        this.vertex_template[12] = style.selection_color[2] * 255;
        this.vertex_template[13] = style.selection_color[3] * 255;

        // layer order
        this.vertex_template[14] = style.order;

        // Add texture UVs to template only if needed
        if (this.texcoords) {
            this.vertex_template[15] = 0;
            this.vertex_template[16] = 0;
        }

        return this.vertex_template;
    },

    buildPolygons(polygons, style, vertex_data) {
        var vertex_template = this.makeVertexTemplate(style);

        // Extruded polygons (e.g. 3D buildings)
        if (style.extrude && style.height) {
            Builders.buildExtrudedPolygons(
                polygons,
                style.z, style.height, style.min_height,
                vertex_data, vertex_template,
                this.vertex_layout.index.a_normal,
                { texcoord_index: this.vertex_layout.index.a_texcoord, texcoord_scale: this.texcoord_scale }
            );
        }
        // Regular polygons
        else {
            Builders.buildPolygons(
                polygons,
                vertex_data, vertex_template,
                { texcoord_index: this.vertex_layout.index.a_texcoord, texcoord_scale: this.texcoord_scale }
            );
        }
    }

});
