// Rendering styles

import {StyleParser} from './style_parser';
import GLVertexLayout from '../gl/gl_vertex_layout';
import GLProgram from '../gl/gl_program';
import GLGeometry from '../gl/gl_geom';
import GLTexture from '../gl/gl_texture';
import {MethodNotImplemented} from '../errors';
import gl from '../gl/gl_constants'; // web workers don't have access to GL context, so import all GL constants
import shaderSources from '../gl/shader_sources'; // built-in shaders

import log from 'loglevel';

// Base class

export var Style = {
    init () {
        if (this.initialized) {
            return;
        }

        this.defines = this.defines || {};          // #defines to be injected into the shaders
        this.shaders = this.shaders || {};          // shader customization via scene definition (uniforms, defines, blocks, etc.)
        this.selection = this.selection || false;   // flag indicating if this style supports feature selection
        this.compiling = false;                     // programs are currently compiling
        this.compiled = false;                      // programs are finished compiling
        this.program = null;                        // GL program reference (for main render pass)
        this.selection_program = null;              // GL program reference for feature selection render pass
        this.feature_style = {};                    // style for feature currently being parsed, shared to lessen GC/memory thrash
        this.initialized = true;
    },

    setGL (gl) {
        this.gl = gl;

        // Initialize any configured textures
        // (textures can also be initialized via uniform setters if they don't require any additional configuration)
        if (this.textures) {
            console.log('init ' + this.name);
            for (var name in this.textures) {
                var { url, filtering, repeat, atlas } = this.textures[name];
                var texture = new GLTexture(this.gl, name, { atlas });

                // use name as URL if no URL is provided
                let _name = name;
                texture.load(url || name, { filtering, repeat }).then(() => {
                    this.textures[_name].width = texture.width;
                    this.textures[_name].height = texture.height;
                });
            }
        }
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

    parseFeature (feature, feature_style, tile, context) {
        try {
            var style = this.feature_style;

            // Calculate order if it was not cached
            style.order = feature_style.order;
            if (typeof style.order !== 'number') {
                style.order = StyleParser.calculateOrder(style.order, context);
            }

            // Feature selection (only if style supports it)
            var selectable = false;
            style.interactive = feature_style.interactive;
            if (this.selection) {
                if (typeof style.interactive === 'function') {
                    selectable = style.interactive(context);
                }
                else {
                    selectable = style.interactive;
                }
            }

            // If feature is marked as selectable
            if (selectable) {
                style.selection_color = StyleParser.makeSelectionColor(feature);
            }
            else {
                style.selection_color = StyleParser.defaults.selection_color;
            }

            // Subclass implementation
            this._parseFeature(feature, feature_style, context);

            return style;
        }
        catch(error) {
            log.error('Style.parseFeature: style parsing error', feature, tile, error);
        }
    },

    _parseFeature (feature, feature_style, context) {
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
        this.initialized = false;
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
                shaderSources[this.vertex_shader_key],
                shaderSources[this.fragment_shader_key],
                {
                    defines: defines,
                    transforms: transforms,
                    name: this.name
                }
            );

            if (this.selection) {
                this.selection_program = new GLProgram(
                    this.gl,
                    shaderSources[this.vertex_shader_key],
                    shaderSources['selection_fragment'],
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
