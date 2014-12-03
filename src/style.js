// Rendering styles
import GLVertexLayout from './gl/gl_vertex_layout';
import {GLBuilders} from './gl/gl_builders';
import GLProgram from './gl/gl_program';
import GLGeometry from './gl/gl_geom';
import {StyleParser} from './style_parser';
import Utils from './utils';
import {MethodNotImplemented} from './errors';
import gl from './gl/gl_constants'; // web workers don't have access to GL context, so import all GL constants
import log from 'loglevel';
var shader_sources = require('./gl/gl_shaders'); // built-in shaders

export var Styles = {};
export var StyleManager = {};


// Global configuration for all styles
StyleManager.init = function () {
    // GLProgram.removeTransform('globals');

    // // Layer re-ordering function
    // GLProgram.addTransform('globals', shaderSources['modules/reorder_layers']);

    // // Spherical environment map
    // GLProgram.addTransform('globals', `
    //     #if defined(LIGHTING_ENVIRONMENT)
    //     ${shaderSources['modules/spherical_environment_map']}
    //     #endif
    // `);
};

// Update built-in style or create a new one
StyleManager.updateStyle = function (name, settings) {
    Styles[name] = Styles[name] || Object.create(Styles[settings.extends] || RenderMode);
    if (Styles[settings.extends]) {
        Styles[name].parent = Styles[settings.extends]; // explicit 'super' class access
    }

    for (var s in settings) {
        Styles[name][s] = settings[s];
    }

    Styles[name].name = name;
    return Styles[name];
};

// Destroy all styles for a given GL context
StyleManager.destroy = function (gl) {
    Object.keys(Styles).forEach((_name) => {
        var style = Styles[_name];
        if (style.gl === gl) {
            log.trace(`destroying render style ${style.name}`);
            style.destroy();
        }
    });
};

// Normalize some style settings that may not have been explicitly specified in the stylesheet
StyleManager.preProcessSceneConfig = function (config) {
    // Post-process styles
    for (var m in config.layers) {
        if (config.layers[m].visible !== false) {
            config.layers[m].visible = true;
        }

        if ((config.layers[m].style && config.layers[m].style.name) == null) {
            config.layers[m].style = {};
            for (var p in StyleParser.defaults.style) {
                config.layers[m].style[p] = StyleParser.defaults.style[p];
            }
        }
    }

    config.camera = config.camera || {}; // ensure camera object
    config.lighting = config.lighting || {}; // ensure lighting object

    return StyleManager.preloadStyles(config.styles);
};

// Preloads network resources in the stylesheet (shaders, textures, etc.)
StyleManager.preloadStyles = function (styles) {
    // Preload shaders
    var queue = [];
    if (styles) {
        for (var style of Utils.values(styles)) {
            if (style.shaders && style.shaders.transforms) {
                let _transforms = style.shaders.transforms;

                for (var [key, transform] of Utils.entries(style.shaders.transforms)) {
                    let _key = key;

                    // Array of transforms
                    if (Array.isArray(transform)) {
                        for (let t=0; t < transform.length; t++) {
                            if (typeof transform[t] === 'object' && transform[t].url) {
                                let _index = t;
                                queue.push(Utils.io(Utils.cacheBusterForUrl(transform[t].url)).then((data) => {
                                    _transforms[_key][_index] = data;
                                }, (error) => {
                                    log.error(`StyleManager.preProcessStyles: error loading shader transform`, _transforms, _key, _index, error);
                                }));
                            }
                        }
                    }
                    // Single transform
                    else if (typeof transform === 'object' && transform.url) {
                        queue.push(Utils.io(Utils.cacheBusterForUrl(transform.url)).then((data) => {
                            _transforms[_key] = data;
                        }, (error) => {
                            log.error(`StyleManager.preProcessStyles: error loading shader transform`, _transforms, _key, error);
                        }));
                    }
                }
            }
        }
    }

    // TODO: also preload textures

    return Promise.all(queue); // TODO: add error
};

// Called once on instantiation
StyleManager.createStyles = function (stylesheet_styles) {
    StyleManager.init();

    // Stylesheet-defined styles
    for (var name in stylesheet_styles) {
        Styles[name] = StyleManager.updateStyle(name, stylesheet_styles[name]);
    }

    // Initialize all
    for (name in Styles) {
        Styles[name].init();
    }

    return Styles;
};

// Called when styles are updated in stylesheet
StyleManager.updateStyles = function (stylesheet_styles) {
    // Copy stylesheet styles
    for (var name in stylesheet_styles) {
        Styles[name] = StyleManager.updateStyle(name, stylesheet_styles[name]);
    }

    // Compile all styles
    for (name in Styles) {
        try {
            Styles[name].compile();
            log.trace(`StyleManager.updateStyles(): compiled style ${name}`);
        }
        catch(error) {
            log.error(`StyleManager.updateStyles(): error compiling style ${name}:`, error);
        }
    }

    log.debug(`StyleManager.updateStyles(): compiled all styles`);
    return Styles;
};


// Base class

var RenderMode = {
    init () {
        this.defines = {};
        this.shaders = {};
        this.selection = false;
        this.compiling = false;
        this.compiled = false;
        this.program = null;
        this.selection_program = null;
    },

    setGL (gl) {
        this.gl = gl;
    },

    makeGLGeometry (vertex_data) {
        return new GLGeometry(this.gl, vertex_data, this.vertex_layout);
    },

    isBuiltIn () {
        return this.hasOwnProperty('built_in');
    },

    // Build functions are no-ops until overriden
    buildPolygons () {},
    buildLines () {},
    buildPoints () {},

    parseFeature (feature, feature_style, tile) {
        var style = Object.assign({}, feature_style);
        var context = StyleParser.getFeatureParseContext(feature, style, tile);

        // TODO: will be replaced (outside this function) with new style rule parsing
        // Test whether features should be rendered at all
        if (typeof style.filter === 'function') {
            if (style.filter(context) === false) {
                return null;
            }
        }

        // Adjusts feature render order *within* the overall layer
        // e.g. 'order' causes this feature to be drawn underneath or on top of other features in the same layer,
        // but all features on layers below this one will be drawn underneath, all features on layers above this one
        // will be drawn on top
        style.order = style.order || StyleParser.defaults.order;
        if (typeof style.order === 'function') {
            style.order = style.order(context);
        }
        style.order = Math.max(Math.min(style.order, 1), -1); // clamp to [-1, 1]

        // Feature selection
        var selectable = false;
        if (typeof style.interactive === 'function') {
            selectable = style.interactive(context);
        }
        else {
            selectable = style.interactive;
        }

        // If style supports feature selection and feature is marked as selectable
        if (this.selection && selectable === true) {
            var selector = StyleParser.generateSelection();

            selector.feature = {
                id: feature.id,
                properties: feature.properties
            };

            style.selection = {
                color: selector.color
            };
        }
        else {
            style.selection = StyleParser.defaults.selection;
        }

        // Subclass implementation
        this._parseFeature(feature, style, context);

        return style;
    },

    _parseFeature (feature, style, context) {
        throw new MethodNotImplemented('_parseFeature');
    },

    destroy () {
        if (this.program) {
            this.program.destroy();
            this.program = null;
        }

        if (this.selection_program) {
            this.selection_program.destroy();
            this.selection_program = null;
        }

        this.gl = null;

        if (!this.isBuiltIn()) {
            delete Styles[this.name];
        }
    },

    compile () {
        if (!this.gl) {
            throw(new Error(`style.compile(): skipping for ${this.name} because no GL context`));
        }

        if (this.compiling) {
            throw(new Error(`style.compile(): skipping for ${this.name} because style is already compiling`));
        }
        this.compiling = true;
        this.compiled = false;

        // Build defines & for selection (need to create a new object since the first is stored as a reference by the program)
        var defines = this.buildDefineList();
        if (this.selection) {
            var selection_defines = Object.assign({}, defines);
            selection_defines['FEATURE_SELECTION'] = true;
        }

        // Get any custom code transforms
        var transforms = (this.shaders && this.shaders.transforms);

        // Create shaders
        try {
            this.program = new GLProgram(
                this.gl,
                shader_sources[this.vertex_shader_key],
                shader_sources[this.fragment_shader_key],
                {
                    defines: defines,
                    transforms: transforms,
                    name: this.name
                }
            );

            if (this.selection) {
                this.selection_program = new GLProgram(
                    this.gl,
                    shader_sources[this.vertex_shader_key],
                    shader_sources['selection_fragment'],
                    {
                        defines: selection_defines,
                        transforms: transforms,
                        name: (this.name + ' (selection)')
                    }
                );
            }
            else {
                this.selection_program = null;
            }
        }
        catch(error) {
            this.compiling = false;
            this.compiled = false;
            throw(new Error(`style.compile(): style ${this.name} error:`, error));
        }

        this.compiling = false;
        this.compiled = true;
    },

    /** TODO: could probably combine and generalize this with similar method in GLProgram
     * (list of define objects that inherit from each other)
     */
    buildDefineList () {
        // Add any custom defines to built-in style defines
        var defines = {}; // create a new object to avoid mutating a prototype value that may be shared with other styles
        if (this.defines != null) {
            for (var d in this.defines) {
                defines[d] = this.defines[d];
            }
        }
        if (this.shaders != null && this.shaders.defines != null) {
            for (d in this.shaders.defines) {
                defines[d] = this.shaders.defines[d];
            }
        }
        return defines;

    },


    // Set style uniforms on currently bound program
    setUniforms () {
        var program = GLProgram.current;
        if (program != null && this.shaders != null && this.shaders.uniforms != null) {
            program.setUniforms(this.shaders.uniforms);
        }
    },

    update () {
        // Style-specific animation
        // if (typeof this.animation === 'function') {
        //     this.animation();
        // }
    }
};

// Update built-in style or create a new one
StyleManager.updateStyle = function (name, settings)
{
    Styles[name] = Styles[name] || Object.create(Styles[settings.extends] || RenderMode);
    if (Styles[settings.extends]) {
        Styles[name].parent = Styles[settings.extends]; // explicit 'super' class access
    }

    for (var s in settings) {
        Styles[name][s] = settings[s];
    }

    Styles[name].name = name;
    return Styles[name];
};

// Destroy all styles for a given GL context
StyleManager.destroy = function (gl) {
    Object.keys(Styles).forEach((_name) => {
        var style = Styles[_name];
        if (style.gl === gl) {
            log.trace(`destroying render style ${style.name}`);
            style.destroy();
        }
    });
};


// Built-in rendering styles

/*** Plain polygons ***/

var Polygons = Object.create(RenderMode);

Object.assign(Polygons, {
    built_in: true,
    init() {
        RenderMode.init.apply(this);

        // Base shaders
        this.vertex_shader_key = 'polygon_vertex';
        this.fragment_shader_key = 'polygon_fragment';

        // Default world coords to wrap every 100,000 meters, can turn off by setting this to 'false'
        this.defines['WORLD_POSITION_WRAP'] = 100000;

        // Turn feature selection on
        this.selection = true;

        // Basic attributes, others can be added (see texture UVs below)
        var attribs = [
            { name: 'a_position', size: 3, type: gl.FLOAT, normalized: false },
            { name: 'a_normal', size: 3, type: gl.FLOAT, normalized: false },
            // { name: 'a_normal', size: 3, type: gl.BYTE, normalized: true }, // attrib isn't a multiple of 4!
            // { name: 'a_color', size: 3, type: gl.FLOAT, normalized: false },
            { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
            // { name: 'a_selection_color', size: 4, type: gl.FLOAT, normalized: false },
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

    _parseFeature (feature, style, context) {
        style.color = StyleParser.parseColor(style.color, context);
        style.width = StyleParser.parseDistance(style.width, context);
        style.z = StyleParser.parseDistance(style.z, context);
        style.extrude = StyleParser.parseDistance(style.extrude, context);
        style.height = (feature.properties && feature.properties.height) || StyleParser.defaults.height;
        style.min_height = (feature.properties && feature.properties.min_height) || StyleParser.defaults.min_height;

        // height defaults to feature height, but extrude style can dynamically adjust height by returning a number or array (instead of a boolean)
        if (style.extrude) {
            if (typeof style.extrude === 'number') {
                style.height = style.extrude;
            }
            else if (typeof style.extrude === 'object' && style.extrude.length >= 2) {
                style.min_height = style.extrude[0];
                style.height = style.extrude[1];
            }
        }

        if (style.outline) {
            style.outline.color = StyleParser.parseColor(style.outline.color, context);
            style.outline.width = StyleParser.parseDistance(style.outline.width, context);
            style.outline.tile_edges = (style.outline.tile_edges === true) ? true : false;
        }

        return style;
    },

    /**
     * A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
     * A plain JS array matching the order of the vertex layout.
     */
    makeVertexTemplate(style) {
        // Basic attributes, others can be added (see texture UVs below)
        var template = [
            // position - x & y coords will be filled in per-vertex below
            0, 0, style.z,
            // normal
            0, 0, 1,
            // color
            // TODO: automate multiplication for normalized attribs?
            style.color[0] * 255, style.color[1] * 255, style.color[2] * 255, 255,
            // selection color
            style.selection.color[0] * 255, style.selection.color[1] * 255, style.selection.color[2] * 255, style.selection.color[3] * 255,
            // layer number
            style.layer_num
        ];

        if (this.texcoords) {
            // Add texture UVs to template only if needed
            template.push(0, 0);
        }

        return template;

    },

    buildPolygons(polygons, style, vertex_data) {
        var vertex_template = this.makeVertexTemplate(style);

        // Extruded polygons (e.g. 3D buildings)
        if (style.extrude && style.height) {
            GLBuilders.buildExtrudedPolygons(
                polygons,
                style.z, style.height, style.min_height,
                vertex_data, vertex_template,
                this.vertex_layout.index.a_normal,
                { texcoord_index: this.vertex_layout.index.a_texcoord }
            );
        }
        // Regular polygons
        else {
            GLBuilders.buildPolygons(
                polygons,
                vertex_data, vertex_template,
                { texcoord_index: this.vertex_layout.index.a_texcoord }
            );
        }

        // Polygon outlines
        if (style.outline && style.outline.color && style.outline.width) {
            // Replace color in vertex template
            var color_index = this.vertex_layout.index.a_color;
            vertex_template[color_index + 0] = style.outline.color[0] * 255;
            vertex_template[color_index + 1] = style.outline.color[1] * 255;
            vertex_template[color_index + 2] = style.outline.color[2] * 255;

            // Polygon outlines sit over current layer but underneath the one above
            // TODO: address inconsistency with line outlines
            vertex_template[this.vertex_layout.index.a_layer] += 0.0001;

            for (var mpc=0; mpc < polygons.length; mpc++) {
                GLBuilders.buildPolylines(
                    polygons[mpc],
                    style.z,
                    style.outline.width,
                    vertex_data,
                    vertex_template,
                    {
                        texcoord_index: this.vertex_layout.index.a_texcoord,
                        closed_polygon: true,
                        remove_tile_edges: !style.outline.tile_edges
                    }
                );
            }
        }
    },

    buildLines(lines, style, vertex_data) {
        var vertex_template = this.makeVertexTemplate(style);

        // Main lines
        GLBuilders.buildPolylines(
            lines,
            style.z,
            style.width,
            vertex_data,
            vertex_template,
            {
                texcoord_index: this.vertex_layout.index.a_texcoord
            }
        );

        // Line outlines
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
                    texcoord_index: this.vertex_layout.index.a_texcoord
                }
            );
        }
    },

    buildPoints(points, style, vertex_data) {
        var vertex_template = this.makeVertexTemplate(style);

        GLBuilders.buildQuadsForPoints(
            points,
            style.size * 2,
            style.size * 2,
            vertex_data,
            vertex_template,
            { texcoord_index: this.vertex_layout.index.a_texcoord }
        );

    },
    name: 'polygons'
});

//Polygons.name = 'polygons';
Styles[Polygons.name] = Polygons;



/*** Points w/simple distance field rendering ***/

var Points = Object.create(RenderMode);

Object.assign(Points, {
    name: 'points',
    built_in: true,
    init() {
        RenderMode.init.apply(this);

        // Base shaders
        this.vertex_shader_key = 'point_vertex';
        this.fragment_shader_key = 'point_fragment';

        // TODO: remove this hard-coded special effect
        this.defines['EFFECT_SCREEN_COLOR'] = true;

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

    _parseFeature (feature, style, context) {
        style.color = StyleParser.parseColor(style.color, context);
        style.size = StyleParser.parseDistance(style.size, context);
        style.z = StyleParser.parseDistance(style.z, context);
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
            style.selection.color[0] * 255, style.selection.color[1] * 255, style.selection.color[2] * 255, style.selection.color[3] * 255,
            // layer number
            style.layer_num
        ];
    },

    buildPoints(points, style, vertex_data) {
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

Styles[Points.name] = Points;
