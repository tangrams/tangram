// Point rendering style

import {Style} from '../style';
import {StyleParser} from '../style_parser';
import gl from '../../gl/constants'; // web workers don't have access to GL context, so import all GL constants
import VertexLayout from '../../gl/vertex_layout';
import Builders from '../builders';
import Texture from '../../gl/texture';
import Geo from '../../geo';
import Utils from '../../utils/utils';
import Vector from '../../vector';
import Collision from '../../labels/collision';
import LabelPoint from '../../labels/label_point';

import log from 'loglevel';

export var Points = Object.create(Style);

Object.assign(Points, {
    name: 'points',
    built_in: true,
    selection: true, // turn feature selection on
    blend: 'overlay', // overlays drawn on top of all other styles, with blending

    init(options = {}) {
        Style.init.apply(this, arguments);

        // Base shaders
        this.vertex_shader_key = 'styles/points/points_vertex';
        this.fragment_shader_key = 'styles/points/points_fragment';

        var attribs = [
            { name: 'a_position', size: 4, type: gl.SHORT, normalized: true },
            { name: 'a_shape', size: 4, type: gl.SHORT, normalized: true },
            { name: 'a_texcoord', size: 2, type: gl.UNSIGNED_SHORT, normalized: true },
            { name: 'a_offset', size: 2, type: gl.SHORT, normalized: true },
            { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true }
        ];

        // Optional feature selection
        if (this.selection) {
            attribs.push({ name: 'a_selection_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true });
        }

        // If we're not rendering as overlay, we need a layer attribute
        if (this.blend !== 'overlay') {
            this.defines.TANGRAM_LAYER_ORDER = true;
        }

        this.vertex_layout = new VertexLayout(attribs);

        if (this.texture) {
            this.defines.TANGRAM_POINT_TEXTURE = true;
            this.shaders.uniforms = this.shaders.uniforms || {};
            this.shaders.uniforms.u_texture = this.texture;
        }

        this.queues = {};
    },

    reset () {
        this.queues = {};
    },

    // Override to queue features instead of processing immediately
    addFeature (feature, draw, context) {
        let tile = context.tile;

        // Called here because otherwise it will be delayed until the feature queue is parsed,
        // and we want the preprocessing done before we evaluate text style below
        draw = this.preprocess(draw);
        if (!draw) {
            return;
        }

        let style = {};
        style.color = this.parseColor(draw.color, context);

        // require color or texture
        if (!style.color && !this.texture) {
            return null;
        }

        let sprite = style.sprite = StyleParser.evalProp(draw.sprite, context);
        style.sprite_default = draw.sprite_default; // optional fallback if 'sprite' not found

        // if point has texture and sprites, require a valid sprite to draw
        if (this.texture && Texture.textures[this.texture] && Texture.textures[this.texture].sprites) {
            if (!sprite && !style.sprite_default) {
                return;
            }
            else if (!Texture.textures[this.texture].sprites[sprite]) {
                // If sprite not found, check for default sprite
                if (style.sprite_default) {
                    sprite = style.sprite_default;
                    if (!Texture.textures[this.texture].sprites[sprite]) {
                        log.warn(`Style: in style '${this.name}', could not find default sprite '${sprite}' for texture '${this.texture}'`);
                        return;
                    }
                }
                else {
                    log.warn(`Style: in style '${this.name}', could not find sprite '${sprite}' for texture '${this.texture}'`);
                    return;
                }
            }
        }
        else if (sprite) {
            log.warn(`Style: in style '${this.name}', sprite '${sprite}' was specified, but texture '${this.texture}' has no sprites`);
            sprite = null;
        }

        // Sets texcoord scale if needed (e.g. for sprite sub-area)
        let sprite_info;
        if (this.texture && sprite) {
            sprite_info = Texture.getSpriteInfo(this.texture, sprite);
            style.texcoords = sprite_info.texcoords;
        } else {
            style.texcoords = null;
        }

        // points can be placed off the ground
        style.z = (draw.z && StyleParser.cacheDistance(draw.z, context)) || StyleParser.defaults.z;

        // point size defined explicitly, or defaults to sprite size, or generic fallback
        style.size = draw.size;
        if (!style.size) {
            if (sprite_info) {
                style.size = sprite_info.size;
            }
            else {
                style.size = [16, 16];
            }
        }
        else {
            style.size = StyleParser.cacheProperty(style.size, context);
        }

        // size will be scaled to 16-bit signed int, so max allowed width + height of 256 pixels
        style.size = [
            Math.min((style.size[0] || style.size), 256),
            Math.min((style.size[1] || style.size), 256)
        ];

        style.angle = StyleParser.evalProp(draw.angle, context) || 0;

        // polygons rendering as points will render at the polygon's centroid by default,
        // but can be set to render at each individual polygon point instead
        style.centroid = (draw.centroid != null) ? draw.centroid : true;

        this.computeLayout(style, feature, draw, context, tile);

        // Queue the feature for processing
        if (!this.tile_data[tile.key]) {
            this.startData(tile.key);
        }

        if (!this.queues[tile.key]) {
            this.queues[tile.key] = [];
        }

        this.queues[tile.key].push({
            feature, draw, context, style
        });

        // Register with collision manager
        Collision.addStyle(this.name, tile.key);
    },

    // Override
    endData (tile) {
        let queue = this.queues[tile];
        this.queues[tile] = [];

        // For each feature, create one or more point labels
        let boxes = [];
        queue.forEach(q => {
            let style = q.style;
            let feature = q.feature;
            let geometry = feature.geometry;

            let feature_labels = this.buildLabelsFromGeometry(style.size, geometry, style);
            for (let i = 0; i < feature_labels.length; i++) {
                let label = feature_labels[i];
                boxes.push({
                    feature,
                    draw: q.draw,
                    context: q.context,
                    style,
                    layout: style,
                    label
                });
            }
        });

        // Submit point labels for collision, then build geometry for remaining ones
        return Collision.collide(boxes, this.name, tile).then(boxes => {
            boxes.forEach(q => {
                this.feature_style = q.style;
                this.feature_style.label = q.label;

                Style.addFeature.call(this, q.feature, q.draw, q.context);
            });

            return Style.endData.call(this, tile);
        });
    },

    _preprocess (draw) {
        draw.color = StyleParser.colorCacheObject(draw.color);
        draw.z = StyleParser.cacheObject(draw.z, StyleParser.cacheUnits);

        // Size (1d value or 2d array)
        draw.size = StyleParser.cacheObject(draw.size, v => Array.isArray(v) ? v.map(parseFloat) : parseFloat(v));

        // Offset (2d array)
        draw.offset = StyleParser.cacheObject(draw.offset, v => (Array.isArray(v) && v.map(parseFloat)) || 0);

        // Buffer (1d value or 2d array, expand 1d to 2d)
        draw.buffer = StyleParser.cacheObject(draw.buffer, v => (Array.isArray(v) ? v : [v, v]).map(parseFloat) || 0);

        return draw;
    },

    // Compute label layout-related properties
    computeLayout (target, feature, draw, context, tile) {
        let layout = target || {};
        layout.id = feature;
        layout.units_per_pixel = tile.units_per_pixel || 1;

        // collision flag
        layout.collide = (draw.collide === false) ? false : true;

        // label anchors (point labels only)
        // label position will be adjusted in the given direction, relative to its original point
        // one of: left, right, top, bottom, top-left, top-right, bottom-left, bottom-right
        layout.anchor = draw.anchor;

        // label offset and buffer in pixel (applied in screen space)
        layout.offset = StyleParser.cacheProperty(draw.offset, context) || StyleParser.zeroPair;
        layout.buffer = StyleParser.cacheProperty(draw.buffer, context) || StyleParser.zeroPair;

        // label priority (lower is higher)
        let priority = draw.priority;
        if (priority != null) {
            if (typeof priority === 'function') {
                priority = priority(context);
            }
        }
        else {
            priority = -1 >>> 0; // default to max priority value if none set
        }
        layout.priority = priority;

        return layout;
    },

    // Builds one or more point labels for a geometry
    buildLabelsFromGeometry (size, geometry, options) {
        let labels = [];

        if (geometry.type === "Point") {
            labels.push(new LabelPoint(geometry.coordinates, size, options));
        }
        else if (geometry.type === "MultiPoint") {
            let points = geometry.coordinates;
            for (let i = 0; i < points.length; ++i) {
                let point = points[i];
                labels.push(new LabelPoint(point, size, options));
            }
        }
        else if (geometry.type === "LineString") {
            // Point at each line vertex
            let points = geometry.coordinates;
            for (let i = 0; i < points.length; ++i) {
                labels.push(new LabelPoint(points[i], size, options));
            }
        }
        else if (geometry.type === "MultiLineString") {
            // Point at each line vertex
            let lines = geometry.coordinates;
            for (let ln = 0; ln < lines.length; ln++) {
                let points = lines[ln];
                for (let i = 0; i < points.length; ++i) {
                    labels.push(new LabelPoint(points[i], size, options));
                }
            }
        }
        else if (geometry.type === "Polygon") {
            // Point at polygon centroid (of outer ring)
            if (options.centroid) {
                let centroid = Geo.centroid(geometry.coordinates[0]);
                labels.push(new LabelPoint(centroid, size, options));
            }
            // Point at each polygon vertex (all rings)
            else {
                let rings = geometry.coordinates;
                for (let ln = 0; ln < rings.length; ln++) {
                    let points = rings[ln];
                    for (let i = 0; i < points.length; ++i) {
                        labels.push(new LabelPoint(points[i], size, options));
                    }
                }
            }
        }
        else if (geometry.type === "MultiPolygon") {
            let centroid = Geo.multiCentroid(geometry.coordinates);
            labels.push(new LabelPoint(centroid, size, options));
        }

        return labels;
    },

    /**
     * A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
     * A plain JS array matching the order of the vertex layout.
     */
    makeVertexTemplate(style) {
        let color = style.color || StyleParser.defaults.color;

        // position - x & y coords will be filled in per-vertex below
        this.fillVertexTemplate('a_position', 0, { size: 2 });
        this.fillVertexTemplate('a_position', style.z || 0, { size: 1, offset: 2 });
        // layer order - w coord of 'position' attribute (for packing efficiency)
        this.fillVertexTemplate('a_position', style.order || 0, { size: 1, offset: 3 });

        // scaling vector - (x, y) components per pixel, z = angle, w = scaling factor
        this.fillVertexTemplate('a_shape', 0, { size: 4 });

        // texture coords
        this.fillVertexTemplate('a_texcoord', 0, { size: 2 });

        // offsets
        this.fillVertexTemplate('a_offset', 0, { size: 2 });

        // color
        this.fillVertexTemplate('a_color', Vector.mult(color, 255), { size: 4 });

        // selection color
        if (this.selection) {
            this.fillVertexTemplate('a_selection_color', Vector.mult(style.selection_color, 255), { size: 4 });
        }

        return this.vertex_template;
    },

    buildQuad (points, size, angle, offset, texcoord_scale, vertex_data, vertex_template) {
        Builders.buildQuadsForPoints(
            points,
            vertex_data,
            vertex_template,
            {
                texcoord_index: this.vertex_layout.index.a_texcoord,
                position_index: this.vertex_layout.index.a_position,
                shape_index: this.vertex_layout.index.a_shape,
                offset_index: this.vertex_layout.index.a_offset
            },
            {
                quad: [ Utils.scaleInt16(size[0], 256), Utils.scaleInt16(size[1], 256) ],
                quad_scale: Utils.scaleInt16(1, 256),
                offset,
                angle: Utils.scaleInt16(angle, 360),
                texcoord_scale: texcoord_scale,
                texcoord_normalize: 65535
            }
        );
    },

    // Build quad for point sprite
    build (style, vertex_data) {
        let vertex_template = this.makeVertexTemplate(style);
        let label = style.label;

        this.buildQuad(
            [label.position],               // position
            style.size,                     // size in pixels
            style.angle,                    // angle in degrees
            label.options.offset,           // offset from center in pixels
            style.texcoords,                // texture UVs
            vertex_data, vertex_template    // VBO and data for current vertex
        );
    },

    // Override to pass-through to generic point builder
    buildLines (lines, style, vertex_data) {
        this.build(style, vertex_data);
    },

    buildPoints (points, style, vertex_data) {
        this.build(style, vertex_data);
    },

    buildPolygons (points, style, vertex_data) {
        this.build(style, vertex_data);
    }

});
