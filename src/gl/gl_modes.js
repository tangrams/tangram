// Rendering modes
import GLVertexLayout from './gl_vertex_layout';
import {GLBuilders} from './gl_builders';
import GLProgram from './gl_program';
import GLGeometry from './gl_geom';
import gl from './gl_constants'; // web workers don't have access to GL context, so import all GL constants

var shader_sources = require('./gl_shaders'); // built-in shaders

import Queue from 'queue-async';

export var Modes = {};
export var ModeManager = {};


// Base

var RenderMode = {
    setGL (gl) {
        this.gl = gl;
        this.valid = true;
        this.makeGLProgram();
    },
    refresh: function () { // TODO: should this be async/non-blocking?
        this.makeGLProgram();
    },
    defines: {},
    selection: false,
    buildPolygons: function(){}, // build functions are no-ops until overriden
    buildLines: function(){},
    buildPoints: function(){},
    makeGLGeometry: function (vertex_data) {
        return new GLGeometry(this.gl, vertex_data, this.vertex_layout);
    }
};

RenderMode.destroy = function () {
    if (this.gl_program) {
        this.gl_program.destroy();
        this.gl_program = null;
    }

    if (this.selection_gl_program) {
        this.selection_gl_program.destroy();
        this.selection_gl_program = null;
    }

    this.gl = null;
    this.valid = false;

    if (!this.built_in) {
        delete Modes[this.name];
    }
};

RenderMode.makeGLProgram = function ()
{
    if (this.loading || this.valid === false) {
        return false;
    }
    this.loading = true;
    var queue = Queue();

    // Build defines & for selection (need to create a new object since the first is stored as a reference by the program)
    var defines = this.buildDefineList();
    if (this.selection) {
        var selection_defines = Object.create(defines);
        selection_defines['FEATURE_SELECTION'] = true;
    }

    // Get any custom code transforms
    var transforms = (this.shaders && this.shaders.transforms);

    // Create shaders - programs may point to inherited parent properties, but should be replaced by subclass version
    var program = (this.hasOwnProperty('gl_program') && this.gl_program);
    var selection_program = (this.hasOwnProperty('selection_gl_program') && this.selection_gl_program);

    queue.defer(complete => {
        if (!program) {
            // console.log(this.name + ": " + "instantiate");
            program = new GLProgram(
                this.gl,
                shader_sources[this.vertex_shader_key],
                shader_sources[this.fragment_shader_key],
                {
                    defines: defines,
                    transforms: transforms,
                    name: this.name,
                    callback: complete
                }
            );
        }
        else {
            // console.log(this.name + ": " + "re-compile");
            program.defines = defines;
            program.transforms = transforms;
            program.compile(complete);
        }
    });

    if (this.selection) {
        queue.defer(complete => {
            if (!selection_program) {
                // console.log(this.name + ": " + "selection instantiate");
                selection_program = new GLProgram(
                    this.gl,
                    shader_sources[this.vertex_shader_key],
                    shader_sources['selection_fragment'],
                    {
                        defines: selection_defines,
                        transforms: transforms,
                        name: (this.name + ' (selection)'),
                        callback: complete
                    }
                );
            }
            else {
                // console.log(this.name + ": " + "selection re-compile");
                selection_program.defines = selection_defines;
                selection_program.transforms = transforms;
                selection_program.compile(complete);
            }
        });
    }

    // Wait for program(s) to compile before replacing them
    // TODO: should this entire method offer a callback for when compilation completes?
    queue.await(() => {
       if (program) {
           this.gl_program = program;
       }

       if (selection_program) {
           this.selection_gl_program = selection_program;
       }

       this.loading = false;
    });

    return true;
};

// TODO: could probably combine and generalize this with similar method in GLProgram
// (list of define objects that inherit from each other)
RenderMode.buildDefineList = function ()
{
    // Add any custom defines to built-in mode defines
    var defines = {}; // create a new object to avoid mutating a prototype value that may be shared with other modes
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
};

// Set mode uniforms on currently bound program
RenderMode.setUniforms = function ()
{
    var gl_program = GLProgram.current;
    if (gl_program != null && this.shaders != null && this.shaders.uniforms != null) {
        gl_program.setUniforms(this.shaders.uniforms);
    }
};

RenderMode.update = function ()
{
    // Mode-specific animation
    if (typeof this.animation === 'function') {
        this.animation();
    }
};

// Update built-in mode or create a new one
ModeManager.configureMode = function (name, settings)
{
    Modes[name] = Modes[name] || Object.create(Modes[settings.extends] || RenderMode);
    if (Modes[settings.extends]) {
        Modes[name].parent = Modes[settings.extends]; // explicit 'super' class access
    }

    for (var s in settings) {
        Modes[name][s] = settings[s];
    }

    Modes[name].name = name;
    return Modes[name];
};

// Destroy all modes for a given GL context
ModeManager.destroy = function (gl) {
    var modes = Object.keys(Modes);
    for (var m of modes) {
        var mode = Modes[m];
        if (mode.gl === gl) {
            // console.log(`destroying render mode ${mode.name}`);
            mode.destroy();
        }
    }
};


// Built-in rendering modes

/*** Plain polygons ***/

Modes.polygons = Object.create(RenderMode);
Modes.polygons.name = 'polygons';
Modes.polygons.built_in = true;

Modes.polygons.vertex_shader_key = 'polygon_vertex';
Modes.polygons.fragment_shader_key = 'polygon_fragment';

Modes.polygons.defines = {
    'WORLD_POSITION_WRAP': 100000 // default world coords to wrap every 100,000 meters, can turn off by setting this to 'false'
};

Modes.polygons.selection = true;

Modes.polygons.init = function () {
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
};

// A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
// A plain JS array matching the order of the vertex layout.
Modes.polygons.makeVertexTemplate = function (style) {
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
};

Modes.polygons.buildPolygons = function (polygons, style, vertex_data)
{
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
    if (style.outline.color && style.outline.width) {
        // Replace color in vertex template
        var color_index = this.vertex_layout.index.a_color;
        vertex_template[color_index + 0] = style.outline.color[0] * 255;
        vertex_template[color_index + 1] = style.outline.color[1] * 255;
        vertex_template[color_index + 2] = style.outline.color[2] * 255;

        // Polygon outlines sit over current layer but underneath the one above
        // TODO: address inconsistency with line outlines
        vertex_template[this.vertex_layout.index.a_layer] += 0.25;

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
};

Modes.polygons.buildLines = function (lines, style, vertex_data)
{
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
    if (style.outline.color && style.outline.width) {
        // Replace color in vertex template
        var color_index = this.vertex_layout.index.a_color;
        vertex_template[color_index + 0] = style.outline.color[0] * 255;
        vertex_template[color_index + 1] = style.outline.color[1] * 255;
        vertex_template[color_index + 2] = style.outline.color[2] * 255;

        // Line outlines sit underneath current layer but above the one below
        // TODO: address inconsistency with polygon outlines
        // TODO: need more fine-grained styling controls for outlines
        // (see complex road interchanges where casing outlines should be interleaved by road type)
        vertex_template[this.vertex_layout.index.a_layer] -= 0.25;

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
};

Modes.polygons.buildPoints = function (points, style, vertex_data)
{
    var vertex_template = this.makeVertexTemplate(style);

    GLBuilders.buildQuadsForPoints(
        points,
        style.size * 2,
        style.size * 2,
        vertex_data,
        vertex_template,
        { texcoord_index: this.vertex_layout.index.a_texcoord }
    );
};


/*** Points w/simple distance field rendering ***/

Modes.points = Object.create(RenderMode);
Modes.points.name = 'points';
Modes.points.built_in = true;

Modes.points.vertex_shader_key = 'point_vertex';
Modes.points.fragment_shader_key = 'point_fragment';

Modes.points.defines = {
    'EFFECT_SCREEN_COLOR': true
};

Modes.points.selection = true;

Modes.points.init = function () {
    this.vertex_layout = new GLVertexLayout([
        { name: 'a_position', size: 3, type: gl.FLOAT, normalized: false },
        { name: 'a_texcoord', size: 2, type: gl.FLOAT, normalized: false },
        { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
        { name: 'a_selection_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
        { name: 'a_layer', size: 1, type: gl.FLOAT, normalized: false }
    ]);
};

// A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
// A plain JS array matching the order of the vertex layout.
Modes.points.makeVertexTemplate = function (style) {
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
};

Modes.points.buildPoints = function (points, style, vertex_data)
{
    var vertex_template = this.makeVertexTemplate(style);

    GLBuilders.buildQuadsForPoints(
        points,
        style.size * 2,
        style.size * 2,
        vertex_data,
        vertex_template,
        { texcoord_index: this.vertex_layout.index.a_texcoord }
    );
};
