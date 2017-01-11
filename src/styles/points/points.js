// Point + text label rendering style

import log from '../../utils/log';
import {Style} from '../style';
import {StyleParser} from '../style_parser';
import gl from '../../gl/constants'; // web workers don't have access to GL context, so import all GL constants
import VertexLayout from '../../gl/vertex_layout';
import {buildQuadsForPoints} from '../../builders/points';
import Texture from '../../gl/texture';
import Geo from '../../geo';
import Vector from '../../vector';
import Collision from '../../labels/collision';
import LabelPoint from '../../labels/label_point';
import placePointsOnLine from '../../labels/point_placement';
import {TextLabels} from '../text/text_labels';
import {VIEW_PAN_SNAP_TIME} from '../../view';
import debugSettings from '../../utils/debug_settings';

let fs = require('fs');
const shaderSrc_pointsVertex = fs.readFileSync(__dirname + '/points_vertex.glsl', 'utf8');
const shaderSrc_pointsFragment = fs.readFileSync(__dirname + '/points_fragment.glsl', 'utf8');

const PLACEMENT = LabelPoint.PLACEMENT;

export var Points = Object.create(Style);

// Mixin text label methods
Object.assign(Points, TextLabels);

Object.assign(Points, {
    name: 'points',
    built_in: true,
    collision: true,  // style includes a collision pass
    blend: 'overlay', // overlays drawn on top of all other styles, with blending

    init(options = {}) {
        Style.init.apply(this, arguments);

        // Base shaders
        this.vertex_shader_src = shaderSrc_pointsVertex;
        this.fragment_shader_src = shaderSrc_pointsFragment;

        var attribs = [
            { name: 'a_position', size: 4, type: gl.SHORT, normalized: false },
            { name: 'a_shape', size: 4, type: gl.SHORT, normalized: false },
            { name: 'a_texcoord', size: 2, type: gl.UNSIGNED_SHORT, normalized: true },
            { name: 'a_offset', size: 2, type: gl.SHORT, normalized: false },
            { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true }
        ];

        // Feature selection
        this.selection = true;
        attribs.push({ name: 'a_selection_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true });

        this.vertex_layout = new VertexLayout(attribs);

        // If we're not rendering as overlay, we need a layer attribute
        if (this.blend !== 'overlay') {
            this.defines.TANGRAM_LAYER_ORDER = true;
        }

        // ensure a label texture is always bound (avoid Chrome 'no texture bound to unit' warnings)
        this.shaders.uniforms = this.shaders.uniforms || {};
        this.shaders.uniforms.u_label_texture = Texture.default;

        if (this.texture) {
            this.defines.TANGRAM_POINT_TEXTURE = true;
            this.shaders.uniforms.u_texture = this.texture;
        }

        // Enable dual point/text mode
        this.defines.TANGRAM_MULTI_SAMPLER = true;

        // Fade out when tile is zooming out, e.g. acting as proxy tiles
        this.defines.TANGRAM_FADE_ON_ZOOM_OUT = true;
        this.defines.TANGRAM_FADE_ON_ZOOM_OUT_RATE = 2; // fade at 2x, e.g. fully transparent at 0.5 zoom level away

        // Fade in (depending on tile proxy status)
        if (debugSettings.suppress_label_fade_in === true) {
            this.fade_in_time = 0;
            this.defines.TANGRAM_FADE_IN_RATE = null;
        }
        else {
            this.fade_in_time = 0.15; // time in seconds
            this.defines.TANGRAM_FADE_IN_RATE = 1 / this.fade_in_time;
        }

        // Snap points to pixel grid after panning stop
        if (debugSettings.suppress_label_snap_animation !== true) {
            this.defines.TANGRAM_VIEW_PAN_SNAP_RATE = 1 / VIEW_PAN_SNAP_TIME; // inverse time in seconds
        }

        this.collision_group_points = this.name+'-points';
        this.collision_group_text = this.name+'-text';

        this.reset();
    },

    reset () {
        this.queues = {};
        this.resetText();
        this.texture_missing_sprites = {}; // track which missing sprites we've found (reduce dupe log messages)
    },

    // Override to queue features instead of processing immediately
    addFeature (feature, draw, context) {
        let tile = context.tile;
        if (tile.generation !== this.generation) {
            return;
        }

        // Called here because otherwise it will be delayed until the feature queue is parsed,
        // and we want the preprocessing done before we evaluate text style below
        draw = this.preprocess(draw);
        if (!draw) {
            return;
        }

        let style = {};
        style.color = this.parseColor(draw.color, context);

        // Point styling

        // require color or texture
        if (!style.color && !this.texture) {
            return;
        }

        // optional sprite
        let sprite_info;
        if (this.hasSprites()) {
            sprite_info = this.parseSprite(draw, context);
            if (sprite_info) {
                style.texcoords = sprite_info.texcoords;
            }
            else {
                return;
            }
        }

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
            style.size = StyleParser.evalCachedProperty(style.size, context);
        }

        // size will be scaled to 16-bit signed int, so max allowed width + height of 256 pixels
        style.size = [
            Math.min(style.size[0] != null ? style.size[0] : style.size, 256),
            Math.min(style.size[1] != null ? style.size[1] : style.size, 256)
        ];

        // Placement strategy
        style.placement = draw.placement;
        style.placement_min_length_ratio = StyleParser.evalCachedProperty(draw.placement_min_length_ratio, context);

        // Spacing parameter (in pixels) to equally space points along a line
        if (style.placement === PLACEMENT.SPACED && draw.placement_spacing) {
            style.placement_spacing = StyleParser.evalCachedProperty(draw.placement_spacing, context);
        }

        // Angle parameter (can be a number or the string "auto")
        style.angle = StyleParser.evalProperty(draw.angle, context);

        // points can be placed off the ground
        style.z = (draw.z && StyleParser.evalCachedDistanceProperty(draw.z, context)) || StyleParser.defaults.z;

        style.tile_edges = draw.tile_edges; // usually activated for debugging, or rare visualization needs

        style.sampler = 0; // 0 = sprites

        this.computeLayout(style, feature, draw, context, tile);

        // Text styling
        let tf =
            draw.text &&
            draw.text.visible !== false && // explicitly handle `visible` property for nested text
            this.parseTextFeature(feature, draw.text, context, tile);

        if (tf) {
            tf.layout.parent = style; // parent point will apply additional anchor/offset to text

            // Text labels have a default priority of 0.5 below their parent point (+0.5, priority is lower-is-better)
            // This can be overriden, as long as it is less than or equal to the default
            tf.layout.priority = draw.text.priority ? Math.max(tf.layout.priority, style.priority + 0.5) : (style.priority + 0.5);

            // Text labels attached to points should not be moved into tile
            // (they should stay fixed relative to the point)
            tf.layout.move_into_tile = false;

            Collision.addStyle(this.collision_group_text, tile.key);
        }

        // Queue the feature for processing
        if (!this.tile_data[tile.key]) {
            this.startData(tile);
        }

        this.queues[tile.key].push({
            feature, draw, context, style,
            text_feature: tf
        });

        // Register with collision manager
        Collision.addStyle(this.collision_group_points, tile.key);
    },

    hasSprites() {
        return this.texture && Texture.textures[this.texture] && Texture.textures[this.texture].sprites;
    },

    getSpriteInfo (sprite) {
        let info = Texture.textures[this.texture].sprites[sprite] && Texture.getSpriteInfo(this.texture, sprite);
        if (sprite && !info) {
            if (!this.texture_missing_sprites[sprite]) { // only log each missing sprite once
                log('debug', `Style: in style '${this.name}', could not find sprite '${sprite}' for texture '${this.texture}'`);
                this.texture_missing_sprites[sprite] = true;
            }
        }
        return info;
    },

    parseSprite (draw, context) {
        let sprite = StyleParser.evalProperty(draw.sprite, context);
        let sprite_info = this.getSpriteInfo(sprite) || this.getSpriteInfo(draw.sprite_default);
        return sprite_info;
    },

    // Override
    startData (tile) {
        this.queues[tile.key] = [];
        return Style.startData.call(this, tile);
    },

    // Override
    endData (tile) {
        if (tile.canceled) {
            log('trace', `Style ${this.name}: stop tile build because tile was canceled: ${tile.key}`);
            return;
        }

        let queue = this.queues[tile.key];
        delete this.queues[tile.key];

        // For each point feature, create one or more labels
        let text_objs = [];
        let point_objs = [];

        queue.forEach(q => {
            let style = q.style;
            let feature = q.feature;
            let geometry = feature.geometry;

            let feature_labels = this.buildLabels(style.size, geometry, style);
            for (let i = 0; i < feature_labels.length; i++) {
                let label = feature_labels[i];
                let point_obj = {
                    feature,
                    draw: q.draw,
                    context: q.context,
                    style,
                    label
                };
                point_objs.push(point_obj);

                if (q.text_feature) {
                    let text_obj = {
                        feature,
                        draw: q.text_feature.draw,
                        context: q.context,
                        text: q.text_feature.text,
                        text_settings_key: q.text_feature.text_settings_key,
                        layout: q.text_feature.layout,
                        point_label: label,
                        linked: point_obj   // link so text only renders when parent point is placed
                    };
                    text_objs.push(text_obj);

                    // Unless text feature is optional, create a two-way link so that parent
                    // point will only render when text is also placed
                    if (!q.draw.text.optional) {
                        point_obj.linked = text_obj; // two-way link
                    }
                }
            }
        });

        // Collide both points and text, then build features
        return Promise.
            all([
                // Points
                Collision.collide(point_objs, this.collision_group_points, tile.key).then(point_objs => {
                    point_objs.forEach(q => {
                        this.feature_style = q.style;
                        this.feature_style.label = q.label;
                        Style.addFeature.call(this, q.feature, q.draw, q.context);
                    });
                }),
                // Labels
                this.prepareTextLabels(tile, this.collision_group_text, text_objs).
                    then(labels => this.collideAndRenderTextLabels(tile, this.collision_group_text, labels))
            ]).then(([, { labels, texts, texture }]) => {
                // Process labels
                if (labels && texts) {
                    // Build queued features
                    labels.forEach(q => {
                        let text_settings_key = q.text_settings_key;
                        let text_info = texts[text_settings_key] && texts[text_settings_key][q.text];

                        // setup styling object expected by Style class
                        let style = this.feature_style;
                        style.label = q.label;
                        style.size = text_info.size.logical_size;
                        style.texcoords = text_info.align[q.label.align].texcoords;
                        style.angle = q.label.angle || 0;
                        style.sampler = 1; // non-0 = labels

                        Style.addFeature.call(this, q.feature, q.draw, q.context);
                    });
                }
                this.freeText(tile);

                // Finish tile mesh
                return Style.endData.call(this, tile).then(tile_data => {
                    // Attach tile-specific label atlas to mesh as a texture uniform
                    if (texture && tile_data) {
                        tile_data.uniforms = tile_data.uniforms || {};
                        tile_data.textures = tile_data.textures || [];

                        tile_data.uniforms.u_label_texture = texture;
                        tile_data.textures.push(texture); // assign texture ownership to tile
                    }
                    return tile_data;
                });
            });
    },

    _preprocess (draw) {
        draw.color = StyleParser.createColorPropertyCache(draw.color);
        draw.z = StyleParser.createPropertyCache(draw.z, StyleParser.parseUnits);

        // Size (1d value or 2d array)
        draw.size = StyleParser.createPropertyCache(draw.size, v => Array.isArray(v) ? v.map(parseFloat) : parseFloat(v));

        // Offset (2d array)
        draw.offset = StyleParser.createPropertyCache(draw.offset, v => (Array.isArray(v) && v.map(parseFloat)) || 0);

        // Buffer (1d value or 2d array, expand 1d to 2d)
        draw.buffer = StyleParser.createPropertyCache(draw.buffer, v => (Array.isArray(v) ? v : [v, v]).map(parseFloat) || 0);

        // Repeat rules - no repeat limitation for points by default
        draw.repeat_distance = StyleParser.createPropertyCache(draw.repeat_distance, parseFloat);

        // Placement strategies
        draw.placement = PLACEMENT[draw.placement && draw.placement.toUpperCase()];
        if (draw.placement == null) {
            draw.placement = PLACEMENT.VERTEX;
        }

        draw.placement_spacing = draw.placement_spacing != null ? draw.placement_spacing : 80; // default spacing
        draw.placement_spacing = StyleParser.createPropertyCache(draw.placement_spacing, parseFloat);

        draw.placement_min_length_ratio = draw.placement_min_length_ratio != null ? draw.placement_min_length_ratio : 1;
        draw.placement_min_length_ratio = StyleParser.createPropertyCache(draw.placement_min_length_ratio, parseFloat);

        if (typeof draw.angle === 'number') {
            draw.angle = draw.angle * Math.PI / 180;
        }
        else {
            draw.angle = draw.angle || 0; // angle can be a string like "auto" (use angle of geometry)
        }

        // Optional text styling
        draw.text = this.preprocessText(draw.text); // will return null if valid text styling wasn't provided
        if (draw.text) {
            draw.text.key = draw.key; // copy layer key for use as label repeat group
            draw.text.repeat_group = draw.text.repeat_group || draw.repeat_group; // inherit repeat group by default
            draw.text.anchor = draw.text.anchor || this.default_anchor;
            draw.text.optional = (typeof draw.text.optional === 'boolean') ? draw.text.optional : false; // default text to required
            draw.text.interactive = draw.text.interactive || draw.interactive; // inherits from point
        }

        return draw;
    },

    // Default to trying all anchor placements
    default_anchor: ['bottom', 'top', 'right', 'left'],

    // Compute label layout-related properties
    computeLayout (target, feature, draw, context, tile) {
        let layout = target || {};
        layout.id = feature;
        layout.units_per_pixel = tile.units_per_pixel || 1;

        // collision flag
        layout.collide = (draw.collide === false) ? false : true;

        // tile boundary handling
        layout.cull_from_tile = (draw.cull_from_tile != null) ? draw.cull_from_tile : false;

        // points should not move into tile if over tile boundary
        layout.move_into_tile = false;

        // label anchors (point labels only)
        // label position will be adjusted in the given direction, relative to its original point
        // one of: left, right, top, bottom, top-left, top-right, bottom-left, bottom-right
        layout.anchor = draw.anchor;

        // label offset and buffer in pixel (applied in screen space)
        layout.offset = StyleParser.evalCachedProperty(draw.offset, context) || StyleParser.zeroPair;
        layout.buffer = StyleParser.evalCachedProperty(draw.buffer, context) || StyleParser.zeroPair;

        // repeat rules
        layout.repeat_distance = StyleParser.evalCachedProperty(draw.repeat_distance, context);
        if (layout.repeat_distance) {
            layout.repeat_distance *= layout.units_per_pixel;

            if (typeof draw.repeat_group === 'function') {
                layout.repeat_group = draw.repeat_group(context);
            }
            else if (typeof draw.repeat_group === 'string') {
                layout.repeat_group = draw.repeat_group;
            }
            else {
                layout.repeat_group = draw.key; // default to unique set of matching layers
            }
        }

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

    // Implements label building for TextLabels mixin
    buildTextLabels (tile_key, feature_queue) {
        let labels = [];
        for (let f=0; f < feature_queue.length; f++) {
            let fq = feature_queue[f];
            let text_info = this.texts[tile_key][fq.text_settings_key][fq.text];
            let size = text_info.size.collision_size;
            fq.label = new LabelPoint(fq.point_label.position, size, fq.layout);
            labels.push(fq);
        }
        return labels;
    },

    // Builds one or more point labels for a geometry
    buildLabels (size, geometry, options) {
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
            let line = geometry.coordinates;
            let point_labels = placePointsOnLine(line, size, options);
            for (let i = 0; i < point_labels.length; ++i) {
                labels.push(point_labels[i]);
            }
        }
        else if (geometry.type === "MultiLineString") {
            let lines = geometry.coordinates;
            for (let ln = 0; ln < lines.length; ln++) {
                let line = lines[ln];
                let point_labels = placePointsOnLine(line, size, options);
                for (let i = 0; i < point_labels.length; ++i) {
                    labels.push(point_labels[i]);
                }
            }
        }
        else if (geometry.type === "Polygon") {
            // Point at polygon centroid (of outer ring)
            if (options.placement === PLACEMENT.CENTROID) {
                let centroid = Geo.centroid(geometry.coordinates);
                labels.push(new LabelPoint(centroid, size, options));
            }
            // Point at each polygon vertex (all rings)
            else {
                let rings = geometry.coordinates;
                for (let ln = 0; ln < rings.length; ln++) {
                    let point_labels = placePointsOnLine(rings[ln], size, options);
                    for (let i = 0; i < point_labels.length; ++i) {
                        labels.push(point_labels[i]);
                    }
                }
            }
        }
        else if (geometry.type === "MultiPolygon") {
            if (options.placement === PLACEMENT.CENTROID) {
                let centroid = Geo.multiCentroid(geometry.coordinates);
                labels.push(new LabelPoint(centroid, size, options));
            }
            else {
                let polys = geometry.coordinates;
                for (let p = 0; p < polys.length; p++) {
                    let rings = polys[p];
                    for (let ln = 0; ln < rings.length; ln++) {
                        let point_labels = placePointsOnLine(rings[ln], size, options);
                        for (let i = 0; i < point_labels.length; ++i) {
                            labels.push(point_labels[i]);
                        }
                    }
                }
            }
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
        this.fillVertexTemplate('a_position', this.scaleOrder(style.order), { size: 1, offset: 3 });

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

    buildQuad(points, size, angle, sampler, offset, texcoord_scale, vertex_data, vertex_template) {
        buildQuadsForPoints(
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
                quad: size,
                quad_normalize: 256,    // values have an 8-bit fraction
                offset,
                angle: angle * 4096,    // values have a 12-bit fraction
                shape_w: sampler,
                texcoord_scale,
                texcoord_normalize: 65535
            }
        );
    },

    // Build quad for point sprite
    build (style, vertex_data) {
        let label = style.label;
        if (label.num_segments) {
            this.buildArticulatedLabel(label, style, vertex_data);
        }
        else {
            this.buildLabel(label, style, vertex_data);
        }
    },

    buildLabel (label, style, vertex_data) {
        let vertex_template = this.makeVertexTemplate(style);
        let angle = label.angle || style.angle;

        this.buildQuad(
            [label.position],               // position
            style.size,                     // size in pixels
            angle,                          // angle in radians
            style.sampler,                  // texture sampler to use
            label.offset,                   // offset from center in pixels
            style.texcoords,                // texture UVs
            vertex_data, vertex_template    // VBO and data for current vertex
        );
    },

    buildArticulatedLabel (label, style, vertex_data) {
        let vertex_template = this.makeVertexTemplate(style);

        for (var i = 0; i < label.num_segments; i++){
            let angle = label.angle[i];
            let size = style.size[i];
            let offset = label.offsets[i];
            let texcoord = style.texcoords[i];

            this.buildQuad(
                [label.position],               // position
                size,                           // size in pixels
                angle,                          // angle in degrees
                style.sampler,                  // texture sampler to use
                offset,                         // offset from center in pixels
                texcoord,                       // texture UVs
                vertex_data, vertex_template    // VBO and data for current vertex
            );
        }
    },

    // Override to pass-through to generic point builder
    buildLines (lines, style, vertex_data, context) {
        this.build(style, vertex_data);
    },

    buildPoints (points, style, vertex_data, context) {
        this.build(style, vertex_data);
    },

    buildPolygons (points, style, vertex_data, context) {
        this.build(style, vertex_data);
    },

    makeMesh (vertex_data, vertex_elements, options = {}) {
        // Add label fade time
        options = Object.assign({}, options, { fade_in_time: this.fade_in_time });
        return Style.makeMesh.call(this, vertex_data, vertex_elements, options);
    }

});
