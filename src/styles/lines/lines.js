// Line rendering style

import {Style} from '../style';
import {StyleParser} from '../style_parser';
import {StyleManager} from '../style_manager';
import gl from '../../gl/constants'; // web workers don't have access to GL context, so import all GL constants
import VertexLayout from '../../gl/vertex_layout';
import Builders from '../builders';
import Geo from '../../geo';
import Utils from '../../utils/utils';

export var Lines = Object.create(Style);

Object.assign(Lines, {
    name: 'lines',
    built_in: true,
    vertex_shader_key: 'styles/polygons/polygons_vertex', // re-use polygon shaders
    fragment_shader_key: 'styles/polygons/polygons_fragment',
    selection: true, // turn feature selection on

    init() {
        Style.init.apply(this, arguments);

        // Basic attributes, others can be added (see texture UVs below)
        var attribs = [
            { name: 'a_position', size: 4, type: gl.SHORT, normalized: true },
            { name: 'a_extrude', size: 4, type: gl.SHORT, normalized: true },
            { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true }
        ];

        // Tell the shader we want a order in vertex attributes, and to extrude lines
        this.defines.TANGRAM_LAYER_ORDER = true;
        this.defines.TANGRAM_EXTRUDE_LINES = true;

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

        let inner_width = rule_style.width && StyleParser.cacheDistance(rule_style.width, context);
        if (!inner_width) {
            return;
        }
        style.width = inner_width * context.units_per_meter;

        // Smoothly interpolate line width between zooms: get scale factor to next zoom
        // Adjust by factor of 2 because tile units are zoom-dependent (a given value is twice as
        // big in world space at the next zoom than at the previous)
        context.zoom ++;
        context.units_per_meter *= 2;
        let next_width = StyleParser.cacheDistance(rule_style.next_width, context);
        style.next_width = Utils.scaleInt16(next_width * context.units_per_meter / style.width, 256);
        context.zoom--;
        context.units_per_meter /= 2; // reset to original scale

        style.color = this.parseColor(rule_style.color, context);
        if (!style.color) {
            return null;
        }

        // height defaults to feature height, but extrude style can dynamically adjust height by returning a number or array (instead of a boolean)
        style.z = (rule_style.z && StyleParser.cacheDistance(rule_style.z || 0, context)) || StyleParser.defaults.z;
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

        // Raise line height if extruded
        if (style.extrude && style.height) {
            style.z += style.height;
        }

        style.cap = rule_style.cap;
        style.join = rule_style.join;
        style.tile_edges = rule_style.tile_edges; // usually activated for debugging, or rare visualization needs

        // Construct an outline style
        style.outline = style.outline || {};
        if (rule_style.outline && rule_style.outline.color && rule_style.outline.width) {
            let outline_width = StyleParser.cacheDistance(rule_style.outline.width, context) * 2;

            context.zoom ++;
            context.units_per_meter *= 2;
            let outline_next_width = StyleParser.cacheDistance(rule_style.outline.next_width, context) * 2;
            context.zoom--;
            context.units_per_meter /= 2; // reset to original scale

            // Maintain consistent outline width around the inner line
            style.outline.width = { value: outline_width + inner_width };
            style.outline.next_width = { value: outline_next_width + next_width };

            style.outline.color = rule_style.outline.color;
            style.outline.cap = rule_style.outline.cap || rule_style.cap;
            style.outline.join = rule_style.outline.join || rule_style.join;
            style.outline.style = rule_style.outline.style || this.name;

            // Explicitly defined outline order, or inherited from inner line
            if (rule_style.outline.order) {
                style.outline.order = this.parseOrder(rule_style.outline.order, context);
            }
            else {
                style.outline.order = style.order;
            }

            // Don't let outline be above inner line
            if (style.outline.order > style.order) {
                style.outline.order = style.order;
            }

            // Outlines are always at half-layer intervals to avoid conflicting with inner lines
            style.outline.order -= 0.5;

            style.outline.preprocessed = true; // signal that we've already wrapped properties in cache objects
        }
        else {
            style.outline.color = null;
            style.outline.width = null;
        }

        return style;
    },

    preprocess (draw) {
        draw.color = draw.color && { value: draw.color };
        draw.width = draw.width && { value: draw.width };
        draw.next_width = draw.width && { value: draw.width.value };
        draw.z = draw.z && { value: draw.z };

        if (draw.outline) {
            draw.outline.color = draw.outline.color && { value: draw.outline.color };
            draw.outline.width = draw.outline.width && { value: draw.outline.width };
            draw.outline.next_width = draw.outline.width && { value: draw.outline.width.value };
        }
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

        // extrusion vector
        this.vertex_template[i++] = 0;
        this.vertex_template[i++] = 0;
        this.vertex_template[i++] = 0;

        // scaling to previous and next zoom
        this.vertex_template[i++] = style.next_width;

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

    buildLines(lines, style, vertex_data, context, options) {
        var vertex_template = this.makeVertexTemplate(style);

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
                    scaling_normalize: Utils.scaleInt16(1, 256), // scale extrusion normals to signed shorts w/256 unit basis
                    texcoord_index: this.vertex_layout.index.a_texcoord,
                    texcoord_scale: this.texcoord_scale,
                    texcoord_normalize: 65535, // scale UVs to unsigned shorts
                    closed_polygon: options && options.closed_polygon,
                    remove_tile_edges: !style.tile_edges && options && options.remove_tile_edges,
                    tile_edge_tolerance: Geo.tile_scale * context.tile.pad_scale * 4
                }
            );
        }

        // Outline
         if (style.outline && style.outline.color && style.outline.width) {
            var outline_style = StyleManager.styles[style.outline.style];
            if (outline_style) {
                outline_style.addFeature(context.feature, style.outline, context);
            }
        }
    },

    buildPolygons(polygons, style, vertex_data, context) {
        // Render polygons as individual lines
        for (let p=0; p < polygons.length; p++) {
            this.buildLines(polygons[p], style, vertex_data, context, { closed_polygon: true, remove_tile_edges: true });
        }
    }

});
