// Polygon rendering style

import {Style} from './style';
import {StyleParser} from './style_parser';
import gl from '../gl/gl_constants'; // web workers don't have access to GL context, so import all GL constants
import GLVertexLayout from '../gl/gl_vertex_layout';
import {GLBuilders} from '../gl/gl_builders';

export var Polygons = Object.create(Style);

Object.assign(Polygons, {
    built_in: true,

    init() {
        Style.init.apply(this);

        // Base shaders
        this.vertex_shader_key = 'polyline_vertex';
        this.fragment_shader_key = 'polyline_fragment';

        // Default world coords to wrap every 100,000 meters, can turn off by setting this to 'false'
        this.defines['WORLD_POSITION_WRAP'] = 100000;

        // Turn feature selection on
        this.selection = true;

        // Basic attributes, others can be added (see texture UVs below)
        var attribs = [
            { name: 'a_position', size: 3, type: gl.FLOAT, normalized: false },

            // Replacing NORMAL (that is always up)
            // { name: 'a_normal', size: 3, type: gl.FLOAT, normalized: false },
            // For two values for the direction and one for the width 
            { name: 'a_extrudeNormal', size: 2, type: gl.FLOAT, normalized: false },
            { name: 'a_extrudeWidth', size: 1, type: gl.FLOAT, normalized: false },

            { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },

            //  CAN I DELETE THIS??? It is use in roads?
            { name: 'a_selection_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },

            { name: 'a_layer', size: 1, type: gl.FLOAT, normalized: false }
        ];

        // Optional texture UVs
        if (this.texcoords) {
            this.defines['TEXTURE_COORDS'] = true;

            // Add vertex attribute for UVs only when needed
            attribs.push({ name: 'a_texcoord', size: 2, type: gl.FLOAT, normalized: false });
        }

        this.vertex_layout = new GLVertexLayout(attribs);
    },

    _parseFeature (feature, feature_style, context) {
        var style = this.feature_style;

        style.color = feature_style.color && StyleParser.parseColor(feature_style.color, context);
        style.width = feature_style.width && StyleParser.parseDistance(feature_style.width, context);
        style.size = feature_style.size && StyleParser.parseDistance(feature_style.size, context);
        style.z = (feature_style.z && StyleParser.parseDistance(feature_style.z || 0, context)) || StyleParser.defaults.z;

        // height defaults to feature height, but extrude style can dynamically adjust height by returning a number or array (instead of a boolean)
        style.height = feature.properties.height || StyleParser.defaults.height;
        style.min_height = feature.properties.min_height || StyleParser.defaults.min_height;
        style.extrude = feature_style.extrude;
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

        style.outline = style.outline || {};
        if (feature_style.outline) {
            style.outline.color = StyleParser.parseColor(feature_style.outline.color, context);
            style.outline.width = StyleParser.parseDistance(feature_style.outline.width, context);
            style.outline.tile_edges = feature_style.outline.tile_edges;
        }
        else {
            style.outline.color = null;
            style.outline.width = null;
            style.outline.tile_edges = false;
        }

        return style;
    },

    /**
     * A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
     * A plain JS array matching the order of the vertex layout.
     */
    makeVertexTemplate(style) {
        // Placeholder values
        var color = style.color || [0, 0, 0];

        // Basic attributes, others can be added (see texture UVs below)
        var template = [
            // position - x & y coords will be filled in per-vertex below
            0, 0, style.z || 0,
            // extrusion normal
            0, 0, 
            // extrusion width
            0,
            // color
            // TODO: automate multiplication for normalized attribs?
            color[0] * 255, color[1] * 255, color[2] * 255, 255,
            // selection color
            style.selection_color[0] * 255, style.selection_color[1] * 255, style.selection_color[2] * 255, style.selection_color[3] * 255,
            // layer number
            style.layer
        ];

        if (this.texcoords) {
            // Add texture UVs to template only if needed
            template.push(0, 0);
        }

        return template;

    },

    buildLines(lines, style, vertex_data) {
        var vertex_template = this.makeVertexTemplate(style);

        // Main line
        if (style.color && style.width) {
            GLBuilders.buildPolylines(
                lines,
                style.z,
                style.width,    // NOTE: This supose to be pass as atribute. 
                vertex_data,
                vertex_template,
                {
                    texcoord_index: this.vertex_layout.index.a_texcoord,
                    useScalingVecs: true
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
            // TODO: address inconsistency with polygon outlines
            // TODO: need more fine-grained styling controls for outlines
            // (see complex road interchanges where casing outlines should be interleaved by road type)
            vertex_template[this.vertex_layout.index.a_layer] -= 0.0001;

            GLBuilders.buildPolylines(
                lines,
                style.z,
                style.width + 2 * style.outline.width,
                vertex_data,
                vertex_template,
                {
                    texcoord_index: this.vertex_layout.index.a_texcoord,
                    useScalingVecs: true
                }
            );
        }
    },
    name: 'polylines'
});
