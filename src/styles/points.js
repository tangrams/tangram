// Points rendering style w/simple distance field rendering

import {Style} from './style';
import {StyleParser} from './style_parser';
import gl from '../gl/gl_constants'; // web workers don't have access to GL context, so import all GL constants
import GLVertexLayout from '../gl/gl_vertex_layout';
import {GLBuilders} from '../gl/gl_builders';

export var Points = Object.create(Style);

Object.assign(Points, {
    name: 'points',
    built_in: true,

    init() {
        Style.init.apply(this);

        // Base shaders
        this.vertex_shader_key = 'point_vertex';
        this.fragment_shader_key = 'point_fragment';

        // Turn feature selection on
        this.selection = true;

        // Vertex attributes
        this.vertex_layout = new GLVertexLayout([
            { name: 'a_position', size: 3, type: gl.FLOAT, normalized: false },
            { name: 'a_texcoord', size: 2, type: gl.FLOAT, normalized: false },
            { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
            { name: 'a_selection_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
            { name: 'a_layer', size: 1, type: gl.FLOAT, normalized: false }
        ]);
    },

    _parseFeature (feature, feature_style, context) {
        var style = this.feature_style;
        style.color = feature_style.color && StyleParser.parseColor(feature_style.color, context);
        style.size = feature_style.size && StyleParser.parseDistance(feature_style.size, context);
        style.z = (feature_style.z && StyleParser.parseDistance(feature_style.z || 0, context)) || StyleParser.defaults.z;
        return style;
    },

    /**
     * A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
     * A plain JS array matching the order of the vertex layout.
     */
    makeVertexTemplate(style) {
        return [
            // position - x & y coords will be filled in per-vertex below
            0, 0, style.z,
            // texture coords
            0, 0,
            // color
            // TODO: automate multiplication for normalized attribs?
            style.color[0] * 255, style.color[1] * 255, style.color[2] * 255, 255,
            // selection color
            style.selection_color[0] * 255, style.selection_color[1] * 255, style.selection_color[2] * 255, style.selection_color[3] * 255,
            // layer number
            style.layer
        ];
    },

    buildPoints(points, style, vertex_data) {
        if (!style.color || !style.size) {
            return;
        }

        var vertex_template = this.makeVertexTemplate(style);

        GLBuilders.buildQuadsForPoints(
            points,
            style.size * 2,
            style.size * 2,
            vertex_data,
            vertex_template,
            { texcoord_index: this.vertex_layout.index.a_texcoord }
        );

    }

});
