// Points rendering style w/simple distance field rendering

import {Style} from '../style';
import {StyleParser} from '../style_parser';
import gl from '../../gl/constants'; // web workers don't have access to GL context, so import all GL constants
import VertexLayout from '../../gl/vertex_layout';
import Builders from '../builders';

export var Points = Object.create(Style);

Object.assign(Points, {
    name: 'points',
    built_in: true,

    init() {
        Style.init.apply(this);

        // Base shaders
        this.vertex_shader_key = 'styles/points/points.vertex';
        this.fragment_shader_key = 'styles/points/points.fragment';

        // Turn feature selection on
        this.selection = true;

        // Vertex attributes
        this.vertex_layout = new VertexLayout([
            { name: 'a_position', size: 3, type: gl.FLOAT, normalized: false },
            { name: 'a_texcoord', size: 2, type: gl.FLOAT, normalized: false },
            { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
            { name: 'a_selection_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
            { name: 'a_layer', size: 1, type: gl.FLOAT, normalized: false }
        ]);
    },

    _parseFeature (feature, rule_style, context) {
        var style = this.feature_style;
        style.color = rule_style.color && StyleParser.parseColor(rule_style.color, context);
        style.size = rule_style.size && StyleParser.parseDistance(rule_style.size, context);
        style.z = (rule_style.z && StyleParser.parseDistance(rule_style.z || 0, context)) || StyleParser.defaults.z;
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
            style.color[0] * 255, style.color[1] * 255, style.color[2] * 255, style.color[3] * 255,
            // selection color
            style.selection_color[0] * 255, style.selection_color[1] * 255, style.selection_color[2] * 255, style.selection_color[3] * 255,
            // draw order
            style.order
        ];
    },

    buildPoints(points, style, vertex_data) {
        if (!style.color || !style.size) {
            return;
        }

        var vertex_template = this.makeVertexTemplate(style);

        Builders.buildQuadsForPoints(
            points,
            style.size[0] || style.size,
            style.size[1] || style.size,
            vertex_data,
            vertex_template,
            { texcoord_index: this.vertex_layout.index.a_texcoord }
        );

    }

});
