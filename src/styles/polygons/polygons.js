// Polygon rendering style

import {Style} from '../style';
import {StyleParser} from '../style_parser';
import gl from '../../gl/constants'; // web workers don't have access to GL context, so import all GL constants
import VertexLayout from '../../gl/vertex_layout';
import Builders from '../builders';
import Geo from '../../geo';

export var Polygons = Object.create(Style);

Object.assign(Polygons, {
    name: 'polygons',
    built_in: true,
    vertex_shader_key: 'styles/polygons/polygons_vertex',
    fragment_shader_key: 'styles/polygons/polygons_fragment',
    selection: true, // turn feature selection on

    init() {
        Style.init.apply(this, arguments);

        // Basic attributes, others can be added (see texture UVs below)
        var attribs = [
            { name: 'a_position', size: 4, type: gl.SHORT, normalized: true },
            { name: 'a_normal', size: 3, type: gl.BYTE, normalized: true }, // gets padded to 4-bytes
            { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true }
        ];

        // Tell the shader we have a normal and order attributes
        this.defines.TANGRAM_NORMAL_ATTRIBUTE = true;
        this.defines.TANGRAM_LAYER_ORDER = true;

        // Optional feature selection
        if (this.selection) {
            attribs.push({ name: 'a_selection_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true });
        }

        // Optional texture UVs
        if (this.texcoords) {
            this.defines.TANGRAM_TEXTURE_COORDS = true;

            // Add vertex attribute for UVs only when needed
            attribs.push({ name: 'a_texcoord', size: 2, type: gl.UNSIGNED_SHORT, normalized: true });
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
        style.extrude = StyleParser.evalProp(rule_style.extrude, context);
        if (style.extrude) {
            if (typeof style.extrude === 'number') {
                style.height = style.extrude;
            }
            else if (Array.isArray(style.extrude)) {
                style.min_height = style.extrude[0];
                style.height = style.extrude[1];
            }
        }

        style.tile_edges = rule_style.tile_edges; // usually activated for debugging, or rare visualization needs

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

    _preprocess (draw) {
        draw.color = StyleParser.colorCacheObject(draw.color);
        draw.z = StyleParser.cacheObject(draw.z, StyleParser.cacheUnits);
        return draw;
    },

    /**
     * A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
     * A plain JS array matching the order of the vertex layout.
     */
    makeVertexTemplate(style) {
        let i = 0;

        // position - x & y coords will be filled in per-vertex below
        this.vertex_template[i++] = 0;
        this.vertex_template[i++] = 0;
        this.vertex_template[i++] = style.z || 0;

        // layer order - w coord of 'position' attribute (for packing efficiency)
        this.vertex_template[i++] = style.order;

        // normal
        this.vertex_template[i++] = 0;
        this.vertex_template[i++] = 0;
        this.vertex_template[i++] = 1 * 127;

        // color
        this.vertex_template[i++] = style.color[0] * 255;
        this.vertex_template[i++] = style.color[1] * 255;
        this.vertex_template[i++] = style.color[2] * 255;
        this.vertex_template[i++] = style.color[3] * 255;

        // selection color
        if (this.selection) {
            this.vertex_template[i++] = style.selection_color[0] * 255;
            this.vertex_template[i++] = style.selection_color[1] * 255;
            this.vertex_template[i++] = style.selection_color[2] * 255;
            this.vertex_template[i++] = style.selection_color[3] * 255;
        }

        // Add texture UVs to template only if needed
        if (this.texcoords) {
            this.vertex_template[i++] = 0;
            this.vertex_template[i++] = 0;
        }

        return this.vertex_template;
    },

    buildPolygons(polygons, style, vertex_data, context) {
        let vertex_template = this.makeVertexTemplate(style);
        let options = {
            texcoord_index: this.vertex_layout.index.a_texcoord,
            texcoord_scale: this.texcoord_scale,
            texcoord_normalize: 65535, // scale UVs to unsigned shorts
            remove_tile_edges: !style.tile_edges,
            tile_edge_tolerance: Geo.tile_scale * context.tile.pad_scale * 4,
            winding: context.winding
        };

        // Extruded polygons (e.g. 3D buildings)
        if (style.extrude && style.height) {
            Builders.buildExtrudedPolygons(
                polygons,
                style.z, style.height, style.min_height,
                vertex_data, vertex_template,
                this.vertex_layout.index.a_normal,
                127, // scale normals to signed bytes
                options
            );
        }
        // Regular polygons
        else {
            Builders.buildPolygons(
                polygons,
                vertex_data, vertex_template,
                options
            );
        }
    }

});
