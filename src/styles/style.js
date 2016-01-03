// Rendering styles

import {StyleParser} from './style_parser';
import FeatureSelection from '../selection';
import ShaderProgram from '../gl/shader_program';
import VBOMesh from '../gl/vbo_mesh';
import Material from '../material';
import Light from '../light';
import {MethodNotImplemented} from '../utils/errors';
import shaderSources from '../gl/shader_sources'; // built-in shaders

import log from 'loglevel';

// Base class

export var Style = {
    init ({ generation } = {}) {
        if (!this.isBuiltIn()) {
            this.built_in = false; // explicitly set to false to avoid any confusion
        }

        this.generation = generation;               // scene generation id this style was created for
        this.defines = (this.hasOwnProperty('defines') && this.defines) || {}; // #defines to be injected into the shaders
        this.shaders = (this.hasOwnProperty('shaders') && this.shaders) || {}; // shader customization (uniforms, defines, blocks, etc.)
        this.selection = this.selection || false;   // flag indicating if this style supports feature selection
        this.compiling = false;                     // programs are currently compiling
        this.compiled = false;                      // programs are finished compiling
        this.program = null;                        // GL program reference (for main render pass)
        this.selection_program = null;              // GL program reference for feature selection render pass
        this.feature_style = {};                    // style for feature currently being parsed, shared to lessen GC/memory thrash
        this.vertex_template = [];                  // shared single-vertex template, filled out by each style
        this.tile_data = {};
        this.feature_options = {};

        // Default world coords to wrap every 100,000 meters, can turn off by setting this to 'false'
        this.defines.TANGRAM_WORLD_POSITION_WRAP = 100000;

        // Blending
        this.blend = this.blend || 'opaque';        // default: opaque styles are drawn first, without blending
        this.defines[`TANGRAM_BLEND_${this.blend.toUpperCase()}`] = true;
        if (this.blend_order == null) { // controls order of rendering for styles w/non-opaque blending
            this.blend_order = -1; // defaults to first
        }

        // If the style defines its own material, replace the inherited material instance
        if (!(this.material instanceof Material)) {
            if (!Material.isValid(this.material)) {
                this.material = StyleParser.defaults.material;
            }
            this.material = new Material(this.material);
        }
        this.material.inject(this);

        // Set lighting mode: fragment, vertex, or none (specified as 'false')
        Light.setMode(this.lighting, this);

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

    reset () {
    },

    isBuiltIn () {
        return this.hasOwnProperty('built_in') && this.built_in;
    },

    fillVertexTemplate(attribute, value, { size, offset }) {
        offset = (offset === undefined) ? 0 : offset;

        let index = this.vertex_layout.index[attribute];
        if (index === undefined) {
            log.warn(`Style: in style '${this.name}', no index found in vertex layout for attribute '${attribute}'`);
            return;
        }

        for (let i = 0; i < size; ++i) {
            let v = value.length > i ? value[i] : value;
            this.vertex_template[index + i + offset] = v;
        }
    },

    /*** Style parsing and geometry construction ***/

    // Returns an object to hold feature data (for a tile or other object)
    startData (tile) {
        this.tile_data[tile] = {
            vertex_data: null,
            uniforms: null
        };
        return this.tile_data[tile];
    },

    // Finalizes an object holding feature data (for a tile or other object)
    endData (tile) {
        var tile_data = this.tile_data[tile];
        if (tile_data && tile_data.vertex_data) {
            // Only keep final byte buffer
            tile_data.vertex_data.end();
            tile_data.vertex_data = tile_data.vertex_data.buffer;
        }
        this.tile_data[tile] = null;
        return Promise.resolve(tile_data);
    },

    // Has mesh data for a given tile?
    hasDataForTile (tile) {
        return this.tile_data[tile] != null;
    },

    addFeature (feature, rule, context) {
        let tile = context.tile;
        if (tile.generation !== this.generation) {
            return;
        }

        if (!this.tile_data[tile.key]) {
            this.startData(tile.key);
        }

        let style = this.parseFeature.apply(this, arguments); // allow subclasses to pass extra args

        // Skip feature?
        if (!style) {
            return;
        }

        // First feature in this render style?
        if (!this.tile_data[tile.key].vertex_data) {
            this.tile_data[tile.key].vertex_data = this.vertex_layout.createVertexData();
        }

        this.buildGeometry(feature.geometry, style, this.tile_data[tile.key].vertex_data, context);
    },

    buildGeometry (geometry, style, vertex_data, context) {
        if (geometry.type === 'Polygon') {
            this.buildPolygons([geometry.coordinates], style, vertex_data, context);
        }
        else if (geometry.type === 'MultiPolygon') {
            this.buildPolygons(geometry.coordinates, style, vertex_data, context);
        }
        else if (geometry.type === 'LineString') {
            this.buildLines([geometry.coordinates], style, vertex_data, context);
        }
        else if (geometry.type === 'MultiLineString') {
            this.buildLines(geometry.coordinates, style, vertex_data, context);
        }
        else if (geometry.type === 'Point') {
            this.buildPoints([geometry.coordinates], style, vertex_data, context);
        }
        else if (geometry.type === 'MultiPoint') {
            this.buildPoints(geometry.coordinates, style, vertex_data, context);
        }
    },

    parseFeature (feature, rule_style, context) {
        try {
            var style = this.feature_style;

            rule_style = this.preprocess(rule_style);
            if (!rule_style) {
                return;
            }

            // Calculate order if it was not cached
            style.order = this.parseOrder(rule_style.order, context);

            // Feature selection (only if style supports it)
            var selectable = false;
            style.interactive = rule_style.interactive;
            if (this.selection) {
                selectable = StyleParser.evalProp(style.interactive, context);
            }

            // If feature is marked as selectable
            if (selectable) {
                style.selection_color = FeatureSelection.makeColor(feature, context.tile);
            }
            else {
                style.selection_color = FeatureSelection.defaultColor;
            }

            // Subclass implementation
            style = this._parseFeature.apply(this, arguments); // allow subclasses to pass extra args

            return style;
        }
        catch(error) {
            log.error('Style.parseFeature: style parsing error', feature, style, error);
        }
    },

    _parseFeature (feature, rule_style, context) {
        throw new MethodNotImplemented('_parseFeature');
    },

    preprocess (rule_style) {
        // Preprocess first time
        if (!rule_style.preprocessed) {
            rule_style = this._preprocess(rule_style); // optional subclass implementation
            if (!rule_style) {
                return;
            }
            rule_style.preprocessed = true;
        }
        return rule_style;
    },

    // optionally implemented by subclass
    _preprocess (rule_style) {
        return rule_style;
    },

    // Parse an order value
    parseOrder (order, context) {
        // Calculate order if it was not cached
        if (typeof order !== 'number') {
            return StyleParser.calculateOrder(order, context);
        }
        return order;
    },

    // Parse a color of choose a default if acceptable, return undefined if color missing
    parseColor(color, context) {
        // Need either a color, or a shader block for 'color' or 'filter'
        if (color) {
            return StyleParser.cacheColor(color, context);
        }
        else if (this.shaders.blocks.color || this.shaders.blocks.filter) {
            return StyleParser.defaults.color;
        }
    },

    // Build functions are no-ops until overriden
    buildPolygons () {},
    buildLines () {},
    buildPoints () {},


    /*** GL state and rendering ***/

    setGL (gl) {
        this.gl = gl;
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
            selection_defines.TANGRAM_FEATURE_SELECTION = true;
        }

        // Get any custom code blocks, uniform dependencies, etc.
        var blocks = (this.shaders && this.shaders.blocks);
        var block_scopes = (this.shaders && this.shaders.block_scopes);
        var uniforms = (this.shaders && this.shaders.uniforms);

        // accept a single extension, or an array of extensions
        var extensions = (this.shaders && this.shaders.extensions);
        if (typeof extensions === 'string') {
            extensions = [extensions];
        }

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
                    blocks,
                    block_scopes,
                    extensions
                }
            );
            this.program.compile();

            if (this.selection) {
                this.selection_program = new ShaderProgram(
                    this.gl,
                    shaderSources[this.vertex_shader_key],
                    shaderSources['gl/shaders/selection_fragment'],
                    {
                        name: (this.name + ' (selection)'),
                        defines: selection_defines,
                        uniforms,
                        blocks,
                        block_scopes,
                        extensions
                    }
                );
                this.selection_program.compile();
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

    // Add a shader block
    addShaderBlock (key, block, scope = null) {
        this.shaders.blocks = this.shaders.blocks || {};
        this.shaders.blocks[key] = this.shaders.blocks[key] || [];
        this.shaders.blocks[key].push(block);

        this.shaders.block_scopes = this.shaders.block_scopes || {};
        this.shaders.block_scopes[key] = this.shaders.block_scopes[key] || [];
        this.shaders.block_scopes[key].push(scope);
    },

    // Remove all shader blocks for key
    removeShaderBlock (key) {
        if (this.shaders.blocks) {
            this.shaders.blocks[key] = null;
        }
    },

    replaceShaderBlock (key, block, scope = null) {
        this.removeShaderBlock(key);
        this.addShaderBlock(key, block, scope);
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
        this.material.setupProgram(ShaderProgram.current);
    },

    // Set style uniforms on currently bound program
    setUniforms () {
        var program = ShaderProgram.current;
        if (!program) {
            return;
        }

        program.setUniforms(this.shaders && this.shaders.uniforms, true); // reset texture unit to 0
    },

    // Render state settings by blend mode
    render_states: {
        opaque: { depth_test: true, depth_write: true },
        add: { depth_test: true, depth_write: false },
        multiply: { depth_test: true, depth_write: false },
        inlay: { depth_test: true, depth_write: false },
        overlay: { depth_test: false, depth_write: false }
    },

    // Default sort order for blend modes
    default_blend_orders: {
        opaque: 0,
        add: 1,
        multiply: 2,
        inlay: 3,
        overlay: 4
    },

    // Comparison function for sorting styles by blend
    blendOrderSort (a, b) {
        // opaque always comes first
        if (a.blend === 'opaque' || b.blend === 'opaque') {
            if (a.blend === 'opaque' && b.blend === 'opaque') { // if both are opaque
                return a.name < b.name ? -1 : 1; // use name as tie breaker
            }
            else if (a.blend === 'opaque') {
                return -1; // only `a` was opaque
            }
            else {
                return 1; // only `b` was opaque
            }
        }

        // use explicit blend order if possible
        if (a.blend_order < b.blend_order) {
            return -1;
        }
        else if (a.blend_order > b.blend_order) {
            return 1;
        }

        // if blend orders are equal, use default order by blend mode
        if (Style.default_blend_orders[a.blend] < Style.default_blend_orders[b.blend]) {
            return -1;
        }
        else if (Style.default_blend_orders[a.blend] > Style.default_blend_orders[b.blend]) {
            return 1;
        }

        return a.name < b.name ? -1 : 1; // use name as tie breaker
    },

    update () {
        // Style-specific animation
        // if (typeof this.animation === 'function') {
        //     this.animation();
        // }
    }

};
