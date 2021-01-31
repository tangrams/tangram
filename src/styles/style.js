// Rendering styles

import StyleParser from './style_parser';
import FeatureSelection from '../selection/selection';
import gl from '../gl/constants'; // import GL constants since workers can't access GL context
import ShaderProgram from '../gl/shader_program';
import VBOMesh from '../gl/vbo_mesh';
import Texture from '../gl/texture';
import Material from '../lights/material';
import Light from '../lights/light';
import {RasterTileSource} from '../sources/raster';
import log from '../utils/log';
import mergeObjects from '../utils/merge';
import Thread from '../utils/thread';
import WorkerBroker from '../utils/worker_broker';
import makeWireframeForTriangleElementData from '../builders/wireframe';
import debugSettings from '../utils/debug_settings';

import selection_fragment_source from '../selection/selection_fragment.glsl';
import rasters_source from './raster/raster_globals.glsl';

// Base class

export var Style = {
    init ({ generation, styles, sources = {}, introspection } = {}) {
        this.setGeneration(generation);
        this.styles = styles;                       // styles for scene
        this.sources = sources;                     // data sources for scene
        this.defines = (Object.prototype.hasOwnProperty.call(this, 'defines') && this.defines) || {}; // #defines to be injected into the shaders
        this.shaders = (Object.prototype.hasOwnProperty.call(this, 'shaders') && this.shaders) || {}; // shader customization (uniforms, defines, blocks, etc.)
        this.introspection = introspection || false;
        this.selection = this.selection || this.introspection || false;   // flag indicating if this style supports feature selection
        this.compile_setup = false;                 // one-time setup steps for program compilation
        this.program = null;                        // GL program reference (for main render pass)
        this.selection_program = null;              // GL program reference for feature selection render pass
        this.feature_style = {};                    // style for feature currently being parsed, shared to lessen GC/memory thrash
        this.vertex_template = [];                  // shared single-vertex template, filled out by each style
        this.tile_data = {};
        this.stencil_proxy_tiles = true;            // applied to proxy tiles w/non-opaque blend mode to avoid compounding alpha

        this.variants = {}; // mesh variants by variant key
        this.vertex_layouts = {}; // vertex layouts by variant key

        // Default world coords to wrap every 100,000 meters, can turn off by setting this to 'false'
        this.defines.TANGRAM_WORLD_POSITION_WRAP = 100000;

        // Blending
        // `opaque` styles are drawn first/under other styles, without alpha blending
        this.blend = this.blend || 'opaque'; // default to opaque
        if (this.blend !== 'opaque') {
            // non-opaque styles can customize their blend order, which will determine which features
            // are drawn first/under each other
            if (this.blend_order == null) {
                this.blend_order = this.default_blend_orders[this.blend];
            }
        }
        else {
            // `opaque` ignores blend order, always render first/under
            this.blend_order = this.default_blend_orders[this.blend];
        }

        this.defines[`TANGRAM_BLEND_${this.blend.toUpperCase()}`] = true;

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

        // Setup shader definitions for custom attributes
        this.setupCustomAttributes();

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
        this.main_thread_target = ['Style', this.name, this.generation].join('_');
        if (Thread.is_main) {
            WorkerBroker.addTarget(this.main_thread_target, this);
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
    async endData (tile) {
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
            return this.buildRasterTextures(tile, tile_data);
        }
        else {
            return null; // don't send tile data back if doesn't have geometry
        }
    },

    // Has mesh data for a given tile?
    hasDataForTile (tile) {
        return this.tile_data[tile.id] != null;
    },

    getTileMesh (tile, variant) {
        const meshes = this.tile_data[tile.id].meshes;
        if (meshes[variant.key] == null) {
            const vertex_layout = this.vertexLayoutForMeshVariant(variant);
            meshes[variant.key] = {
                variant,
                vertex_data: vertex_layout.createVertexData()
            };
        }
        return meshes[variant.key];
    },

    vertexLayoutForMeshVariant (/*variant*/) {
        // styles must implement
    },

    meshVariantTypeForDraw (/*draw*/) {
        // styles must implement
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

        if (this.buildGeometry(feature.geometry, style, context) > 0) {
            feature.generation = this.generation; // track scene generation that feature was rendered for
        }
    },

    buildGeometry (geometry, style, context) {
        let geom_count;
        if (geometry.type === 'Polygon') {
            geom_count = this.buildPolygons([geometry.coordinates], style, context);
        }
        else if (geometry.type === 'MultiPolygon') {
            geom_count = this.buildPolygons(geometry.coordinates, style, context);
        }
        else if (geometry.type === 'LineString') {
            geom_count = this.buildLines([geometry.coordinates], style, context);
        }
        else if (geometry.type === 'MultiLineString') {
            geom_count = this.buildLines(geometry.coordinates, style, context);
        }
        else if (geometry.type === 'Point') {
            geom_count = this.buildPoints([geometry.coordinates], style, context);
        }
        else if (geometry.type === 'MultiPoint') {
            geom_count = this.buildPoints(geometry.coordinates, style, context);
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
                msg += '\'order\' parameter is required unless blend mode is \'overlay\'';
                if (draw.order != null) {
                    msg += '; \'order\' was set to a dynamic value (e.g. string tied to feature property, ';
                    msg += 'or JS function), but evaluated to null for one or more features';
                }
                log({ level: 'warn', once: true }, msg);
                return;
            }

            // Subclass implementation
            style = this._parseFeature(feature, draw, context);
            if (!style) {
                return; // skip feature
            }

            // Custom attributes
            if (this.shaders.attributes) {
                style.attributes = style.attributes || {};
                for (const aname in this.shaders.attributes) {
                    style.attributes[aname] = StyleParser.evalCachedProperty(
                        draw.attributes && draw.attributes[aname], context);
                    // set attribute value to zero for null/undefined/non-numeric values
                    if (typeof style.attributes[aname] !== 'number') {
                        style.attributes[aname] = 0;
                    }
                }
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
        catch (error) {
            log('error', 'Style.parseFeature: style parsing error', feature, style, error.stack);
        }
    },

    _parseFeature (/*feature, draw, context*/) {
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

            // Custom attributes
            if (this.shaders.attributes) {
                draw.attributes = draw.attributes || {};
                for (const aname in this.shaders.attributes) {
                    draw.attributes[aname] = StyleParser.createPropertyCache(
                        draw.attributes[aname] != null ? draw.attributes[aname] : 0);
                }
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

        if (debugSettings.wireframe) {
            // In wireframe debug mode, transform mesh into lines
            vertex_elements = makeWireframeForTriangleElementData(vertex_elements);
            return new VBOMesh(this.gl, vertex_data, vertex_elements, vertex_layout,
                { ...options, draw_mode: this.gl.LINES });
        }

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
            catch (e) {
                log('error', `Style: error compiling program for style '${this.name}' (program key '${key}')`,
                    this, e.stack, e.type, e.shader_errors);
                throw e; // re-throw so users can be notified via event subscriptions
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
                selection_fragment_source,
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

        if (this.shaders.block_scopes) {
            this.shaders.block_scopes[key] = null;
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
            // Track how many raster sources have alpha masking (used for handling transparency outside raster image)
            const num_masked_rasters = Object.keys(this.sources)
                .filter(s => this.sources[s].mask_alpha)
                .length;
            this.defines.TANGRAM_HAS_MASKED_RASTERS = (num_masked_rasters > 0);
            this.defines.TANGRAM_ALL_MASKED_RASTERS = (num_masked_rasters === num_raster_sources);

            // Use model position of tile's coordinate zoom for raster tile texture UVs
            this.defines.TANGRAM_MODEL_POSITION_BASE_ZOOM_VARYING = true;

            // Uniforms and samplers
            this.replaceShaderBlock('raster', rasters_source, 'Raster');
        }
    },

    // Load raster tile textures and set uniforms
    async buildRasterTextures (tile, tile_data) {
        // skip if style doesn't support rasters
        if (!this.hasRasters()) {
            return tile_data;
        }

        // skip if source didn't attach any rasters to tile
        if (tile.rasters.length === 0) {
            return tile_data;
        }

        // Load textures on main thread and return when done
        // We want to block the building of a raster tile mesh until its texture is loaded,
        // to avoid flickering while loading (texture will render as black)
        let textures;
        try {
            textures = await WorkerBroker.postMessage(
                `${this.main_thread_target}.loadTextures`,
                { coords: tile.coords, source: tile.source, rasters: tile.rasters, min: tile.min, max: tile.max }
            );
        }
        catch (e) { // error thrown if style has been removed from main thread
            return tile_data;
        }

        if (!textures || textures.length < 1) { // no textures found (unexpected)
            // TODO: warning
            return tile_data;
        }
        else if (textures.some(t => !t.loaded)) { // some textures failed, throw out style for this tile
            return null;
        }

        // Enable alpha masking if needed (for transparency outside raster image, on first raster only)
        tile_data.uniforms['u_raster_mask_alpha'] = (this.sources[tile.rasters[0]].mask_alpha === true);

        // Set texture uniforms (returned after loading from main thread)
        const u_samplers = tile_data.uniforms['u_rasters'] = [];
        const u_sizes = tile_data.uniforms['u_raster_sizes'] = [];
        const u_offsets = tile_data.uniforms['u_raster_offsets'] = [];

        textures.forEach(t => {
            const i = t.index;
            u_samplers[i] = t.name;
            tile_data.textures.push(t.name);

            u_sizes[i] = [t.width, t.height];

            // Tile geometry may be at a higher zoom than the raster tile texture,
            // (e.g. an overzoomed raster tile), in which case we need to adjust the
            // raster texture UVs to offset to the appropriate starting point for
            // this geometry tile.
            if (tile.coords.z > t.coords.z) {
                let dz = tile.coords.z - t.coords.z; // # of levels raster source is overzoomed
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
    },

    // Determine which raster tile textures need to load for this tile, load them and return metadata to worker
    // Called on main thread
    async loadTextures (tile) {
        let configs = {}; // texture configs to pass to texture builder, keyed by texture name
        let index = {};   // index into raster sampler array, keyed by texture name
        let queue = [];

        // Find raster textures that need to be loaded
        tile.rasters.map(r => this.sources[r]).filter(x => x).forEach((source, i) => {
            if (source instanceof RasterTileSource) {
                queue.push(source.tileTexture(tile, this).then(config => {
                    configs[config.name] = config;
                    index[config.name] = i;
                }));
            }
        });
        await Promise.all(queue);

        // Create and load raster textures
        await Texture.createFromObject(this.gl, configs);
        let textures = await Promise.all(Object.keys(configs)
            .map(t => Texture.textures[t] && Texture.textures[t].load())
            .filter(x => x)
        );
        textures.forEach(t => t.retain());

        // Take a subset of texture metadata, and decorate with raster-specific info
        // NB: only return name and size of textures loaded, because we can't send actual texture objects to worker
        return textures.map(t => ({
            name: t.name,
            width: t.width,
            height: t.height,
            loaded: t.loaded,
            index: index[t.name],          // raster sampler index
            coords: configs[t.name].coords // tile coords of raster tile
        }));
    },

    // Setup shader definitions for custom attributes
    setupCustomAttributes() {
        if (this.shaders.attributes) {
            for (const [aname, attrib] of Object.entries(this.shaders.attributes)) {
                // alias each custom attribute to the internal attribute name in vertex shader,
                // and internal varying name in fragment shader (if varying is enabled)
                if (attrib.type === 'float') {
                    if (attrib.varying !== false) {
                        this.addShaderBlock('attributes', `
                            #ifdef TANGRAM_VERTEX_SHADER
                                attribute float a_${aname};
                                varying float v_${aname};
                                #define ${aname} a_${aname}
                            #else
                                varying float v_${aname};
                                #define ${aname} v_${aname}
                            #endif
                        `);
                        this.addShaderBlock('setup', `#ifdef TANGRAM_VERTEX_SHADER\nv_${aname} = a_${aname};\n#endif`);
                    }
                    else {
                        this.addShaderBlock('attributes', `
                            #ifdef TANGRAM_VERTEX_SHADER
                                attribute float a_${aname};
                                #define ${aname} a_${aname}
                            #endif
                        `);
                    }
                }
            }
        }
    },

    // Add custom attributes to a list of attributes for initializing a vertex layout
    addCustomAttributesToAttributeList(attribs) {
        if (this.shaders.attributes) {
            for (const [aname, attrib] of Object.entries(this.shaders.attributes)) {
                if (attrib.type === 'float') {
                    attribs.push({ name: `a_${aname}`, size: 1, type: gl.FLOAT, normalized: false });
                }
            }
        }
        return attribs;
    },

    // Add current feature values for custom attributes to vertex template
    addCustomAttributesToVertexTemplate(draw, index) {
        if (this.shaders.attributes) {
            for (let aname in this.shaders.attributes) {
                this.vertex_template[index++] = draw.attributes[aname] != null ? draw.attributes[aname] : 0;
            }
        }
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

        program.setUniforms(this.shaders?.uniforms, true); // reset texture unit to 0
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
        opaque: Number.MIN_SAFE_INTEGER,
        add: 1,
        multiply: 2,
        inlay: 3,
        translucent: 4,
        overlay: 5
    },

    getBlendOrderForDraw (draw) {
        // Allow draw block to override blend_order for non-opaque blend styles
        return ((this.blend !== 'opaque' && draw.blend_order != null) ? draw.blend_order : this.blend_order);
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
