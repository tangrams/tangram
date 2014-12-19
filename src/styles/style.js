// Rendering styles

import {StyleParser} from './style_parser';
import GLVertexLayout from '../gl/gl_vertex_layout';
import GLProgram from '../gl/gl_program';
import GLGeometry from '../gl/gl_geom';
import {GLBuilders} from '../gl/gl_builders';
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

        if (!this.isBuiltIn()) {
            this.built_in = false; // explicitly set to false to avoid any confusion
        }

        this.defines = this.defines || {};          // #defines to be injected into the shaders
        this.shaders = this.shaders || {};          // shader customization via scene definition (uniforms, defines, blocks, etc.)
        this.selection = this.selection || false;   // flag indicating if this style supports feature selection
        this.compiling = false;                     // programs are currently compiling
        this.compiled = false;                      // programs are finished compiling
        this.program = null;                        // GL program reference (for main render pass)
        this.selection_program = null;              // GL program reference for feature selection render pass
        this.feature_style = {};                    // style for feature currently being parsed, shared to lessen GC/memory thrash
        this.configureTextures();
        this.initialized = true;
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

    isBuiltIn () {
        return this.hasOwnProperty('built_in') && this.built_in;
    },

    /*** Style parsing and geometry construction ***/

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

    // Build functions are no-ops until overriden
    buildPolygons () {},
    buildLines () {},
    buildPoints () {},


    /*** Texture management ***/

    configureTextures () {
        // Simpler single texture syntax
        if (this.texture) {
            // Default to a single texture, using the URL as the name
            this.texture.id = 0;
            this.textures = { [this.texture.url]: this.texture };
            this.num_textures = 1;
        }

        // Multi-texture syntax
        if (this.textures) {
            this.num_textures = Object.keys(this.textures).length;

            if (this.num_textures === 1) {
                // Save a texture reference at 'texture' for convenience
                if (!this.texture) {
                    this.texture = this.textures[Object.keys(this.textures)[0]];
                }

                // For single textures, provide a single u_texture uniform
                this.defines['HAS_DEFAULT_TEXTURE'] = true;
                this.shaders.uniforms = this.shaders.uniforms || {};
                this.shaders.uniforms.u_texture = this.texture.url;
                this.calculateTextureSprites(this.texture.url, this.texture);
            }
            else {
                // For multiple textures, provide a built-in uniform array
                var tex_id = 0;
                this.defines['NUM_TEXTURES'] = this.num_textures.toString(); // force string to avoid auto-conversion to float
                this.shaders.uniforms = this.shaders.uniforms || {};
                this.shaders.uniforms.u_textures = [];

                for (var name in this.textures) {
                    var texture = this.textures[name];
                    texture.id = tex_id++; // give every texture a unique id local to this style

                    // Consistently map named textures to the same array index in the texture uniform
                    this.shaders.uniforms.u_textures[texture.id] = name;

                    // Provide a #define mapping each texture back to its name in the stylesheet
                    this.defines[`texture_${name}`] = `u_textures[${texture.id}]`;

                    this.calculateTextureSprites(name, texture);
                }
            }
        }
    },

    // Pre-calc sprite regions for a texture sprite in UV [0, 1] space
    calculateTextureSprites (name, texture) {
        if (texture.sprites) {
            // debugger;
            this.texture_sprites = this.texture_sprites || {};
            this.texture_sprites[name] = {};

            for (var s in texture.sprites) {
                var sprite = texture.sprites[s];

                // Map [0, 0] and [1, 1] coords to the appropriate sprite sub-area of the texture
                this.texture_sprites[name][s] = [
                    GLBuilders.scaleTexcoordsToSprite(
                        [0, 0],
                        [sprite[0], sprite[1]], [sprite[2], sprite[3]],
                        [texture.width, texture.height]),
                    GLBuilders.scaleTexcoordsToSprite(
                        [1, 1],
                        [sprite[0], sprite[1]], [sprite[2], sprite[3]],
                        [texture.width, texture.height])
                ];
            }
        }
    },

    // Set optional scale to use for texture coordinates (default is [0, 1])
    setTexcoordScale (style) {
        // Get sprite sub-area if necessary
        if (this.textures && style.sprite) {
            var tex;
            // If style only has one texture, use it
            if (this.num_textures === 1) {
                tex = this.texture && this.texture.url;
            }
            // If style has more than one texture, texture to use must be specified
            else {
                tex = style.texture;
            }

            if (!tex) {
                log.error(`Style: in style '${this.name}', must specify texture to use for sprite '${style.sprite}', must be one of [${Object.keys(this.textures).join(', ')}]`);
            }
            else {
                this.texcoord_scale = this.texture_sprites[tex] && this.texture_sprites[tex][style.sprite];
            }
        }
    },

    // Preload any textures with explicit configuration (in the 'texture'/'textures' fields)
    // (textures can also be initialized on the fly via uniform setters if they don't require any additional configuration)
    // NOTE: this is only run in the main thread, since workers don't use any GL resources
    preloadTextures () {
        if (this.textures) {
            for (var name in this.textures) {
                var { url, filtering, repeat, sprites } = this.textures[name];
                var texture = new GLTexture(this.gl, name, { sprites });

                let _name = name;
                texture.load(url, { filtering, repeat }).then(() => {
                    // TODO: these currently won't be guaranteed to load before worker starts
                    // need to fix, maybe w/promise
                    this.textures[_name].width = texture.width;
                    this.textures[_name].height = texture.height;
                });
            }
        }
    },


    /*** GL state and rendering ***/

    setGL (gl) {
        this.gl = gl;
        this.preloadTextures();
    },

    makeGLGeometry (vertex_data) {
        return new GLGeometry(this.gl, vertex_data, this.vertex_layout);
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

    // Setup any GL state for rendering
    setup () {
        this.setUniforms();
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
