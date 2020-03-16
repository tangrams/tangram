// Line rendering style

import log from '../../utils/log';
import {Style} from '../style';
import StyleParser from '../style_parser';
import gl from '../../gl/constants'; // web workers don't have access to GL context, so import all GL constants
import Texture from '../../gl/texture';
import VertexLayout from '../../gl/vertex_layout';
import {buildPolylines} from '../../builders/polylines';
import renderDashArray from './dasharray';
import Geo from '../../utils/geo';

import WorkerBroker from '../../utils/worker_broker';
import hashString from '../../utils/hash';

import polygons_vs from '../polygons/polygons_vertex.glsl';
import polygons_fs from '../polygons/polygons_fragment.glsl';

export const Lines = Object.create(Style);

const DASH_SCALE = 20; // adjustment factor for UV scale to for line dash patterns w/fractional pixel width

Object.assign(Lines, {
    name: 'lines',
    built_in: true,
    vertex_shader_src: polygons_vs,
    fragment_shader_src: polygons_fs,
    selection: true, // enable feature selection

    init() {
        Style.init.apply(this, arguments);

        // Tell the shader we want a order in vertex attributes, and to extrude lines
        this.defines.TANGRAM_EXTRUDE_LINES = true;
        this.defines.TANGRAM_TEXTURE_COORDS = true; // texcoords attribute is set to static when not needed

        // Additional single-allocated object used for holding outline style as it is processed
        // Separate from this.feature_style so that outline properties do not overwrite calculated
        // inline properties (outline call is made *within* the inline call)
        this.outline_feature_style = {};
        this.inline_feature_style = this.feature_style; // save reference to main computed style object

        this.dash_textures = {}; // cache previously rendered line dash pattern textures
    },

    // Calculate width or offset at zoom given in `context`
    calcDistance (prop, context) {
        return StyleParser.evalCachedDistanceProperty(prop, context) || 0;
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

        // calculate relative change in line width between zooms
        // interpolate from the line width at the zoom mid-point, towards/away from the previous/next integer zoom
        if (draw.next_width) {
            next_width *= 2; // NB: a given width is twice as big in screen space at the next zoom
            let mid_width = (width + next_width) * 0.5;
            style.width = mid_width * context.units_per_meter_overzoom; // width at zoom mid-point
            style.width_scale = 1 - (next_width / mid_width);
        }
        else {
            style.width = width * context.units_per_meter_overzoom;
            style.width_scale = 0;
        }

        // optional adjustment to texcoord width based on scale
        if (draw.texcoords) {
            // when drawing an outline, use the inline's texture scale
            // (e.g. keeps dashed outline pattern locked to inline pattern)
            if (draw.inline_texcoord_width) {
                style.texcoord_width = draw.inline_texcoord_width;
            }
            // when drawing an inline, calculate UVs based on line width
            else {
                // UVs can't calc for zero-width, use next zoom width in that case
                style.texcoord_width = (style.width_unscaled || style.next_width_unscaled) * context.units_per_meter_overzoom / context.tile.overzoom2; // shorten calcs
            }
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

        style.alpha = StyleParser.evalCachedProperty(draw.alpha, context); // optional alpha override

        style.variant = draw.variant; // pre-calculated mesh variant

        // height defaults to feature height, but extrude style can dynamically adjust height by returning a number or array (instead of a boolean)
        style.z = StyleParser.evalCachedDistanceProperty(draw.z, context) || StyleParser.defaults.z;
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
                style.outline.inline_texcoord_width = null;
                style.outline.texcoords = false;
            }
            else {
                // Maintain consistent outline width around the line fill
                style.outline.width.value = outline_width + style.width_unscaled;
                style.outline.next_width.value = outline_next_width + style.next_width_unscaled;
                style.outline.inline_texcoord_width = style.texcoord_width;

                // Offset is directly copied from fill to outline, no need to re-calculate it
                style.outline.offset_precalc = style.offset;
                style.outline.offset_scale_precalc = style.offset_scale;

                style.outline.color = draw.outline.color;
                style.outline.alpha = draw.outline.alpha;
                style.outline.interactive = draw.outline.interactive;
                style.outline.cap = draw.outline.cap;
                style.outline.join = draw.outline.join;
                style.outline.miter_limit = draw.outline.miter_limit;
                style.outline.texcoords = draw.outline.texcoords;
                style.outline.extrude = draw.outline.extrude;
                style.outline.z = draw.outline.z;
                style.outline.style = draw.outline.style;
                style.outline.variant = draw.outline.variant;

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
            style.outline.inline_texcoord_width = null;
        }

        return style;
    },

    _preprocess (draw) {
        draw.color = StyleParser.createColorPropertyCache(draw.color);
        draw.alpha = StyleParser.createPropertyCache(draw.alpha);
        draw.width = StyleParser.createPropertyCache(draw.width, StyleParser.parseUnits);
        if (draw.width && draw.width.type !== StyleParser.CACHE_TYPE.STATIC) {
            draw.next_width = StyleParser.createPropertyCache(draw.width, StyleParser.parseUnits);
        }
        draw.offset = draw.offset && StyleParser.createPropertyCache(draw.offset, StyleParser.parseUnits);
        if (draw.offset && draw.offset.type !== StyleParser.CACHE_TYPE.STATIC) {
            draw.next_offset = StyleParser.createPropertyCache(draw.offset, StyleParser.parseUnits);
        }
        draw.z = StyleParser.createPropertyCache(draw.z, StyleParser.parseUnits);

        draw.dash = (draw.dash !== undefined ? draw.dash : this.dash);
        draw.dash_key = draw.dash && this.dashTextureKey(draw.dash);
        draw.dash_background_color = (draw.dash_background_color !== undefined ? draw.dash_background_color : this.dash_background_color);
        draw.dash_background_color = draw.dash_background_color && StyleParser.parseColor(draw.dash_background_color);
        draw.texture_merged = draw.dash_key || ((draw.texture !== undefined ? draw.texture : this.texture));
        draw.texcoords = ((this.texcoords || draw.texture_merged) ? 1 : 0);
        this.computeVariant(draw);

        if (draw.outline) {
            draw.outline.is_outline = true; // mark as outline (so mesh variant can be adjusted for render order, etc.)
            draw.outline.style = draw.outline.style || this.name;
            draw.outline.color = StyleParser.createColorPropertyCache(draw.outline.color);
            draw.outline.alpha = StyleParser.createPropertyCache(draw.outline.alpha);
            draw.outline.width = StyleParser.createPropertyCache(draw.outline.width, StyleParser.parseUnits);
            draw.outline.next_width = StyleParser.createPropertyCache(draw.outline.width, StyleParser.parseUnits); // width re-computed for next zoom

            draw.outline.interactive = (draw.outline.interactive != null) ? draw.outline.interactive : draw.interactive;
            draw.outline.cap = draw.outline.cap || draw.cap;
            draw.outline.join = draw.outline.join || draw.join;
            draw.outline.miter_limit = (draw.outline.miter_limit != null) ? draw.outline.miter_limit : draw.miter_limit;

            // always apply inline values for offset and extrusion/height to outline
            draw.outline.offset = draw.offset;
            draw.outline.extrude = draw.extrude;
            draw.outline.z = draw.z;

            // outline inherits dash pattern, but NOT explicit texture
            let outline_style = this.styles[draw.outline.style];
            if (outline_style) {
                draw.outline.dash = (draw.outline.dash !== undefined ? draw.outline.dash : outline_style.dash);
                draw.outline.texture = (draw.outline.texture !== undefined ? draw.outline.texture : outline_style.texture);

                if (draw.outline.dash != null) {            // dash was defined by outline draw or style
                    draw.outline.dash_key = draw.outline.dash && this.dashTextureKey(draw.outline.dash);
                    draw.outline.texture_merged = draw.outline.dash_key;
                }
                else if (draw.outline.dash === null) {      // dash explicitly disabled by outline draw or style
                    draw.outline.dash_key = null;
                    draw.outline.texture_merged = draw.outline.texture;
                }
                else if (draw.outline.texture != null) {    // texture was defined by outline draw or style
                    draw.outline.dash_key = null; // outline explicitly turning off dash
                    draw.outline.texture_merged = draw.outline.texture;
                }
                else {                                      // no dash or texture defined for outline, inherit parent dash
                    draw.outline.dash = draw.dash;
                    draw.outline.dash_key = draw.outline.dash && this.dashTextureKey(draw.outline.dash);
                    draw.outline.texture_merged = draw.outline.dash_key;
                }
                draw.outline.dash_background_color = (draw.outline.dash_background_color !== undefined ? draw.outline.dash_background_color : outline_style.dash_background_color);
                draw.outline.dash_background_color = (draw.outline.dash_background_color !== undefined ? draw.outline.dash_background_color : draw.dash_background_color);
                draw.outline.dash_background_color = draw.outline.dash_background_color && StyleParser.parseColor(draw.outline.dash_background_color);
                draw.outline.texcoords = ((outline_style.texcoords || draw.outline.texture_merged) ? 1 : 0);

                // outline inherits draw blend order from parent inline, unless explicitly turned off with null
                if (draw.outline.blend_order === undefined && draw.blend_order != null) {
                    draw.outline.blend_order = draw.blend_order;
                }

                outline_style.computeVariant(draw.outline);
            }
            else {
                log({ level: 'warn', once: true }, `Layer group '${draw.layers.join(', ')}': ` +
                    `line 'outline' specifies non-existent draw style '${draw.outline.style}' (or maybe the style is ` +
                    'defined but is missing a \'base\' or has another error), skipping outlines for features matching this layer group');
                draw.outline = null;
            }
        }
        return draw;
    },

    // Unique string key for a dash pattern (used as texture name)
    dashTextureKey (dash) {
        return '__dash_' + JSON.stringify(dash);
    },

    // Return or render a dash pattern texture
    getDashTexture (dash) {
        let dash_key = this.dashTextureKey(dash);

        if (this.dash_textures[dash_key] == null) {
            this.dash_textures[dash_key] = true;
            // Render line pattern
            const dash_texture = renderDashArray(dash, { scale: DASH_SCALE });
            Texture.create(this.gl, dash_key, {
                data: dash_texture.pixels,
                height: dash_texture.length,
                width: 1,
                filtering: 'nearest'
            });
        }
    },

    // Override
    async endData (tile) {
        const tile_data = await Style.endData.call(this, tile);
        if (tile_data) {
            tile_data.uniforms.u_has_line_texture = false;
            tile_data.uniforms.u_texture = Texture.default;
            tile_data.uniforms.u_v_scale_adjust = Geo.tile_scale;

            let pending = [];
            for (let m in tile_data.meshes) {
                let variant = tile_data.meshes[m].variant;
                if (variant.texture) {
                    let uniforms = tile_data.meshes[m].uniforms = tile_data.meshes[m].uniforms || {};
                    uniforms.u_has_line_texture = true;
                    uniforms.u_texture = variant.texture;
                    uniforms.u_texture_ratio = 1;

                    if (variant.dash) {
                        uniforms.u_v_scale_adjust = Geo.tile_scale * DASH_SCALE;
                        uniforms.u_has_dash = (variant.dash_background_color != null ? 1 : 0);
                        uniforms.u_dash_background_color = variant.dash_background_color || [0, 0, 0, 0];
                    }

                    if (variant.dash_key && this.dash_textures[variant.dash_key] == null) {
                        this.dash_textures[variant.dash_key] = true;
                        try {
                            await WorkerBroker.postMessage(this.main_thread_target+'.getDashTexture', variant.dash);
                        }
                        catch (e) {
                            log('trace', `${this.name}: line dash texture create failed because style no longer on main thread`);
                        }
                    }

                    if (Texture.textures[variant.texture] == null) {
                        pending.push(
                            Texture.syncTexturesToWorker([variant.texture]).then(textures => {
                                let texture = textures[variant.texture];
                                if (texture) {
                                    uniforms.u_texture_ratio = texture.height / texture.width;
                                }
                            })
                        );
                    }
                    else {
                        let texture = Texture.textures[variant.texture];
                        uniforms.u_texture_ratio = texture.height / texture.width;
                    }
                }
            }
            await Promise.all(pending);
        }
        return tile_data;
    },

    // Calculate and store mesh variant (unique by draw group but not feature)
    computeVariant (draw) {
        // Factors that determine a unique mesh rendering variant
        let key = (draw.offset ? 1 : 0); // whether feature has a line offset
        key += '/' + draw.texcoords; // whether feature has texture UVs
        key += '/' + (draw.interactive ? 1 : 0); // whether feature has interactivity
        key += '/' + ((draw.extrude || draw.z) ? 1 : 0); // whether feature has a z coordinate
        key += '/' + draw.is_outline; // whether this is an outline of a line feature

        if (draw.dash_key) { // whether feature has a line dash pattern
            key += draw.dash_key;
            if (draw.dash_background_color) {
                key += draw.dash_background_color;
            }
        }

        if (draw.texture_merged) { // whether feature has a line texture
            key += draw.texture_merged;
        }

        const blend_order = this.getBlendOrderForDraw(draw);
        key += '/' + blend_order;

        // Create unique key
        key = hashString(key);
        draw.variant = key;

        if (this.variants[key] == null) {
            this.variants[key] = {
                key,
                blend_order,
                mesh_order: (draw.is_outline ? 0 : 1), // outlines should be drawn first, so inline is on top
                selection: (draw.interactive ? 1 : 0),
                offset: (draw.offset ? 1 : 0),
                z_or_offset: ((draw.offset || draw.extrude || draw.z) ? 1 : 0),
                texcoords: draw.texcoords,
                texture: draw.texture_merged,
                dash: draw.dash,
                dash_key: draw.dash_key,
                dash_background_color: draw.dash_background_color
            };
        }
    },

    // Override
    // Create or return desired vertex layout permutation based on flags
    vertexLayoutForMeshVariant (variant) {
        if (this.vertex_layouts[variant.key] == null) {
            // Attributes for this mesh variant
            // Optional attributes have placeholder values assigned with `static` parameter
            const attribs = [
                { name: 'a_position', size: 4, type: gl.SHORT, normalized: false },
                { name: 'a_extrude', size: 2, type: gl.SHORT, normalized: false },
                { name: 'a_offset', size: 2, type: gl.SHORT, normalized: false, static: (variant.offset ? null : [0, 0]) },
                { name: 'a_z_and_offset_scale', size: 2, type: gl.SHORT, normalized: false, static: (variant.z_or_offset ? null : [0, 0]) },
                { name: 'a_texcoord', size: 2, type: gl.UNSIGNED_SHORT, normalized: true, static: (variant.texcoords ? null : [0, 0]) },
                { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
                { name: 'a_selection_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true, static: (variant.selection ? null : [0, 0, 0, 0]) }
            ];

            this.addCustomAttributesToAttributeList(attribs);
            this.vertex_layouts[variant.key] = new VertexLayout(attribs);
        }
        return this.vertex_layouts[variant.key];
    },

    // Override
    meshVariantTypeForDraw (draw) {
        return this.variants[draw.variant]; // return pre-calculated mesh variant
    },

    /**
     * A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
     * A plain JS array matching the order of the vertex layout.
     */
    makeVertexTemplate(style, mesh) {
        let i = 0;

        // a_position.xy - vertex position
        // a_position.z - line width scaling factor
        // a_position.w - layer order
        this.vertex_template[i++] = 0;
        this.vertex_template[i++] = 0;
        this.vertex_template[i++] = style.width_scale * 1024;
        this.vertex_template[i++] = this.scaleOrder(style.order);

        // a_extrude.xy - extrusion vector (vertex extrusion away from center of line)
        this.vertex_template[i++] = 0;
        this.vertex_template[i++] = 0;

        // a_offset.xy - normal vector
        // offset can be static or dynamic depending on style
        if (mesh.variant.offset) {
            this.vertex_template[i++] = 0;
            this.vertex_template[i++] = 0;
        }

        // a_z_and_offset_scale.xy
        if (mesh.variant.z_or_offset) {
            this.vertex_template[i++] = style.z || 0; // feature z position
            this.vertex_template[i++] = style.offset_scale * 1024; // line offset scaling factor
        }

        // a_texcoord.uv - texture coordinates
        if (mesh.variant.texcoords) {
            this.vertex_template[i++] = 0;
            this.vertex_template[i++] = 0;
        }

        // a_color.rgba - feature color
        this.vertex_template[i++] = style.color[0] * 255;
        this.vertex_template[i++] = style.color[1] * 255;
        this.vertex_template[i++] = style.color[2] * 255;
        this.vertex_template[i++] = (style.alpha != null ? style.alpha : style.color[3]) * 255;

        // a_selection_color.rgba - selection color
        if (mesh.variant.selection) {
            this.vertex_template[i++] = style.selection_color[0] * 255;
            this.vertex_template[i++] = style.selection_color[1] * 255;
            this.vertex_template[i++] = style.selection_color[2] * 255;
            this.vertex_template[i++] = style.selection_color[3] * 255;
        }

        this.addCustomAttributesToVertexTemplate(style, i);
        return this.vertex_template;
    },

    buildLines(lines, style, context, options) {
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
        let mesh = this.getTileMesh(context.tile, this.meshVariantTypeForDraw(style));
        let vertex_data = mesh.vertex_data;
        let vertex_layout = vertex_data.vertex_layout;
        let vertex_template = this.makeVertexTemplate(style, mesh);
        return buildPolylines(
            lines,
            style,
            vertex_data,
            vertex_template,
            vertex_layout.index,
            (options && options.closed_polygon), // closed_polygon
            (!style.tile_edges && options && options.remove_tile_edges), // remove_tile_edges
            (Geo.tile_scale * context.tile.pad_scale * 2) // tile_edge_tolerance
        );
    },

    buildPolygons(polygons, style, context) {
        // Render polygons as individual lines
        let geom_count = 0;
        for (let p=0; p < polygons.length; p++) {
            geom_count += this.buildLines(polygons[p], style, context, { closed_polygon: true, remove_tile_edges: true });
        }
        return geom_count;
    }

});
