// Rendering styles

import StyleParser from './style_parser';
import FeatureSelection from '../selection';
import ShaderProgram from '../gl/shader_program';
import VBOMesh from '../gl/vbo_mesh';
import Texture from '../gl/texture';
import Material from '../material';
import Light from '../light';
import {RasterTileSource} from '../sources/raster';
import log from '../utils/log';
import mergeObjects from '../utils/merge';
import Thread from '../utils/thread';
import WorkerBroker from '../utils/worker_broker';
import debugSettings from '../utils/debug_settings';

let fs = require('fs');
const shaderSrc_selectionFragment = fs.readFileSync(__dirname + '/../gl/shaders/selection_fragment.glsl', 'utf8');
const shaderSrc_rasters = fs.readFileSync(__dirname + '/../gl/shaders/rasters.glsl', 'utf8');

// Base class

export var Style = {
    init ({ generation, styles, sources = {}, introspection } = {}) {
        this.setGeneration(generation);
        this.styles = styles;                       // styles for scene
        this.sources = sources;                     // data sources for scene
        this.defines = (this.hasOwnProperty('defines') && this.defines) || {}; // #defines to be injected into the shaders
        this.shaders = (this.hasOwnProperty('shaders') && this.shaders) || {}; // shader customization (uniforms, defines, blocks, etc.)
        this.introspection = introspection || false;
        this.selection = this.selection || this.introspection || false;   // flag indicating if this style supports feature selection
        this.compile_setup = false;                 // one-time setup steps for program compilation
        this.program = null;                        // GL program reference (for main render pass)
        this.selection_program = null;              // GL program reference for feature selection render pass
        this.feature_style = {};                    // style for feature currently being parsed, shared to lessen GC/memory thrash
        this.vertex_template = [];                  // shared single-vertex template, filled out by each style
        this.tile_data = {};

        // Default world coords to wrap every 100,000 meters, can turn off by setting this to 'false'
        this.defines.TANGRAM_WORLD_POSITION_WRAP = 100000;

        // Blending
        this.blend = this.blend || 'opaque';        // default: opaque styles are drawn first, without blending
        this.defines[`TANGRAM_BLEND_${this.blend.toUpperCase()}`] = true;
        if (this.blend_order == null) { // controls order of rendering for styles w/non-opaque blending
            this.blend_order = -1; // defaults to first
        }

        this.removeShaderBlock('setup'); // clear before material injection

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

        // Setup raster samplers if needed
        this.setupRasters();

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

        WorkerBroker.removeTarget(this.main_thread_target);
        this.gl = null;
        this.initialized = false;
    },

    reset () {
    },

    baseStyle () {
        return this.base || this.name;
    },

    setGeneration (generation) {
        // Scene generation id this style was created for
        this.generation = generation;

        // Provide a hook for this object to be called from worker threads
        this.main_thread_target = ['Style', this.name, this.generation].join('/');
        if (Thread.is_main) {
            WorkerBroker.addTarget(this.main_thread_target, this);
        }
    },

    fillVertexTemplate(vertex_layout, attribute, value, { size, offset }) {
        offset = (offset === undefined) ? 0 : offset;

        let index = vertex_layout.index[attribute];
        if (index === undefined) {
            log('warn', `Style: in style '${this.name}', no index found in vertex layout for attribute '${attribute}'`);
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
        this.tile_data[tile.id] = this.tile_data[tile.id] || {
            meshes: {},
            uniforms: {},
            textures: []
        };
    },

    // Finalizes an object holding feature data (for a tile or other object)
    endData (tile) {
        var tile_data = this.tile_data[tile.id];
        this.tile_data[tile.id] = null;

        if (tile_data && Object.keys(tile_data.meshes).length > 0) {
            for (let variant in tile_data.meshes) {
                let mesh = tile_data.meshes[variant];

                // Remove empty mesh variants
                if (mesh.vertex_data.vertex_count === 0) {
                    delete tile_data.meshes[variant];
                    continue;
                }

                // Only keep final byte buffer
                mesh.vertex_data.end();
                mesh.vertex_elements = mesh.vertex_data.element_buffer;
                mesh.vertex_data = mesh.vertex_data.vertex_buffer; // convert from instance to raw typed array
            }

            // Load raster tiles passed from data source
            // Blocks mesh completion to avoid flickering
            return this.buildRasterTextures(tile, tile_data).then(tile_data => tile_data);
        }
        else {
            return Promise.resolve(null); // don't send tile data back if doesn't have geometry
        }
    },

    // Has mesh data for a given tile?
    hasDataForTile (tile) {
        return this.tile_data[tile.id] != null;
    },

    getTileMesh (tile, variant) {
        let meshes = this.tile_data[tile.id].meshes;
        if (meshes[variant.key] == null) {
            meshes[variant.key] = {
                variant,
                vertex_data: this.vertexLayoutForMeshVariant(variant).createVertexData()
            };
        }
        return meshes[variant.key];
    },

    vertexLayoutForMeshVariant (variant) {
        return this.vertex_layout;
    },

    default_mesh_variant: { key: 0 },
    meshVariantTypeForDraw (draw) {
        return this.default_mesh_variant;
    },

    addFeature (feature, draw, context) {
        let tile = context.tile;
        if (tile.generation !== this.generation) {
            return;
        }

        if (!this.tile_data[tile.id]) {
            this.startData(tile);
        }

        let style = this.parseFeature(feature, draw, context);
        if (!style) {
            return; // skip feature
        }

        let mesh = this.getTileMesh(tile, this.meshVariantTypeForDraw(style));
        if (this.buildGeometry(feature.geometry, style, mesh, context) > 0) {
            feature.generation = this.generation; // track scene generation that feature was rendered for
        }
    },

    buildGeometry (geometry, style, mesh, context) {
        let geom_count;
        if (geometry.type === 'Polygon') {
            geom_count = this.buildPolygons([geometry.coordinates], style, mesh, context);
        }
        else if (geometry.type === 'MultiPolygon') {
            geom_count = this.buildPolygons(geometry.coordinates, style, mesh, context);
        }
        else if (geometry.type === 'LineString') {
            geom_count = this.buildLines([geometry.coordinates], style, mesh, context);
        }
        else if (geometry.type === 'MultiLineString') {
            geom_count = this.buildLines(geometry.coordinates, style, mesh, context);
        }
        else if (geometry.type === 'Point') {
            geom_count = this.buildPoints([geometry.coordinates], style, mesh, context);
        }
        else if (geometry.type === 'MultiPoint') {
            geom_count = this.buildPoints(geometry.coordinates, style, mesh, context);
        }

        // Optionally collect per-layer stats
        if (geom_count > 0 && debugSettings.layer_stats) {
            let tile = context.tile;
            tile.debug.layers = tile.debug.layers || { list: {}, tree: {} };
            let list = tile.debug.layers.list;
            let tree = tile.debug.layers.tree;
            let ftree = {}; // tree of layers for this feature
            context.layers.forEach(layer => {
                addLayerDebugEntry(list, layer, 1, geom_count, {[this.name]: geom_count}, {[this.baseStyle()]: geom_count});

                let node = tree;
                let fnode = ftree;
                let levels = layer.split(':');
                for (let i=0; i < levels.length; i++) {
                    let level = levels[i];
                    node[level] = node[level] || { features: 0, geoms: 0, styles: {}, base: {} };

                    if (fnode[level] == null) { // only count each layer level once per feature
                        fnode[level] = {};
                        addLayerDebugEntry(node, level, 1, geom_count, {[this.name]: geom_count}, {[this.baseStyle()]: geom_count});
                    }

                    if (i < levels.length - 1) {
                        node[level].layers = node[level].layers || {};
                    }
                    node = node[level].layers;
                    fnode = fnode[level];
                }
            });
        }

        return geom_count;
    },

    parseFeature (feature, draw, context) {
        try {
            var style = this.feature_style;

            // Calculate order
            style.order = this.parseOrder(draw.order, context);
            if (style.order == null && this.blend !== 'overlay') {
                let msg = `Layer '${draw.layers.join(', ')}', draw group '${draw.group}': `;
                msg += `'order' parameter is required unless blend mode is 'overlay'`;
                if (draw.order != null) {
                    msg += `; 'order' was set to a dynamic value (e.g. string tied to feature property, `;
                    msg += `or JS function), but evaluated to null for one or more features`;
                }
                log({ level: 'warn', once: true }, msg);
                return;
            }

            // Subclass implementation
            style = this._parseFeature(feature, draw, context);
            if (!style) {
                return; // skip feature
            }

            // Feature selection (only if feature is marked as interactive, and style supports it)
            if (this.selection) {
                style.interactive = StyleParser.evalProperty(draw.interactive, context);
            }
            else {
                style.interactive = false;
            }

            if (style.interactive === true) {
                style.selection_color = FeatureSelection.makeColor(feature, context.tile, context);
            }
            else {
                style.selection_color = FeatureSelection.defaultColor;
            }

            return style;
        }
        catch(error) {
            log('error', 'Style.parseFeature: style parsing error', feature, style, error.stack);
        }
    },

    _parseFeature (feature, draw, context) {
        return this.feature_style;
    },

    preprocess (draw) {
        // Preprocess first time
        if (!draw.preprocessed) {
            // Apply draw defaults
            if (this.draw) {
                // Merge each property separately to avoid modifying `draw` instance identity
                for (let param in this.draw) {
                    let val = this.draw[param];
                    if (typeof val === 'object' && !Array.isArray(val)) {  // nested param (e.g. `outline`)
                        draw[param] = mergeObjects({}, val, draw[param]);
                    }
                    else if (draw[param] == null) { // simple param (single scalar value or array)
                        draw[param] = val;
                    }
                }
            }

            if (!this.selection) {
                draw.interactive = false; // always disable feature selection for when style doesn't support it
            }
            else if (this.introspection) {
                draw.interactive = true;  // always enable feature selection for introspection
            }

            draw = this._preprocess(draw); // optional subclass implementation
            if (!draw) {
                return;
            }
            draw.preprocessed = true;
        }
        return draw;
    },

    // optionally implemented by subclass
    _preprocess (draw) {
        return draw;
    },

    // Parse an order value
    parseOrder (order, context) {
        // Calculate order if it was not cached
        if (typeof order !== 'number') {
            return StyleParser.calculateOrder(order, context);
        }
        return order;
    },

    // Expand final precision for half-layers (for outlines)
    scaleOrder (order) {
        return order * 2;
    },

    // Parse a color of choose a default if acceptable, return undefined if color missing
    parseColor(color, context) {
        // Need either a color, or a shader block for 'color' or 'filter'
        if (color) {
            return StyleParser.evalCachedColorProperty(color, context);
        }
        else if (this.shaders.blocks.color || this.shaders.blocks.filter) {
            return StyleParser.defaults.color;
        }
    },

    // Build functions are no-ops until overriden
    buildPolygons () { return 0; },
    buildLines () { return 0; },
    buildPoints () { return 0; },


    /*** GL state and rendering ***/

    setGL (gl) {
        this.gl = gl;
        this.max_texture_size = Texture.getMaxTextureSize(this.gl);
    },

    makeMesh (vertex_data, vertex_elements, options = {}) {
        let vertex_layout = this.vertexLayoutForMeshVariant(options.variant);
        return new VBOMesh(this.gl, vertex_data, vertex_elements, vertex_layout, options);
    },

    render (mesh) {
        return mesh.render();
    },

    // Get a specific program, compiling if necessary
    getProgram (key = 'program') {
        this.compileSetup();

        const program = this[key];
        if (!program || program.error) {
            return;
        }

        if (!program.compiled) {
            log('debug', `Compiling style '${this.name}', program key '${key}'`);
            try {
                program.compile();
            }
            catch(e) {
                log('error', `Style: error compiling program for style '${this.name}' (program key '${key}')`, this, e.stack);
            }
        }
        return program;
    },

    // One-time setup for compiling style's programs
    compileSetup () {
        if (this.compile_setup) {
            return;
        }

        if (!this.gl) {
            throw(new Error(`style.compile(): skipping for ${this.name} because no GL context`));
        }

        // Build defines & for selection (need to create a new object since the first is stored as a reference by the program)
        var defines = this.buildDefineList();
        if (this.selection) {
            var selection_defines = Object.assign({}, defines);
            selection_defines.TANGRAM_FEATURE_SELECTION = true;
        }

        // Shader blocks
        var blocks = (this.shaders && this.shaders.blocks);
        var block_scopes = (this.shaders && this.shaders.block_scopes);

        // Uniforms
        var uniforms = Object.assign({}, this.shaders && this.shaders.uniforms);
        for (let u in uniforms) { // validate uniforms
            if (uniforms[u] == null) {
                log({ level: 'warn', once: true }, `Style '${this.name}' has invalid uniform '${u}': uniform values must be non-null`);
            }
        }

        // Accept a single extension, or an array of extensions
        var extensions = (this.shaders && this.shaders.extensions);
        if (typeof extensions === 'string') {
            extensions = [extensions];
        }

        // Create shaders
        this.program = new ShaderProgram(
            this.gl,
            this.vertex_shader_src,
            this.fragment_shader_src,
            {
                name: this.name,
                defines,
                uniforms,
                blocks,
                block_scopes,
                extensions
            }
        );

        if (this.selection) {
            this.selection_program = new ShaderProgram(
                this.gl,
                this.vertex_shader_src,
                shaderSrc_selectionFragment,
                {
                    name: (this.name + ' (selection)'),
                    defines: selection_defines,
                    uniforms,
                    blocks,
                    block_scopes,
                    extensions
                }
            );
        }
        else {
            this.selection_program = null;
        }

        this.compile_setup = true;
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

    // Determines if 'raster' parameter is set to a valid value
    hasRasters () {
        return (['color', 'normal', 'custom'].indexOf(this.raster) > -1);
    },

    // Setup raster access in shaders
    setupRasters () {
        if (!this.hasRasters()) {
            return;
        }

        // Enable raster textures and configure how first raster is applied
        if (this.raster === 'color') {
            this.defines.TANGRAM_RASTER_TEXTURE_COLOR = true;
        }
        else if (this.raster === 'normal') {
            this.defines.TANGRAM_RASTER_TEXTURE_NORMAL = true;
        }
        // else custom raster (samplers will be made available but not automatically applied)

        // A given style may be built with multiple data sources, each of which may attach
        // a variable number of raster sources (0 to N, where N is the max number of raster sources
        // defined for the scene). This means we don't know *which* or *how many* rasters will be
        // bound now, at initial compile-time; we only know this at geometry build-time. To ensure
        // that we can bind as many raster sources as needed, we declare our uniform arrays to hold
        // the maximum number of possible sources. At render time, only the necessary number of rasters
        // are bound (the remaining slots aren't intended to be accessed).
        let num_raster_sources =
            Object.keys(this.sources)
            .filter(s => this.sources[s] instanceof RasterTileSource)
            .length;

        this.defines.TANGRAM_NUM_RASTER_SOURCES = `${num_raster_sources}`; // force to string to avoid auto-float conversion
        if (num_raster_sources > 0) {
            // Use model position of tile's coordinate zoom for raster tile texture UVs
            this.defines.TANGRAM_MODEL_POSITION_BASE_ZOOM_VARYING = true;

            // Uniforms and macros for raster samplers
            this.replaceShaderBlock('raster', shaderSrc_rasters, 'Raster');
        }
    },

    // Load raster tile textures and set uniforms
    buildRasterTextures (tile, tile_data) {
        if (!this.hasRasters()) {
            return Promise.resolve(tile_data);
        }

        let configs = {}; // texture configs to pass to texture builder, keyed by texture name
        let index = {};   // index into raster sampler array, keyed by texture name

        // TODO: data source could retrieve raster texture URLs
        tile.rasters.map(r => this.sources[r]).filter(x => x).forEach((source, i) => {
            if (source instanceof RasterTileSource) {
                let config = source.tileTexture(tile);
                configs[config.url] = config;
                index[config.url] = i;
            }
        });

        if (Object.keys(configs).length === 0) {
            return Promise.resolve(tile_data);
        }

        // Load textures on main thread and return when done
        // We want to block the building of a raster tile mesh until its texture is loaded,
        // to avoid flickering while loading (texture will render as black)
        return WorkerBroker.postMessage(this.main_thread_target+'.loadTextures', configs)
            .then(textures => {
                if (!textures || textures.length < 1) { // no textures found (unexpected)
                    // TODO: warning
                    return tile_data;
                }
                else if (textures.some(t => !t.loaded)) { // some textures failed, throw out style for this tile
                    return null;
                }

                // Set texture uniforms (returned after loading from main thread)
                tile_data.uniforms = tile_data.uniforms || {};
                tile_data.textures = tile_data.textures || [];

                let u_samplers = tile_data.uniforms['u_rasters'] = [];
                let u_sizes = tile_data.uniforms['u_raster_sizes'] = [];
                let u_offsets = tile_data.uniforms['u_raster_offsets'] = [];

                textures.forEach(t => {
                    let i = index[t.name];
                    let raster_coords = configs[t.name].coords; // tile coords of raster tile

                    u_samplers[i] = t.name;
                    tile_data.textures.push(t.name);

                    u_sizes[i] = [t.width, t.height];

                    // Tile geometry may be at a higher zoom than the raster tile texture,
                    // (e.g. an overzoomed raster tile), in which case we need to adjust the
                    // raster texture UVs to offset to the appropriate starting point for
                    // this geometry tile.
                    if (tile.coords.z > raster_coords.z) {
                        let dz = tile.coords.z - raster_coords.z; // # of levels raster source is overzoomed
                        let dz2 = Math.pow(2, dz);
                        u_offsets[i] = [
                            (((tile.coords.x % dz2) + dz2) % dz2) / dz2, // double-modulo to handle negative (wrapped) tile coords
                            (dz2 - 1 - (tile.coords.y % dz2)) / dz2, // GL texture coords are +Y up
                            1 / dz2
                        ];
                    }
                    else {
                        u_offsets[i] = [0, 0, 1];
                    }
                });

                return tile_data;
            }
        );
    },

    // Called on main thread
    loadTextures (textures) {
        // NB: only return name and size of textures loaded, because we can't send actual texture objects to worker
        return Texture.createFromObject(this.gl, textures)
            .then(() => {
                return Promise.all(Object.keys(textures).map(t => {
                    return Texture.textures[t] && Texture.textures[t].load();
                }).filter(x => x));
            })
            .then(textures => {
                textures.forEach(t => t.retain());
                return textures.map(t => ({ name: t.name, width: t.width, height: t.height, loaded: t.loaded }));
            });
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
        translucent: { depth_test: true, depth_write: true },
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
        translucent: 4,
        overlay: 5
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
    }

};

// add feature and geometry counts for a single layer
export function addLayerDebugEntry (target, layer, faeture_count, geom_count, styles, bases) {
    target[layer] = target[layer] || { features: 0, geoms: 0, styles: {}, base: {} };
    target[layer].features += faeture_count;    // feature count
    target[layer].geoms += geom_count;          // geometry count

    // geometry count by style
    for (let style in styles) {
        target[layer].styles[style] = target[layer].styles[style] || 0;
        target[layer].styles[style] += styles[style];
    }

    // geometry count by base style
    for (let style in bases) {
        target[layer].base[style] = target[layer].base[style] || 0;
        target[layer].base[style] += bases[style];
    }
}
