// Rendering styles

import {StyleParser} from './style_parser';
import FeatureSelection from '../selection';
import ShaderProgram from '../gl/shader_program';
import VBOMesh from '../gl/vbo_mesh';
import Builders from './builders';
import Texture from '../gl/texture';
import {MethodNotImplemented} from '../utils/errors';
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
        this.textures = this.textures || {};
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

    // Returns an object to hold feature data (for a tile or other object)
    startData () {
        return {
            vertex_data: null,
            uniforms: null,
            order: { min: Infinity, max: -Infinity } // reset to track order range within tile
        };
    },

    // Finalizes an object holding feature data (for a tile or other object)
    endData (tile_data) {
        if (tile_data.vertex_data) {
            // Only keep final byte buffer
            tile_data.vertex_data.end();
            tile_data.vertex_data = tile_data.vertex_data.buffer;
        }
        return Promise.resolve(tile_data);
    },

    addFeature (feature, rule, context, tile_data) {
        let style = this.parseFeature(feature, rule, context);

        // Skip feature?
        if (!style) {
            return;
        }

        // Track min/max order range
        if (style.order < tile_data.order.min) {
            tile_data.order.min = style.order;
        }
        if (style.order > tile_data.order.max) {
            tile_data.order.max = style.order;
        }

        // First feature in this render style?
        if (!tile_data.vertex_data) {
            tile_data.vertex_data = this.vertex_layout.createVertexData();
        }

        this.buildGeometry(feature.geometry, style, tile_data.vertex_data);
    },

    buildGeometry (geometry, style, vertex_data) {
        if (geometry.type === 'Polygon') {
            this.buildPolygons([geometry.coordinates], style, vertex_data);
        }
        else if (geometry.type === 'MultiPolygon') {
            this.buildPolygons(geometry.coordinates, style, vertex_data);
        }
        else if (geometry.type === 'LineString') {
            this.buildLines([geometry.coordinates], style, vertex_data);
        }
        else if (geometry.type === 'MultiLineString') {
            this.buildLines(geometry.coordinates, style, vertex_data);
        }
        else if (geometry.type === 'Point') {
            this.buildPoints([geometry.coordinates], style, vertex_data);
        }
        else if (geometry.type === 'MultiPoint') {
            this.buildPoints(geometry.coordinates, style, vertex_data);
        }
    },

    parseFeature (feature, rule_style, context) {
        try {
            var style = this.feature_style;

            // Calculate order if it was not cached
            style.order = rule_style.order;
            if (typeof style.order !== 'number') {
                style.order = StyleParser.calculateOrder(style.order, context);
            }

            // Feature selection (only if style supports it)
            var selectable = false;
            style.interactive = rule_style.interactive;
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
                style.selection_color = FeatureSelection.makeColor(feature);
            }
            else {
                style.selection_color = FeatureSelection.defaultColor;
            }

            // Subclass implementation
            this._parseFeature(feature, rule_style, context);

            return style;
        }
        catch(error) {
            log.error('Style.parseFeature: style parsing error', feature, error);
        }
    },

    _parseFeature (feature, rule_style, context) {
        throw new MethodNotImplemented('_parseFeature');
    },

    // Build functions are no-ops until overriden
    buildPolygons () {},
    buildLines () {},
    buildPoints () {},


    /*** Texture management ***/

    // Prefix texture name with style name
    textureName (name) {
        return this.name + '_' + name;
    },

    setupTextureUniforms () {
        var num_textures = Object.keys(this.textures).length;

        // Set a default texture flag
        if (this.textures.default) {
            this.defines['HAS_DEFAULT_TEXTURE'] = true;
        }

        // Provide a built-in uniform array of textures
        if (num_textures > 0) {
            var tex_id = 0;
            this.defines['NUM_TEXTURES'] = num_textures.toString(); // force string to avoid auto-conversion to float
            this.shaders.uniforms = this.shaders.uniforms || {};
            this.shaders.uniforms.u_textures = [];

            for (var name in this.textures) {
                var texture = this.textures[name];
                texture.name = this.textureName(name);
                texture.id = tex_id++; // give every texture a unique id local to this style

                // Consistently map named textures to the same array index in the texture uniform
                this.shaders.uniforms.u_textures[texture.id] = texture.name;

                // Provide a #define mapping each texture back to its name in the stylesheet
                this.defines[`texture_${name}`] = `u_textures[${texture.id}]`;
            }
        }
    },

    // Preload any textures with explicit configuration in the 'textures' field
    // (textures can also be initialized on the fly via uniform setters if they don't require any additional configuration)
    // NOTE: this is only run in the main thread, since workers don't use any GL resources
    preloadTextures () {
        if (this.textures) {
            for (var name in this.textures) {
                var { url, filtering, repeat, sprites } = this.textures[name];
                var texture = new Texture(this.gl, this.textureName(name), { sprites });

                texture.load(url, { filtering, repeat });
            }
        }
    },

    // Pre-calc sprite regions for a texture sprite in UV [0, 1] space
    calculateTextureSprites (name) {
        var texture = Texture.textures[this.textureName(name)];
        if (texture.sprites) {
            this.texture_sprites = this.texture_sprites || {};
            this.texture_sprites[name] = {};

            for (var s in texture.sprites) {
                var sprite = texture.sprites[s];

                // Map [0, 0] to [1, 1] coords to the appropriate sprite sub-area of the texture
                this.texture_sprites[name][s] = Builders.getTexcoordsForSprite(
                    [sprite[0], sprite[1]],
                    [sprite[2], sprite[3]],
                    [texture.width, texture.height]
                );
            }
        }
    },

    // Set optional scale to use for texture coordinates (default is [0, 1])
    setTexcoordScale (style) {
        // Get sprite sub-area if necessary
        if (this.textures && style.sprite) {
            // Use default texture if available, otherwise texture must be specified
            var tex;
            if (this.textures.default) {
                tex = 'default';
            }
            else {
                tex = style.texture;
            }

            if (!tex) {
                log.error(`Style: in style '${this.name}', must specify texture to use for sprite '${style.sprite}', must be one of [${Object.keys(this.textures).join(', ')}]`);
            }
            else {
                // Lazily calculate sprite UVs the first time they are encountered
                if (!this.texture_sprites || !this.texture_sprites[tex]) {
                    this.calculateTextureSprites(tex);
                }
                this.texcoord_scale = this.texture_sprites[tex] && this.texture_sprites[tex][style.sprite];
            }
        }
    },


    /*** GL state and rendering ***/

    setGL (gl) {
        this.gl = gl;
        this.setupTextureUniforms();
        this.preloadTextures();
    },

    makeMesh (vertex_data, { uniforms } = {}) {
        return new VBOMesh(this.gl, vertex_data, this.vertex_layout, { uniforms });
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

        // Get any custom code transforms, uniform dependencies, etc.
        var transforms = (this.shaders && this.shaders.transforms);
        var uniforms = (this.shaders && this.shaders.uniforms);

        // Create shaders
        try {
            this.program = new ShaderProgram(
                this.gl,
                shaderSources[this.vertex_shader_key],
                shaderSources[this.fragment_shader_key],
                {
                    name: this.name,
                    defines,
                    uniforms,
                    transforms
                }
            );

            if (this.selection) {
                this.selection_program = new ShaderProgram(
                    this.gl,
                    shaderSources[this.vertex_shader_key],
                    shaderSources['gl/shaders/selection_fragment'],
                    {
                        name: (this.name + ' (selection)'),
                        defines: selection_defines,
                        uniforms,
                        transforms
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

    // Add a shader transform
    addShaderTransform (key, ...transforms) {
        this.shaders.transforms = this.shaders.transforms || {};
        this.shaders.transforms[key] = this.shaders.transforms[key] || [];
        this.shaders.transforms[key].push(...transforms);
    },

    /** TODO: could probably combine and generalize this with similar method in ShaderProgram
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
        var program = ShaderProgram.current;
        if (!program) {
            return;
        }

        program.setUniforms(this.shaders && this.shaders.uniforms, true); // reset texture unit to 0
    },

    update () {
        // Style-specific animation
        // if (typeof this.animation === 'function') {
        //     this.animation();
        // }
    }
};
