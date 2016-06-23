// Line rendering style

import {Style} from '../style';
import {StyleParser} from '../style_parser';
import {StyleManager} from '../style_manager';
import gl from '../../gl/constants'; // web workers don't have access to GL context, so import all GL constants
import Texture from '../../gl/texture';
import VertexLayout from '../../gl/vertex_layout';
import {buildPolylines} from '../../builders/polylines';
import renderDashArray from './dasharray';
import Geo from '../../geo';
import {shaderSrc_polygonsVertex, shaderSrc_polygonsFragment} from '../polygons/polygons';

export var Lines = Object.create(Style);

Object.assign(Lines, {
    name: 'lines',
    built_in: true,
    vertex_shader_src: shaderSrc_polygonsVertex,
    fragment_shader_src: shaderSrc_polygonsFragment,
    selection: true, // turn feature selection on

    init() {
        Style.init.apply(this, arguments);

        // Basic attributes, others can be added (see texture UVs below)
        var attribs = [
            { name: 'a_position', size: 4, type: gl.SHORT, normalized: false },
            { name: 'a_extrude', size: 4, type: gl.SHORT, normalized: false },
            { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true }
        ];

        // Tell the shader we want a order in vertex attributes, and to extrude lines
        this.defines.TANGRAM_LAYER_ORDER = true;
        this.defines.TANGRAM_EXTRUDE_LINES = true;

        // Optional feature selection
        if (this.selection) {
            attribs.push({ name: 'a_selection_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true });
        }

        // Optional line texture or dash array
        // (latter will be rendered at compile-time, when GL context available)
        if (this.texture || this.dash) {
            this.texcoords = true;
        }

        // Optional texture UVs
        if (this.texcoords) {
            this.defines.TANGRAM_TEXTURE_COORDS = true;

            // Scaling factor to add precision to line texture V coordinate packed as normalized short
            this.defines.TANGRAM_V_SCALE_ADJUST = Geo.tile_scale;

            // Add vertex attribute for UVs only when needed
            attribs.push({ name: 'a_texcoord', size: 2, type: gl.UNSIGNED_SHORT, normalized: true });
        }

        this.vertex_layout = new VertexLayout(attribs);

        // Additional single-allocated object used for holding outline style as it is processed
        // Separate from this.feature_style so that outline properties do not overwrite calculated
        // inline properties (outline call is made *within* the inline call)
        this.outline_feature_style = {};
        this.inline_feature_style = this.feature_style; // save reference to main computed style object
    },

    // Override
    compile () {
        this.parseLineTexture();
        return Style.compile.apply(this, arguments);
    },

    // Optionally apply a dash array pattern to this line
    parseLineTexture () {
        // Specify a line pattern
        if (this.dash) {
            // Optional background color for dash pattern (defaults transparent)
            if (this.dash_background_color) {
                this.dash_background_color = StyleParser.parseColor(this.dash_background_color);
                this.defines.TANGRAM_LINE_BACKGROUND_COLOR =
                    `vec3(${this.dash_background_color.slice(0, 3).join(', ')})`;
            }

            // Render line pattern
            let dash = renderDashArray(this.dash);
            this.texture = '_' + this.name + '_dasharray';
            Texture.create(this.gl, this.texture, {
                data: dash.pixels,
                height: dash.length,
                width: 1,
                filtering: 'nearest'
            });
        }

        // Specify a line texture (either directly, or rendered dash pattern from above)
        if (this.texture) {
            this.defines.TANGRAM_LINE_TEXTURE = true;
            this.defines.TANGRAM_ALPHA_TEST = 0.5; // pixels below this threshold are transparent
            this.shaders.uniforms = this.shaders.uniforms || {};
            this.shaders.uniforms.u_texture = this.texture;
            this.shaders.uniforms.u_texture_ratio = 1;

            // update line pattern aspect ratio after texture loads
            Texture.getInfo(this.texture).then(texture => {
                if (texture) {
                    this.shaders.uniforms.u_texture_ratio = texture.height / texture.width;
                }
            });
        }
    },

    // Calculate width at zoom given in `context`
    calcWidth (width, context) {
        return (width && StyleParser.cacheDistance(width, context)) || 0;
    },

    // Calculate width at next zoom (used for line width interpolation)
    calcWidthNextZoom (width, context) {
        context.zoom++;
        let val = this.calcWidth(width, context);
        context.zoom--;
        return val;
    },

    _parseFeature (feature, draw, context) {
        var style = this.feature_style;

        // line width in meters
        let width = this.calcWidth(draw.width, context);
        if (width < 0) {
            return; // skip lines with negative width
        }
        let next_width = this.calcWidthNextZoom(draw.next_width, context);

        if ((width === 0 && next_width === 0) || next_width < 0) {
            return; // skip lines that don't interpolate to a positive value at next zoom
        }

        // convert to units and relative change from previous zoom
        // NB: multiply by 2 because a given width is twice as big in screen space at the next zoom
        style.width = width * context.units_per_meter_overzoom;
        style.next_width = (next_width * 2) - width;
        style.next_width *= context.units_per_meter_overzoom;
        style.next_width /= 2; // NB: divide by 2 because extrusion width is halved in builder - remove?

        style.color = this.parseColor(draw.color, context);
        if (!style.color) {
            return;
        }

        // height defaults to feature height, but extrude style can dynamically adjust height by returning a number or array (instead of a boolean)
        style.z = (draw.z && StyleParser.cacheDistance(draw.z || 0, context)) || StyleParser.defaults.z;
        style.height = feature.properties.height || StyleParser.defaults.height;
        style.extrude = StyleParser.evalProp(draw.extrude, context);
        if (style.extrude) {
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

        style.z *= Geo.height_scale;        // provide sub-meter precision of height values
        style.height *= Geo.height_scale;

        style.cap = draw.cap;
        style.join = draw.join;
        style.miter_limit = draw.miter_limit;
        style.tile_edges = draw.tile_edges; // usually activated for debugging, or rare visualization needs

        // Construct an outline style
        // Reusable outline style object, marked as already wrapped in cache objects (preprocessed = true)
        style.outline = style.outline || { width: {}, next_width: {}, preprocessed: true };

        if (draw.outline && draw.outline.visible !== false && draw.outline.color && draw.outline.width) {
            // outline width in meters
            // NB: multiply by 2 because outline is applied on both sides of line
            let outline_width = this.calcWidth(draw.outline.width, context) * 2;
            let outline_next_width = this.calcWidthNextZoom(draw.outline.next_width, context) * 2;

            if ((outline_width === 0 && outline_next_width === 0) || outline_width < 0 || outline_next_width < 0) {
                // skip lines that don't interpolate between zero or greater width
                style.outline.width.value = null;
                style.outline.next_width.value = null;
                style.outline.color = null;
            }
            else {
                // Maintain consistent outline width around the line fill
                style.outline.width.value = outline_width + width;
                style.outline.next_width.value = outline_next_width + next_width;

                style.outline.color = draw.outline.color;
                style.outline.cap = draw.outline.cap || draw.cap;
                style.outline.join = draw.outline.join || draw.join;
                style.outline.miter_limit = draw.outline.miter_limit || draw.miter_limit;
                style.outline.style = draw.outline.style || this.name;

                // Explicitly defined outline order, or inherited from inner line
                if (draw.outline.order) {
                    style.outline.order = this.parseOrder(draw.outline.order, context);
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
            }
        }
        else {
            style.outline.width.value = null;
            style.outline.next_width.value = null;
            style.outline.color = null;
        }

        return style;
    },

    _preprocess (draw) {
        draw.color = StyleParser.colorCacheObject(draw.color);
        draw.width = StyleParser.cacheObject(draw.width, StyleParser.cacheUnits);
        draw.next_width = StyleParser.cacheObject(draw.width, StyleParser.cacheUnits); // width will be computed for next zoom
        draw.z = StyleParser.cacheObject(draw.z, StyleParser.cacheUnits);

        if (draw.outline) {
            draw.outline.color = StyleParser.colorCacheObject(draw.outline.color);
            draw.outline.width = StyleParser.cacheObject(draw.outline.width, StyleParser.cacheUnits);
            draw.outline.next_width = StyleParser.cacheObject(draw.outline.width, StyleParser.cacheUnits); // width re-computed for next zoom
        }
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
        this.vertex_template[i++] = this.scaleOrder(style.order);

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
        // Outline (build first so that blended geometry without a depth test is drawn first/under the inner line)
        this.feature_style = this.outline_feature_style; // swap in outline-specific style holder
        if (style.outline && style.outline.color != null && style.outline.width.value != null) {
            var outline_style = StyleManager.styles[style.outline.style];
            if (outline_style) {
                outline_style.addFeature(context.feature, style.outline, context);
            }
        }

        // Main line
        this.feature_style = this.inline_feature_style; // restore calculated style for inline
        let vertex_template = this.makeVertexTemplate(style);
        buildPolylines(
            lines,
            style.width,
            vertex_data,
            vertex_template,
            {
                cap: style.cap,
                join: style.join,
                miter_limit: style.miter_limit,
                scaling_index: this.vertex_layout.index.a_extrude,
                scaling_normalize: 256, // values have an 8-bit fraction
                texcoord_index: this.vertex_layout.index.a_texcoord,
                texcoord_width: (style.width || style.next_width) / context.tile.overzoom2, // UVs can't calc for zero-width, use next zoom width in that case
                texcoord_normalize: 65535, // scale UVs to unsigned shorts
                closed_polygon: options && options.closed_polygon,
                remove_tile_edges: !style.tile_edges && options && options.remove_tile_edges,
                tile_edge_tolerance: Geo.tile_scale * context.tile.pad_scale * 4
            }
        );
    },

    buildPolygons(polygons, style, vertex_data, context) {
        // Render polygons as individual lines
        for (let p=0; p < polygons.length; p++) {
            this.buildLines(polygons[p], style, vertex_data, context, { closed_polygon: true, remove_tile_edges: true });
        }
    }

});
