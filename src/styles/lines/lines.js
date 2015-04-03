// Line rendering style

import {Style} from '../style';
import {StyleParser} from '../style_parser';
import gl from '../../gl/constants'; // web workers don't have access to GL context, so import all GL constants
import VertexLayout from '../../gl/vertex_layout';
import Builders from '../builders';

export var Lines = Object.create(Style);

Object.assign(Lines, {
    name: 'lines',
    built_in: true,
    vertex_shader_key: 'styles/lines/lines.vertex',
    fragment_shader_key: 'styles/polygons/polygons.fragment', // re-use polygon fragment
    selection: true,

    init() {
        Style.init.apply(this, arguments);

        // Default world coords to wrap every 100,000 meters, can turn off by setting this to 'false'
        this.defines['WORLD_POSITION_WRAP'] = 100000;

        // Basic attributes, others can be added (see texture UVs below)
        var attribs = [
            { name: 'a_position', size: 3, type: gl.FLOAT, normalized: false },
            { name: 'a_extrude', size: 3, type: gl.FLOAT, normalized: false },
            { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
            { name: 'a_selection_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
            { name: 'a_layer', size: 1, type: gl.FLOAT, normalized: false }
        ];

        // Optional texture UVs
        if (this.texcoords) {
            this.defines['TEXTURE_COORDS'] = true;

            // Add vertex attribute for UVs only when needed
            attribs.push({ name: 'a_texcoord', size: 2, type: gl.FLOAT, normalized: false });
        }

        this.vertex_layout = new VertexLayout(attribs);
    },

    _parseFeature (feature, rule_style, context) {
        var style = this.feature_style;

        style.color = rule_style.color && StyleParser.parseColor(rule_style.color, context);
        style.width = rule_style.width && StyleParser.parseDistance(rule_style.width, context);
        style.z = (rule_style.z && StyleParser.parseDistance(rule_style.z || 0, context)) || StyleParser.defaults.z;

        // height defaults to feature height, but extrude style can dynamically adjust height by returning a number or array (instead of a boolean)
        style.height = feature.properties.height || StyleParser.defaults.height;
        style.extrude = rule_style.extrude;
        if (style.extrude) {
            if (typeof style.extrude === 'function') {
                style.extrude = style.extrude(context);
            }

            if (typeof style.extrude === 'number') {
                style.height = style.extrude;
            }
            else if (Array.isArray(style.extrude)) {
                style.height = style.extrude[1];
            }
        }

        style.cap = rule_style.cap;
        style.join = rule_style.join;
        style.tile_edges = rule_style.tile_edges;

        style.outline = style.outline || {};
        if (rule_style.outline) {
            style.outline.color = StyleParser.parseColor(rule_style.outline.color, context);
            style.outline.width = StyleParser.parseDistance(rule_style.outline.width, context);
            style.outline.cap = rule_style.outline.cap || rule_style.cap;
            style.outline.join = rule_style.outline.join || rule_style.join;
        }
        else {
            style.outline.color = null;
            style.outline.width = null;
        }

        return style;
    },

    /**
     * A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
     * A plain JS array matching the order of the vertex layout.
     */
    makeVertexTemplate(style) {
        // Placeholder values
        var color = style.color || [0, 0, 0, 1];

        // Basic attributes, others can be added (see texture UVs below)
        var template = [
            // position - x & y coords will be filled in per-vertex below
            0, 0, style.z || 0,
            // extrusion vector
            0, 0, 0,
            // color
            // TODO: automate multiplication for normalized attribs?
            color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255,
            // selection color
            style.selection_color[0] * 255, style.selection_color[1] * 255, style.selection_color[2] * 255, style.selection_color[3] * 255,
            // draw order
            style.order
        ];

        // Add texture UVs to template only if needed
        if (this.texcoords) {
            template.push(0, 0);
        }

        return template;

    },

    buildLines(lines, style, vertex_data, options = {}) {
        var vertex_template = this.makeVertexTemplate(style);

        // Raise line height if extruded
        let z = style.z;
        if (style.extrude && style.height) {
            z += style.height;
        }
        vertex_template[2] = z;

        // Main line
        if (style.color && style.width) {
            Builders.buildPolylines(
                lines,
                style.width,
                vertex_data,
                vertex_template,
                {
                    cap: style.cap,
                    join: style.join,
                    scaling_index: this.vertex_layout.index.a_extrude,
                    texcoord_index: this.vertex_layout.index.a_texcoord,
                    texcoord_scale: this.texcoord_scale,
                    closed_polygon: options.closed_polygon,
                    remove_tile_edges: !style.tile_edges && options.remove_tile_edges
                }
            );
        }

        // Outline
        if (style.outline && style.outline.color && style.outline.width) {
            // Replace color in vertex template
            var color_index = this.vertex_layout.index.a_color;
            vertex_template[color_index + 0] = style.outline.color[0] * 255;
            vertex_template[color_index + 1] = style.outline.color[1] * 255;
            vertex_template[color_index + 2] = style.outline.color[2] * 255;

            // Line outlines sit underneath current layer but above the one below
            vertex_template[this.vertex_layout.index.a_layer] -= 0.5;

            Builders.buildPolylines(
                lines,
                style.width + 2 * style.outline.width,
                vertex_data,
                vertex_template,
                {
                    cap: style.outline.cap,
                    join: style.outline.join,
                    scaling_index: this.vertex_layout.index.a_extrude,
                    texcoord_index: this.vertex_layout.index.a_texcoord,
                    texcoord_scale: this.texcoord_scale,
                    closed_polygon: options.closed_polygon,
                    remove_tile_edges: !style.tile_edges && options.remove_tile_edges
                }
            );
        }
    },

    buildPolygons(polygons, style, vertex_data) {
        // Render polygons as individual lines
        for (let p=0; p < polygons.length; p++) {
            this.buildLines(polygons[p], style, vertex_data, { closed_polygon: true, remove_tile_edges: true });
        }
    }

});
