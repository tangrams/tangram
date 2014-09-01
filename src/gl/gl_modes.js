// Rendering modes

var GL = require('./gl.js');
var GLBuilders = require('./gl_builders.js');
var GLGeometry = require('./gl_geom.js');
var GLVertexLayout = require('./gl_vertex_layout.js');
var GLProgram = require('./gl_program.js');
var GLTexture = require('./gl_texture.js');
var shader_sources = require('./gl_shaders.js'); // built-in shaders

// Base

var RenderMode = {
    init: function (gl) {
        this.gl = gl;
        this.makeGLProgram();

        if (typeof this._init == 'function') {
            this._init();
        }
    },
    refresh: function () {
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

RenderMode.makeGLProgram = function ()
{
    // Add any custom defines to built-in mode defines
    var defines = {}; // create a new object to avoid mutating a prototype value that may be shared with other modes
    if (this.defines != null) {
        for (var d in this.defines) {
            defines[d] = this.defines[d];
        }
    }
    if (this.shaders != null && this.shaders.defines != null) {
        for (var d in this.shaders.defines) {
            defines[d] = this.shaders.defines[d];
        }
    }

    // Alter defines for selection (need to create a new object since the first is stored as a reference by the program)
    if (this.selection) {
        var selection_defines = Object.create(defines);
        selection_defines['FEATURE_SELECTION'] = true;
    }

    // Get any custom code transforms
    var transforms = (this.shaders && this.shaders.transforms);

    // Create shader from custom URLs
    if (this.shaders && this.shaders.vertex_url && this.shaders.fragment_url) {
        this.gl_program = GLProgram.createProgramFromURLs(
            this.gl,
            this.shaders.vertex_url,
            this.shaders.fragment_url,
            { defines: defines, transforms: transforms }
        );

        if (this.selection) {
            this.selection_gl_program = new GLProgram(
                this.gl,
                this.gl_program.vertex_shader_source,
                shader_sources['selection_fragment'],
                { defines: selection_defines, transforms: transforms }
            );
        }
    }
    // Create shader from built-in source
    else {
        this.gl_program = new GLProgram(
            this.gl,
            shader_sources[this.vertex_shader_key],
            shader_sources[this.fragment_shader_key],
            { defines: defines, transforms: transforms }
        );

        if (this.selection) {
            this.selection_gl_program = new GLProgram(
                this.gl,
                shader_sources[this.vertex_shader_key],
                shader_sources['selection_fragment'],
                { defines: selection_defines, transforms: transforms }
            );
       }
    }
};

// TODO: make this a generic ORM-like feature for setting uniforms via JS objects on GLProgram
RenderMode.setUniforms = function (options)
{
    options = options || {};
    var gl_program = GLProgram.current; // operate on currently bound program

    // TODO: only update uniforms when changed
    if (this.shaders != null && this.shaders.uniforms != null) {
        var texture_unit = 0;

        for (var u in this.shaders.uniforms) {
            var uniform = this.shaders.uniforms[u];

            // Single float
            if (typeof uniform == 'number') {
                gl_program.uniform('1f', u, uniform);
            }
            // Multiple floats - vector or array
            else if (typeof uniform == 'object') {
                // float vectors (vec2, vec3, vec4)
                if (uniform.length >= 2 && uniform.length <= 4) {
                    gl_program.uniform(uniform.length + 'fv', u, uniform);
                }
                // float array
                else if (uniform.length > 4) {
                    gl_program.uniform('1fv', u + '[0]', uniform);
                }
                // TODO: assume matrix for (typeof == Float32Array && length == 16)?
            }
            // Boolean
            else if (typeof this.shaders.uniforms[u] == 'boolean') {
                gl_program.uniform('1i', u, uniform);
            }
            // Texture
            else if (typeof uniform == 'string') {
                var texture = GLTexture.textures[uniform];
                if (texture == null) {
                    texture = new GLTexture(this.gl, uniform);
                    texture.load(uniform);
                }

                texture.bind(texture_unit);
                gl_program.uniform('1i', u, texture_unit);
                texture_unit++;
            }
            // TODO: support other non-float types? (int, etc.)
        }
    }
};

RenderMode.update = function ()
{
    // Mode-specific animation
    if (typeof this.animation == 'function') {
        this.animation();
    }
};


var Modes = {};
var ModeManager = {};

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
    return Modes[name];
};


// Built-in rendering modes

/*** Plain polygons ***/

Modes.polygons = Object.create(RenderMode);

Modes.polygons.vertex_shader_key = 'polygon_vertex';
Modes.polygons.fragment_shader_key = 'polygon_fragment';

Modes.polygons.defines = {
    'WORLD_POSITION_WRAP': 100000 // default world coords to wrap every 100,000 meters, can turn off by setting this to 'false'
};

Modes.polygons.selection = true;

Modes.polygons._init = function () {
    this.vertex_layout = new GLVertexLayout(this.gl, [
        { name: 'a_position', size: 3, type: this.gl.FLOAT, normalized: false },
        { name: 'a_normal', size: 3, type: this.gl.FLOAT, normalized: false },
        { name: 'a_color', size: 3, type: this.gl.FLOAT, normalized: false },
        { name: 'a_selection_color', size: 4, type: this.gl.FLOAT, normalized: false },
        { name: 'a_layer', size: 1, type: this.gl.FLOAT, normalized: false }
    ]);
};

Modes.polygons.buildPolygons = function (polygons, style, vertex_data)
{
    // Color and layer number are currently constant across vertices
    var vertex_constants = [
        style.color[0], style.color[1], style.color[2],
        style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3],
        style.layer_num
    ];

    // Outlines have a slightly different set of constants, because the layer number is modified
    if (style.outline.color) {
        var outline_vertex_constants = [
            style.outline.color[0], style.outline.color[1], style.outline.color[2],
            style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3],
            style.layer_num - 0.5 // outlines sit between layers, underneath current layer but above the one below
        ];
    }

    // Extruded polygons (e.g. 3D buildings)
    if (style.extrude && style.height) {
        GLBuilders.buildExtrudedPolygons(
            polygons,
            style.z,
            style.height,
            style.min_height,
            vertex_data,
            {
                vertex_constants: vertex_constants
            }
        );
    }
    // Regular polygons
    else {
        GLBuilders.buildPolygons(
            polygons,
            style.z,
            vertex_data,
            {
                normals: true,
                vertex_constants: vertex_constants
            }
        );

        // Callback-base builder (for future exploration)
        // var normal_vertex_constants = [0, 0, 1].concat(vertex_constants);
        // GLBuilders.buildPolygons2(
        //     polygons,
        //     z,
        //     function (vertices) {
        //         // var vs = vertices.positions;
        //         // for (var v in vs) {
        //         //     // var bc = [(v % 3) ? 0 : 1, ((v + 1) % 3) ? 0 : 1, ((v + 2) % 3) ? 0 : 1];
        //         //     // var bc = [centroid.x, centroid.y, 0];
        //         //     // vs[v] = vertices.positions[v].concat(z, 0, 0, 1, bc);

        //         //     // vs[v] = vertices.positions[v].concat(z, 0, 0, 1);
        //         //     vs[v] = vertices.positions[v].concat(0, 0, 1);
        //         // }

        //         GL.addVertices(vertices.positions, normal_vertex_constants, vertex_data);

        //         // GL.addVerticesByAttributeLayout(
        //         //     [
        //         //         { name: 'a_position', data: vertices.positions },
        //         //         { name: 'a_normal', data: [0, 0, 1] },
        //         //         { name: 'a_color', data: [style.color[0], style.color[1], style.color[2]] },
        //         //         { name: 'a_layer', data: style.layer_num }
        //         //     ],
        //         //     vertex_data
        //         // );

        //         // GL.addVerticesMultipleAttributes([vertices.positions], normal_vertex_constants, vertex_data);
        //     }
        // );
    }

    // Polygon outlines
    if (style.outline.color && style.outline.width) {
        for (var mpc=0; mpc < polygons.length; mpc++) {
            GLBuilders.buildPolylines(
                polygons[mpc],
                style.z,
                style.outline.width,
                vertex_data,
                {
                    closed_polygon: true,
                    remove_tile_edges: true,
                    vertex_constants: outline_vertex_constants
                }
            );
        }
    }
};

Modes.polygons.buildLines = function (lines, style, vertex_data)
{
    // TOOD: reduce redundancy of constant calc between builders
    // Color and layer number are currently constant across vertices
    var vertex_constants = [
        style.color[0], style.color[1], style.color[2],
        style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3],
        style.layer_num
    ];

    // Outlines have a slightly different set of constants, because the layer number is modified
    if (style.outline.color) {
        var outline_vertex_constants = [
            style.outline.color[0], style.outline.color[1], style.outline.color[2],
            style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3],
            style.layer_num - 0.5 // outlines sit between layers, underneath current layer but above the one below
        ];
    }

    // Main lines
    GLBuilders.buildPolylines(
        lines,
        style.z,
        style.width,
        vertex_data,
        {
            vertex_constants: vertex_constants
        }
    );

    // Line outlines
    if (style.outline.color && style.outline.width) {
        GLBuilders.buildPolylines(
            lines,
            style.z,
            style.width + 2 * style.outline.width,
            vertex_data,
            {
                vertex_constants: outline_vertex_constants
            }
        );
    }
};

Modes.polygons.buildPoints = function (points, style, vertex_data)
{
    // TOOD: reduce redundancy of constant calc between builders
    // Color and layer number are currently constant across vertices
    var vertex_constants = [
        style.color[0], style.color[1], style.color[2],
        style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3],
        style.layer_num
    ];

    GLBuilders.buildQuadsForPoints(
        points,
        style.size * 2,
        style.size * 2,
        style.z,
        vertex_data,
        {
            normals: true,
            texcoords: false,
            vertex_constants: vertex_constants
        }
    );
};


/*** Points w/simple distance field rendering ***/

Modes.points = Object.create(RenderMode);

Modes.points.vertex_shader_key = 'point_vertex';
Modes.points.fragment_shader_key = 'point_fragment';

Modes.points.defines = {
    'EFFECT_SCREEN_COLOR': true
};

Modes.points.selection = true;

Modes.points._init = function () {
    this.vertex_layout = new GLVertexLayout(this.gl, [
        { name: 'a_position', size: 3, type: this.gl.FLOAT, normalized: false },
        { name: 'a_texcoord', size: 2, type: this.gl.FLOAT, normalized: false },
        { name: 'a_color', size: 3, type: this.gl.FLOAT, normalized: false },
        { name: 'a_selection_color', size: 4, type: this.gl.FLOAT, normalized: false },
        { name: 'a_layer', size: 1, type: this.gl.FLOAT, normalized: false }
    ]);
};

Modes.points.buildPoints = function (points, style, vertex_data)
{
    // TOOD: reduce redundancy of constant calc between builders
    // Color and layer number are currently constant across vertices
    var vertex_constants = [
        style.color[0], style.color[1], style.color[2],
        style.selection.color[0], style.selection.color[1], style.selection.color[2], style.selection.color[3],
        style.layer_num
    ];

    GLBuilders.buildQuadsForPoints(
        points,
        style.size * 2,
        style.size * 2,
        style.z,
        vertex_data,
        {
            normals: false,
            texcoords: true,
            vertex_constants: vertex_constants
        }
    );
};

if (module !== undefined) {
    module.exports = {
        ModeManager: ModeManager,
        Modes: Modes
    };
}
