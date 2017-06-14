// Line rendering style

import {Style} from '../style';
import {StyleParser} from '../style_parser';
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
            { name: 'a_extrude', size: 2, type: gl.SHORT, normalized: false },
            { name: 'a_offset', size: 2, type: gl.SHORT, normalized: false },
            { name: 'a_scaling', size: 2, type: gl.SHORT, normalized: false },
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
            this.defines.TANGRAM_DASH_SCALE = 1;
            this.defines.TANGRAM_V_SCALE_ADJUST = Geo.tile_scale * this.defines.TANGRAM_DASH_SCALE;

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
    compileSetup () {
        if (!this.compile_setup) {
            this.parseLineTexture();
        }
        return Style.compileSetup.apply(this, arguments);
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

            // Adjust texcoord scale to allow for dash patterns that are a fraction of line width
            this.defines.TANGRAM_DASH_SCALE = 20;
            this.defines.TANGRAM_V_SCALE_ADJUST = Geo.tile_scale * this.defines.TANGRAM_DASH_SCALE;

            // Render line pattern
            const dash = renderDashArray(this.dash, { scale: this.defines.TANGRAM_DASH_SCALE });
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

    // Calculate width or offset at zoom given in `context`
    calcDistance (prop, context) {
        return (prop && StyleParser.evalCachedDistanceProperty(prop, context)) || 0;
    },

    // Calculate width or offset at next zoom (used for zoom-based interpolation in shader)
    calcDistanceNextZoom (prop, context) {
        context.zoom++;
        let val = this.calcDistance(prop, context);
        context.zoom--;
        return val;
    },

    // Calculate width at current and next zoom, and scaling factor between
    calcWidth (draw, style, context) {
        // line width in meters
        let width = this.calcDistance(draw.width, context);
        if (width < 0) {
            return; // skip lines with negative width
        }

        let next_width;
        if (draw.next_width) {
            next_width = this.calcDistanceNextZoom(draw.next_width, context);
        }
        else {
            next_width = width / 2; // when width is static, width at next zoom is just half as many tile units
        }

        if ((width === 0 && next_width === 0) || next_width < 0) {
            return false; // skip lines that don't interpolate to a positive value at next zoom
        }

        // these values are saved for later calculating the outline width, which needs to add the base line's width
        style.width_unscaled = width;
        style.next_width_unscaled = next_width;

        // calculate relative change in line width to next zoom
        // NB: multiply by 2 because a given width is twice as big in screen space at the next zoom
        if (draw.next_width) {
            next_width *= 2;
            if (width >= next_width) {
                style.width = width * context.units_per_meter_overzoom;
                style.width_scale = 1 - (next_width / width);
            }
            else {
                style.width = next_width * context.units_per_meter_overzoom;
                style.width_scale = (1 - (width / next_width)) * -1;
            }
        }
        else {
            style.width = width * context.units_per_meter_overzoom;
            style.width_scale = 0;
        }

        // optional adjustment to texcoord width based on scale
        if (this.texcoords) {
            // UVs can't calc for zero-width, use next zoom width in that case
            style.texcoord_width = (width || next_width) * context.units_per_meter_overzoom / context.tile.overzoom2; // shorten calcs
        }

        return true;
    },

    // Calculate offset at current and next zoom, and scaling factor between
    calcOffset (draw, style, context) {
        // Pre-calculated offset passed
        // This happens when a line passes pre-computed offset values to its outline
        if (draw.offset_precalc) {
            style.offset = draw.offset_precalc;
            style.offset_scale = draw.offset_scale_precalc;
        }
        // Offset to calculate
        else if (draw.offset) {
            let offset = this.calcDistance(draw.offset, context);

            if (draw.next_offset) {
                let next_offset = this.calcDistanceNextZoom(draw.next_offset, context) * 2;

                if (Math.abs(offset) >= Math.abs(next_offset)) {
                    style.offset = offset * context.units_per_meter_overzoom;
                    if (offset !== 0) {
                        style.offset_scale = 1 - (next_offset / offset);
                    }
                    else {
                        style.offset_scale = 0;
                    }
                }
                else {
                    style.offset = next_offset * context.units_per_meter_overzoom;
                    if (next_offset !== 0) {
                        style.offset_scale = (1 - (offset / next_offset)) * -1;
                    }
                    else {
                        style.offset_scale = 0;
                    }
                }
            }
            else {
                style.offset = offset * context.units_per_meter_overzoom;
                style.offset_scale = 0;
            }
        }
        // No offset
        else {
            style.offset = 0;
            style.offset_scale = 0;
        }
    },

    _parseFeature (feature, draw, context) {
        var style = this.feature_style;

        // calculate line width at current and next zoom
        if (this.calcWidth(draw, style, context) === false) {
            return; // missing or zero width
        }

        // calculate line offset at current and next zoom
        this.calcOffset(draw, style, context);

        style.color = this.parseColor(draw.color, context);
        if (!style.color) {
            return;
        }

        // height defaults to feature height, but extrude style can dynamically adjust height by returning a number or array (instead of a boolean)
        style.z = (draw.z && StyleParser.evalCachedDistanceProperty(draw.z || 0, context)) || StyleParser.defaults.z;
        style.height = feature.properties.height || StyleParser.defaults.height;
        style.extrude = StyleParser.evalProperty(draw.extrude, context);
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
        style.outline = style.outline || {
            width: {}, next_width: {},
            preprocessed: true
        };

        if (draw.outline && draw.outline.visible !== false && draw.outline.color && draw.outline.width) {
            // outline width in meters
            // NB: multiply by 2 because outline is applied on both sides of line
            let outline_width = this.calcDistance(draw.outline.width, context) * 2;
            let outline_next_width = this.calcDistanceNextZoom(draw.outline.next_width, context) * 2;

            if ((outline_width === 0 && outline_next_width === 0) || outline_width < 0 || outline_next_width < 0) {
                // skip lines that don't interpolate between zero or greater width
                style.outline.width.value = null;
                style.outline.next_width.value = null;
                style.outline.color = null;
            }
            else {
                // Maintain consistent outline width around the line fill
                style.outline.width.value = outline_width + style.width_unscaled;
                style.outline.next_width.value = outline_next_width + style.next_width_unscaled;

                // Offset is directly copied from fill to outline, no need to re-calculate it
                style.outline.offset_precalc = style.offset;
                style.outline.offset_scale_precalc = style.offset_scale;

                // Inherited properties
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
        draw.color = StyleParser.createColorPropertyCache(draw.color);
        draw.width = StyleParser.createPropertyCache(draw.width, StyleParser.parseUnits);
        if (draw.width && draw.width.type !== StyleParser.CACHE_TYPE.STATIC) {
            draw.next_width = StyleParser.createPropertyCache(draw.width, StyleParser.parseUnits);
        }
        draw.offset = draw.offset && StyleParser.createPropertyCache(draw.offset, StyleParser.parseUnits);
        if (draw.offset && draw.offset.type !== StyleParser.CACHE_TYPE.STATIC) {
            draw.next_offset = StyleParser.createPropertyCache(draw.offset, StyleParser.parseUnits);
        }
        draw.z = StyleParser.createPropertyCache(draw.z, StyleParser.parseUnits);

        if (draw.outline) {
            draw.outline.color = StyleParser.createColorPropertyCache(draw.outline.color);
            draw.outline.width = StyleParser.createPropertyCache(draw.outline.width, StyleParser.parseUnits);
            draw.outline.next_width = StyleParser.createPropertyCache(draw.outline.width, StyleParser.parseUnits); // width re-computed for next zoom
        }
        return draw;
    },

    /**
     * A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
     * A plain JS array matching the order of the vertex layout.
     */
    makeVertexTemplate(style) {
        let i = 0;

        // a_position.xyz - vertex position
        // a_position.w - layer order
        this.vertex_template[i++] = 0;
        this.vertex_template[i++] = 0;
        this.vertex_template[i++] = style.z || 0;
        this.vertex_template[i++] = this.scaleOrder(style.order);

        // a_extrude.xy - extrusion vector
        this.vertex_template[i++] = 0;
        this.vertex_template[i++] = 0;

        // a_offset.xy - normal vector
        this.vertex_template[i++] = 0;
        this.vertex_template[i++] = 0;

        // a_scaling.xy - scaling to previous and next zoom
        this.vertex_template[i++] = style.width_scale * 1024;    // line width
        this.vertex_template[i++] = style.offset_scale * 1024;   // line offset

        // a_color.rgba
        this.vertex_template[i++] = style.color[0] * 255;
        this.vertex_template[i++] = style.color[1] * 255;
        this.vertex_template[i++] = style.color[2] * 255;
        this.vertex_template[i++] = style.color[3] * 255;

        // selection color
        if (this.selection) {
            // a_selection_color.rgba
            this.vertex_template[i++] = style.selection_color[0] * 255;
            this.vertex_template[i++] = style.selection_color[1] * 255;
            this.vertex_template[i++] = style.selection_color[2] * 255;
            this.vertex_template[i++] = style.selection_color[3] * 255;
        }

        // Add texture UVs to template only if needed
        if (this.texcoords) {
            // a_texcoord.uv
            this.vertex_template[i++] = 0;
            this.vertex_template[i++] = 0;
        }

        return this.vertex_template;
    },

    buildLines(lines, style, vertex_data, context, options) {
        // Outline (build first so that blended geometry without a depth test is drawn first/under the inner line)
        this.feature_style = this.outline_feature_style; // swap in outline-specific style holder
        if (style.outline && style.outline.color != null && style.outline.width.value != null) {
            var outline_style = this.styles[style.outline.style];
            if (outline_style) {
                outline_style.addFeature(context.feature, style.outline, context);
            }
        }

        // Main line
        this.feature_style = this.inline_feature_style; // restore calculated style for inline
        let vertex_template = this.makeVertexTemplate(style);
        return buildPolylines(
            lines,
            style.width,
            vertex_data,
            vertex_template,
            {
                cap: style.cap,
                join: style.join,
                miter_limit: style.miter_limit,
                extrude_index: this.vertex_layout.index.a_extrude,
                offset_index: this.vertex_layout.index.a_offset,
                texcoord_index: this.vertex_layout.index.a_texcoord,
                texcoord_width: style.texcoord_width,
                texcoord_normalize: 65535, // scale UVs to unsigned shorts
                closed_polygon: options && options.closed_polygon,
                remove_tile_edges: !style.tile_edges && options && options.remove_tile_edges,
                tile_edge_tolerance: Geo.tile_scale * context.tile.pad_scale * 2,
                offset: style.offset
            }
        );
    },

    buildPolygons(polygons, style, vertex_data, context) {
         // Render polygons as individual lines
        let geom_count = 0;
         for (let p=0; p < polygons.length; p++) {
            geom_count += this.buildLines(polygons[p], style, vertex_data, context, { closed_polygon: true, remove_tile_edges: true });
         }
        return geom_count;
    }

});
