import log from '../utils/log';
import Utils from '../utils/utils';
import debugSettings from '../utils/debug_settings';
import * as URLs from '../utils/urls';
import WorkerBroker from '../utils/worker_broker';
import Task from '../utils/task';
import subscribeMixin from '../utils/subscribe';
import sliceObject from '../utils/slice';
import Context from '../gl/context';
import Texture from '../gl/texture';
import ShaderProgram from '../gl/shader_program';
import VertexArrayObject from '../gl/vao';
import {StyleManager} from '../styles/style_manager';
import {Style} from '../styles/style';
import StyleParser from '../styles/style_parser';
import SceneLoader from './scene_loader';
import View from './view';
import Light from '../lights/light';
import TileManager from '../tile/tile_manager';
import DataSource from '../sources/data_source';
import '../sources/sources';
import FeatureSelection from '../selection/selection';
import RenderStateManager from '../gl/render_state';
import TextCanvas from '../styles/text/text_canvas';
import FontManager from '../styles/text/font_manager';
import MediaCapture from '../utils/media_capture';
import setupSceneDebug from './scene_debug';

// Load scene definition: pass an object directly, or a URL as string to load remotely
export default class Scene {

    constructor(config_source, options) {
        options = options || {};
        subscribeMixin(this);

        this.id = Scene.id++;
        this.initialized = false;
        this.initializing = null; // will be a promise that resolves when scene is loaded
        this.sources = {};

        this.view = new View(this, options);
        this.tile_manager = new TileManager({ scene: this });
        this.num_workers = options.numWorkers || 2;
        if (options.disableVertexArrayObjects === true) {
            VertexArrayObject.disabled = true;
        }

        Utils.use_high_density_display = options.highDensityDisplay !== undefined ? options.highDensityDisplay : true;
        Utils.updateDevicePixelRatio();

        this.config = null;
        this.config_source = config_source;
        this.config_bundle = null;
        this.last_valid_config_source = null;

        this.styles = null;
        this.style_manager = new StyleManager();

        this.building = null;                           // tracks current scene building state (tiles being built, etc.)
        this.dirty = true;                              // request a redraw

        if (options.preUpdate){
            // optional pre-render loop hook
            this.subscribe({'pre_update': options.preUpdate});
        }

        if (options.postUpdate){
            // optional post-render loop hook
            this.subscribe({'post_update': options.postUpdate});
        }

        this.render_loop = !options.disableRenderLoop;  // disable render loop - app will have to manually call Scene.render() per frame
        this.render_loop_active = false;
        this.render_loop_stop = false;
        this.render_count = 0;
        this.last_render_count = 0;
        this.render_count_changed = false;
        this.frame = 0;
        this.last_main_render = -1;         // frame counter for last main render pass
        this.last_selection_render = -1;    // frame counter for last selection render pass
        this.media_capture = new MediaCapture();
        this.selection = null;
        this.selection_feature_count = 0;
        this.fetching_selection_map = null;
        this.prev_textures = null; // textures from previously loaded scene (used for cleanup)
        this.introspection = (options.introspection === true) ? true : false;
        this.times = {}; // internal time logs (mostly for dev/profiling)
        this.resetTime();

        this.container = options.container;
        this.canvas = null;
        this.contextOptions = options.webGLContextOptions;

        this.lights = null;
        this.background = null;

        this.createListeners();
        this.updating = 0;
        this.generation = Scene.generation; // an id that is incremented each time the scene config is invalidated
        this.last_complete_generation = Scene.generation; // last generation id with a complete view
        setupSceneDebug(this);

        this.log_level = options.logLevel || 'warn';
        log.setLevel(this.log_level);
        log.reset();
    }

    static create (config, options = {}) {
        return new Scene(config, options);
    }

    // Load scene (or reload existing scene if no new source specified)
    // Options:
    //   `base_path`: base URL against which scene resources should be resolved (useful for Play) (default nulll)
    //   `blocking`: should rendering block on scene load completion (default true)
    load (config_source = null, options = {}) {
        if (this.initializing) {
            return this.initializing;
        }
        log.reset();

        this.updating++;
        this.initialized = false;
        this.view_complete = false; // track if a view complete event has been triggered yet
        this.times.frame = null; // clear first frame time
        this.times.build = null; // clear first scene build time

        // Backwards compatibilty for passing `base_path` string as second argument
        // (since transitioned to using options argument to accept more parameters)
        options = (typeof options === 'string') ? { base_path: options } : options;

        // Should rendering block on load (not desirable for initial load, often desired for live style-switching)
        options.blocking = (options.blocking !== undefined) ? options.blocking : true;

        if (this.render_loop !== false) {
            this.setupRenderLoop();
        }

        // Load scene definition (sources, styles, etc.), then create styles & workers
        this.createCanvas();
        this.prev_textures = this.config && Object.keys(this.config.textures); // save textures from last scene
        this.initializing = this.loadScene(config_source, options)
            .then(async ({ texture_nodes }) => {
                await this.createWorkers();

                // Clean up resources from prior scene
                this.destroyFeatureSelection();
                WorkerBroker.postMessage(this.workers, 'self.clearFunctionStringCache');

                // Scene loaded from a JS object, or modified by a `load` event, may contain compiled JS functions
                // which need to be serialized, while one loaded only from a URL does not.
                const serialize_funcs = ((typeof this.config_source === 'object') || this.hasSubscribersFor('load'));

                const updating = this.updateConfig({
                    texture_nodes,
                    serialize_funcs,
                    normalize: false,
                    loading: true,
                    fade_in: true });

                if (options.blocking === true) {
                    await updating;
                }

                this.freePreviousTextures();
                this.updating--;
                this.initializing = null;
                this.initialized = true;
                this.last_valid_config_source = this.config_source;
                this.last_valid_options = { base_path: options.base_path, file_type: options.file_type };

                this.requestRedraw();
            }).catch(error => {
                this.initializing = null;
                this.updating = 0;

                // Report and revert to last valid config if available
                let type, message;
                if (error.name === 'YAMLException') {
                    type = 'yaml';
                    message = 'Error parsing scene YAML';
                }
                else {
                // TODO: more error types
                    message = 'Error initializing scene';
                }
                this.trigger('error', { type, message, error, url: this.config_source });

                message = `Scene.load() failed to load ${JSON.stringify(this.config_source)}: ${error.message}`;
                if (this.last_valid_config_source) {
                    log('warn', message, error);
                    log('info', 'Scene.load() reverting to last valid configuration');
                    return this.load(this.last_valid_config_source, this.last_valid_base_path);
                }
                log('error', message, error);
                throw error;
            });

        return this.initializing;
    }

    destroy() {
        this.initialized = false;
        this.render_loop_stop = true; // schedule render loop to stop

        this.destroyListeners();
        this.destroyFeatureSelection();

        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            this.canvas = null;
        }
        this.container = null;

        if (this.gl) {
            Texture.destroy(this.gl);
            this.style_manager.destroy(this.gl);
            this.styles = {};

            ShaderProgram.reset();

            // Force context loss
            let ext = this.gl.getExtension('WEBGL_lose_context');
            if (ext) {
                ext.loseContext();
            }

            this.gl = null;
        }

        this.sources = {};

        this.destroyWorkers();
        this.tile_manager.destroy();
        this.tile_manager = null;
        log.reset();
    }

    createCanvas() {
        if (this.canvas) {
            return;
        }

        this.container = this.container || document.body;
        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = 0;
        this.canvas.style.left = 0;

        // Force tangram canvas underneath all leaflet layers, and set background to transparent
        this.container.style.backgroundColor = 'transparent';
        this.container.appendChild(this.canvas);

        try {
            this.gl = Context.getContext(this.canvas, Object.assign({
                alpha: true, premultipliedAlpha: true,
                stencil: true,
                device_pixel_ratio: Utils.device_pixel_ratio,
                powerPreference: 'high-performance'
            }, this.contextOptions));
        }
        catch(e) {
            throw new Error(
                'Couldn\'t create WebGL context. ' +
                'Your browser may not support WebGL, or it\'s turned off? ' +
                'Visit http://webglreport.com/ for more info.'
            );
        }

        this.resizeMap(this.container.clientWidth, this.container.clientHeight);
        VertexArrayObject.init(this.gl);
        this.render_states = new RenderStateManager(this.gl);
        this.media_capture.setCanvas(this.canvas, this.gl);
    }

    // Update list of any custom scripts (either at scene-level or data-source-level)
    updateExternalScripts () {
        let prev_scripts = [...(this.external_scripts||[])]; // save list of previously loaded scripts
        let scripts = [];

        // scene-level scripts
        if (this.config.scene.scripts) {
            for (let f in this.config.scene.scripts) {
                if (scripts.indexOf(this.config.scene.scripts[f]) === -1) {
                    scripts.push(this.config.scene.scripts[f]);
                }
            }
        }

        // data-source-level scripts
        for (let s in this.config.sources) {
            let source = this.config.sources[s];
            if (source.scripts) {
                for (let f in source.scripts) {
                    if (scripts.indexOf(source.scripts[f]) === -1) {
                        scripts.push(source.scripts[f]);
                    }
                }
            }
        }

        this.external_scripts = scripts;

        // Scripts changed?
        return !(this.external_scripts.length === prev_scripts.length &&
            this.external_scripts.every((v, i) => v === prev_scripts[i]));
    }

    // Web workers handle heavy duty tile construction: networking, geometry processing, etc.
    createWorkers() {
        // Reset old workers (if any) if we need to re-instantiate with new external scripts
        if (this.updateExternalScripts()) {
            this.destroyWorkers();
        }

        if (!this.workers) {
            return this.makeWorkers();
        }
        return Promise.resolve();
    }

    // Instantiate workers from URL, init event handlers
    makeWorkers() {
        // Let VertexElements know if 32 bit indices for element arrays are available
        let has_element_index_uint = this.gl.getExtension('OES_element_index_uint') ? true : false;

        let queue = [];
        this.workers = [];
        for (let id=0; id < this.num_workers; id++) {
            let worker = new Worker(Tangram.workerURL); // eslint-disable-line no-undef
            this.workers[id] = worker;

            WorkerBroker.addWorker(worker);

            log('debug', `Scene.makeWorkers: initializing worker ${id}`);
            let _id = id;
            queue.push(WorkerBroker.postMessage(worker, 'self.init', this.id, id, this.num_workers, this.log_level, Utils.device_pixel_ratio, has_element_index_uint, this.external_scripts).then(
                (id) => {
                    log('debug', `Scene.makeWorkers: initialized worker ${id}`);
                    return id;
                },
                (error) => {
                    log('error', `Scene.makeWorkers: failed to initialize worker ${_id}:`, error);
                    return Promise.reject(error);
                })
            );
        }

        this.next_worker = 0;
        return Promise.all(queue).then(() => {
            log.setWorkers(this.workers);
        });
    }

    destroyWorkers() {
        this.selection = null; // selection needs to be re-initialized when workers are
        if (Array.isArray(this.workers)) {
            log.setWorkers(null);
            this.workers.forEach((worker) => {
                worker.terminate();
            });
            this.workers = null;
        }
    }

    // Scene is ready for rendering
    ready() {
        if (!this.view.ready() || Object.keys(this.sources).length === 0) {
            return false;
        }
        return true;
    }

    // Resize the map when device pixel ratio changes, e.g. when switching between displays
    updateDevicePixelRatio () {
        if (Utils.updateDevicePixelRatio()) {
            WorkerBroker.postMessage(this.workers, 'self.updateDevicePixelRatio', Utils.device_pixel_ratio)
                .then(() => this.rebuild())
                .then(() => this.resizeMap(this.view.size.css.width, this.view.size.css.height));
        }
    }

    resizeMap(width, height) {
        if (width === 0 && height === 0) {
            return;
        }

        this.dirty = true;
        this.view.setViewportSize(width, height);
        if (this.gl) {
            Context.resize(this.gl, width, height, Utils.device_pixel_ratio);
        }
    }

    // Request scene be redrawn at next animation loop
    requestRedraw() {
        this.dirty = true;
    }

    // Redraw scene immediately - don't wait for animation loop
    // Use sparingly, but for cases where you need the closest possible sync with other UI elements,
    // such as other, non-WebGL map layers (e.g. Leaflet raster layers, markers, etc.)
    immediateRedraw() {
        this.dirty = true;
        this.update();
    }

    renderLoop () {
        this.render_loop_active = true; // only let the render loop instantiate once

        // Update and render the scene
        this.update();

        // Pending background tasks
        Task.setState({ user_moving_view: this.view.user_input_active });
        Task.processAll();

        // Request the next frame if not scheduled to stop
        if (!this.render_loop_stop) {
            window.requestAnimationFrame(this.renderLoop.bind(this));
        }
        else {
            this.render_loop_stop = false;
            this.render_loop_active = false;
        }
    }

    // Setup the render loop
    setupRenderLoop() {
        if (!this.render_loop_active) {
            setTimeout(() => { this.renderLoop(); }, 0); // delay start by one tick
        }
    }

    update() {
        // Determine which passes (if any) to render
        let main = this.dirty;
        let selection = this.selection ? this.selection.hasPendingRequests() : false;
        var will_render = !(
            (main === false && selection === false) ||
            this.initialized === false ||
            this.updating > 0 ||
            this.ready() === false
        );

        // Pre-render loop hook
        this.trigger('pre_update', will_render);

        // Update view (needs to update user input timer even if no render will occur)
        this.view.update();

        // Bail if no need to render
        if (!will_render) {
            return false;
        }
        this.dirty = false; // subclasses can set this back to true when animation is needed

        // Render the scene
        this.updateDevicePixelRatio();
        this.render({ main, selection });
        this.updateViewComplete(); // fires event when rendered tile set or style changes
        this.media_capture.completeScreenshot(); // completes screenshot capture if requested

        // Post-render loop hook
        this.trigger('post_update', will_render);

        // Redraw every frame if animating
        if (this.animated === true || this.view.isAnimating()) {
            this.dirty = true;
        }

        this.frame++;
        log('trace', 'Scene.render()');
        return true;
    }

    // Accepts flags indicating which render passes should be made
    render({ main, selection }) {
        var gl = this.gl;

        this.updateBackground();
        Object.keys(this.lights).forEach(i => this.lights[i].update());

        // Render main pass
        this.render_count_changed = false;
        if (main) {
            this.render_count = this.renderPass();
            this.last_main_render = this.frame;

            // Update feature selection map if necessary
            if (this.render_count !== this.last_render_count) {
                this.render_count_changed = true;
                this.logFirstFrame();

                this.getFeatureSelectionMapSize().then(size => {
                    this.selection_feature_count = size;
                    log('info', `Scene: rendered ${this.render_count} primitives (${size} features in selection map)`);
                });
            }
            this.last_render_count = this.render_count;
        }

        // Render selection pass (if needed)
        if (selection) {
            if (this.view.panning || this.view.user_input_active) {
                this.selection.clearPendingRequests();
                return;
            }

            // Only re-render if selection buffer is out of date (relative to main render buffer)
            // and not locked (e.g. no tiles are actively building)
            if (!this.selection.locked && this.last_selection_render < this.last_main_render) {
                this.selection.bind();          // switch to FBO
                this.renderPass(
                    'selection_program',        // render w/alternate program
                    { allow_blend: false });

                // Reset to screen buffer
                gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                gl.viewport(0, 0, this.canvas.width, this.canvas.height);
                gl.clearColor(...this.background.computed_color); // restore scene background color
                this.last_selection_render = this.frame;
            }

            this.selection.read(); // process any pending results from selection buffer
        }

        return true;
    }

    // Render all active styles, grouped by blend/depth type (opaque, overlay, etc.) and by program (style)
    // Called both for main render pass, and for secondary passes like selection buffer
    renderPass(program_key = 'program', { allow_blend } = {}) {
        // optionally force alpha off (e.g. for selection pass)
        allow_blend = (allow_blend == null) ? true : allow_blend;

        this.clearFrame();

        let count = 0; // how many primitives were rendered
        let last_blend; // blend mode active in last render pass

        // Get sorted list of current blend orders, with accompanying list of styles to render for each
        const blend_orders = this.style_manager.getActiveBlendOrders();
        for (const { blend_order, styles } of blend_orders) {
            // Render each style
            for (let s=0; s < styles.length; s++) {
                let style = this.styles[styles[s]];
                if (style == null) {
                    continue;
                }

                // Only update render state when blend mode changes
                if (style.blend !== last_blend) {
                    let state = Object.assign({},
                        Style.render_states[style.blend],       // render state for blend mode
                        { blend: (allow_blend && style.blend) } // enable/disable blending (e.g. no blend for selection)
                    );
                    this.setRenderState(state);
                }

                const blend = allow_blend && style.blend;
                if (blend === 'translucent') {
                    // Depth pre-pass for translucency
                    this.gl.colorMask(false, false, false, false);
                    this.renderStyle(style.name, program_key, blend_order);

                    this.gl.colorMask(true, true, true, true);
                    this.gl.depthFunc(this.gl.EQUAL);

                    // Stencil buffer mask prevents overlap/flicker from compounding alpha of overlapping polys
                    this.gl.enable(this.gl.STENCIL_TEST);
                    this.gl.clearStencil(0);
                    this.gl.clear(this.gl.STENCIL_BUFFER_BIT);
                    this.gl.stencilFunc(this.gl.EQUAL, this.gl.ZERO, 0xFF);
                    this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.INCR);

                    // Main render pass
                    count += this.renderStyle(style.name, program_key, blend_order);

                    // Disable translucency-specific settings
                    this.gl.disable(this.gl.STENCIL_TEST);
                    this.gl.depthFunc(this.gl.LESS);
                }
                else if (blend !== 'opaque' && style.stencil_proxy_tiles === true) {
                    // Mask proxy tiles to with stencil buffer to avoid overlap/flicker from compounding alpha
                    // Find unique levels of proxy tiles to render for this style
                    const proxy_levels = this.tile_manager.getRenderableTiles()
                        .filter(t => t.meshes[style.name]) // must have meshes for this style
                        .map(t => t.proxy_level) // get the proxy depth
                        .reduce((levels, level) => { // count unique proxy depths
                            levels.indexOf(level) > -1 || levels.push(level);
                            return levels;
                        }, [])
                        .sort(); // sort by lower depth first

                    if (proxy_levels.length > 1) {
                        // When there are multiple "levels" of tiles to render (e.g. non-proxy and one or more proxy
                        // tile levels, or multiple proxy tile levels but no non-proxy tiles, etc.):
                        // Render each proxy tile level to stencil buffer, masking each level such that it will not
                        // render over any pixel rendered by a previous proxy tile level.
                        this.gl.enable(this.gl.STENCIL_TEST);
                        this.gl.clearStencil(0);
                        this.gl.clear(this.gl.STENCIL_BUFFER_BIT);
                        this.gl.stencilOp(this.gl.KEEP, this.gl.KEEP, this.gl.REPLACE);

                        for (let i = 0; i < proxy_levels.length; i++) {
                            // stencil test passes either for zero (not-yet-rendered),
                            // or for other pixels at this proxy level (but not previous proxy levels)
                            this.gl.stencilFunc(this.gl.GEQUAL, proxy_levels.length - i, 0xFF);
                            count += this.renderStyle(style.name, program_key, blend_order, proxy_levels[i]);
                        }
                        this.gl.disable(this.gl.STENCIL_TEST);
                    }
                    else {
                        // No special render handling needed when there are no proxy tiles,
                        // or if there is ONLY a single proxy tile level (e.g. with no non-proxy tiles)
                        count += this.renderStyle(style.name, program_key, blend_order);
                    }
                }
                else {
                    // Regular render pass (no special blend handling, or selection buffer pass)
                    count += this.renderStyle(style.name, program_key, blend_order);
                }

                last_blend = style.blend;
            }
        }

        return count;
    }

    renderStyle(style_name, program_key, blend_order, proxy_level = null) {
        let style = this.styles[style_name];
        let first_for_style = true; // TODO: allow this state to be passed in (for multilpe blend orders, stencil tests, etc)
        let render_count = 0;
        let program;

        // Render tile GL geometries
        let renderable_tiles = this.tile_manager.getRenderableTiles();

        // For each tile, only include meshes for the blend order currently being rendered
        // Builds an array tiles and their associated meshes, each as a [tile, meshes] 2-element array
        let tile_meshes = renderable_tiles
            .filter(t => typeof proxy_level !== 'number' || t.proxy_level === proxy_level) // optional filter by proxy level
            .map(t => {
                if (t.meshes[style_name]) {
                    return [t, t.meshes[style_name].filter(m => m.variant.blend_order === blend_order)];
                }
            })
            .filter(x => x); // skip tiles with no meshes for this blend order

        // Mesh variants must be rendered in requested order across tiles, to prevent labels that cross
        // tile boundaries from rendering over adjacent tile features meant to be underneath
        let max_mesh_order =
            Math.max(...tile_meshes.map(([, meshes]) => {
                return Math.max(...meshes.map(m => m.variant.mesh_order));
            }));

        // One pass per mesh variant order (loop goes to max value +1 because 0 is a valid order value)
        for (let mo=0; mo < max_mesh_order + 1; mo++) {
            // Loop over tiles, with meshes pre-filtered by current blend order
            for (let [tile, meshes] of tile_meshes) {
                let first_for_tile = true;

                // Skip proxy tiles if new tiles have finished loading this style
                if (!tile.shouldProxyForStyle(style_name)) {
                    // log('trace', `Scene.renderStyle(): Skip proxy tile for style '${style_name}' `, tile, tile.proxy_for);
                    continue;
                }

                // Filter meshes further by current variant order
                const order_meshes = meshes.filter(m => m.variant.mesh_order === mo);
                if (order_meshes.length === 0) {
                    continue;
                }

                // Style-specific state
                // Only setup style if rendering for first time this frame
                // (lazy init, not all styles will be used in all screen views; some styles might be defined but never used)
                if (first_for_style === true) {
                    first_for_style = false;
                    program = this.setupStyle(style, program_key);
                    if (!program) {
                        // no program found, e.g. happens when rendering selection pass, but style doesn't support selection
                        return 0;
                    }
                }

                // Render each mesh (for current variant order)
                order_meshes.forEach(mesh => {
                    // Tile-specific state
                    if (first_for_tile === true) {
                        first_for_tile = false;
                        this.view.setupTile(tile, program);
                    }

                    // Render this mesh variant
                    if (style.render(mesh)) {
                        this.requestRedraw();
                    }
                    render_count += mesh.geometry_count;
                });
            }
        }

        return render_count;
    }

    setupStyle(style, program_key) {
        // Get shader program from style, lazily compiling if necessary
        let program;
        try {
            program = style.getProgram(program_key);
            if (!program) {
                return;
            }
        }
        catch(error) {
            this.trigger('warning', {
                type: 'styles',
                message: `Error compiling style ${style.name}`,
                style,
                shader_errors: style.program && style.program.shader_errors
            });
            return;
        }

        program.use();
        style.setup();

        program.uniform('1f', 'u_time', this.animated ? (((+new Date()) - this.start_time) / 1000) : 0);
        this.view.setupProgram(program);

        for (let i in this.lights) {
            this.lights[i].setupProgram(program);
        }

        return program;
    }

    clearFrame() {
        if (!this.initialized) {
            return;
        }
        this.render_states.depth_write.set({ depth_write: true });
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);
    }

    setRenderState({ depth_test, depth_write, cull_face, blend } = {}) {
        if (!this.initialized) {
            return;
        }

        // Defaults
        // TODO: when we abstract out support for multiple render passes, these can be per-pass config options
        let render_states = this.render_states;
        depth_test = (depth_test === false) ? false : render_states.defaults.depth_test;      // default true
        depth_write = (depth_write === false) ? false : render_states.defaults.depth_write;   // default true
        cull_face = (cull_face === false) ? false : render_states.defaults.culling;           // default true
        blend = (blend != null) ? blend : render_states.defaults.blending;                    // default false

        // Reset frame state
        let gl = this.gl;

        render_states.depth_test.set({ depth_test });
        render_states.depth_write.set({ depth_write });
        render_states.culling.set({ cull: cull_face, face: render_states.defaults.culling_face });

        // Blending of alpha channel is modified to account for WebGL alpha behavior, see:
        // http://webglfundamentals.org/webgl/lessons/webgl-and-alpha.html
        // http://stackoverflow.com/a/11533416
        if (blend) {
            // Opaque: all source, no destination
            if (blend === 'opaque') {
                render_states.blending.set({
                    blend: false
                });
            }
            // Traditional alpha blending
            else if (blend === 'overlay' || blend === 'inlay' || blend === 'translucent') {
                render_states.blending.set({
                    blend: true,
                    src: gl.SRC_ALPHA, dst: gl.ONE_MINUS_SRC_ALPHA,
                    src_alpha: gl.ONE, dst_alpha: gl.ONE_MINUS_SRC_ALPHA
                });
            }
            // Additive blending
            else if (blend === 'add') {
                render_states.blending.set({
                    blend: true,
                    src: gl.ONE, dst: gl.ONE
                });
            }
            // Multiplicative blending
            else if (blend === 'multiply') {
                render_states.blending.set({
                    blend: true,
                    src: gl.ZERO, dst: gl.SRC_COLOR
                });
            }
        }
        else {
            render_states.blending.set({ blend: false });
        }
    }

    // Request feature selection at given pixel. Runs async and returns results via a promise.
    getFeatureAt(pixel, { radius } = {}) {
        if (!this.initialized) {
            log('debug', 'Scene.getFeatureAt() called before scene was initialized');
            return Promise.resolve();
        }

        // skip selection if no interactive features
        if (this.selection_feature_count === 0) {
            return Promise.resolve();
        }

        // only instantiate feature selection on-demand
        if (!this.selection) {
            this.resetFeatureSelection();
        }

        // Scale point and radius to [0..1] range
        let point = {
            x: pixel.x / this.view.size.css.width,
            y: pixel.y / this.view.size.css.height
        };

        if (radius > 0) {
            radius  = {
                x: radius / this.view.size.css.width,
                y: radius / this.view.size.css.height
            };
        }
        else {
            radius = null;
        }

        return this.selection.getFeatureAt(point, { radius }).
            then(selection => Object.assign(selection, { pixel })).
            catch(error => Promise.resolve({ error }));
    }

    // Query features within visible tiles, with optional filter conditions
    async queryFeatures({ filter, unique = true, group_by = null, visible = null, geometry = false } = {}) {
        if (!this.initialized) {
            return [];
        }

        filter = Utils.serializeWithFunctions(filter);

        // Optional uniqueify criteria
        // Valid values: true, false/null, single property name, or array of property names
        unique = (typeof unique === 'string') ? [unique] : unique;
        const uniqueify_on_id = (unique === true || (Array.isArray(unique) && unique.indexOf('$id') > -1));
        const uniqueify = unique && (obj => {
            const properties = Array.isArray(unique) ? sliceObject(obj.properties, unique) : obj.properties;
            const id = uniqueify_on_id ? obj.id : null;
            if (geometry) {
                // when `geometry` flag is set, we need to uniqueify based on *both* feature properties and geometry
                return JSON.stringify({ geometry: obj.geometry, properties, id });
            }
            return JSON.stringify({ properties, id });
        });

        // Optional grouping criteria
        // Valid values: false/null, single property name, or array of property names
        group_by = (typeof group_by === 'string' || Array.isArray(group_by)) && group_by;
        const group = group_by && (obj => {
            return Array.isArray(group_by) ? JSON.stringify(sliceObject(obj, group_by)) : obj[group_by];
        });

        const tile_keys = this.tile_manager.getRenderableTiles().map(t => t.key);
        const results = await WorkerBroker.postMessage(this.workers, 'self.queryFeatures', { filter, visible, geometry, tile_keys });
        const features = [];
        const keys = {};
        const groups = {};

        results.forEach(r => r.forEach(feature => {
            if (uniqueify) {
                const str = uniqueify(feature);
                if (keys[str]) {
                    return;
                }
                keys[str] = true;
            }

            if (group) {
                const str = group(feature.properties);
                groups[str] = groups[str] || [];
                groups[str].push(feature);
            }
            else {
                features.push(feature);
            }
        }));
        return group ? groups : features; // returned grouped results, or all results
    }

    // Rebuild all tiles, without re-parsing the config or re-compiling styles
    // sync: boolean of whether to sync the config object to the worker
    // sources: optional array of data sources to selectively rebuild (by default all our rebuilt)
    rebuild({ initial = false, new_generation = true, sources = null, serialize_funcs, profile = false, fade_in = false } = {}) {
        return new Promise((resolve, reject) => {
            // Skip rebuild if already in progress
            if (this.building) {
                // Queue up to one rebuild call at a time, only save last request
                if (this.building.queued && this.building.queued.reject) {
                    // notify previous request that it did not complete
                    log('debug', 'Scene.rebuild: request superceded by a newer call');
                    this.building.queued.resolve(false); // false flag indicates rebuild request was superceded
                }

                // Save queued request
                let options = { initial, new_generation, sources, serialize_funcs, profile, fade_in };
                this.building.queued = { resolve, reject, options };
                log('trace', 'Scene.rebuild(): queuing request');
                return;
            }

            // Track tile build state
            this.building = { resolve, reject, initial };

            // Profiling
            if (profile) {
                this.debug.profile('Scene.rebuild');
            }

            // Increment generation to ensure style/tile building stay in sync
            // (skipped if calling function already incremented)
            if (new_generation) {
                this.generation = ++Scene.generation;
                for (let style in this.styles) {
                    this.styles[style].setGeneration(this.generation);
                }
            }

            // Update config (in case JS objects were manipulated directly)
            this.syncConfigToWorker({ serialize_funcs });
            this.resetWorkerFeatureSelection(sources);
            this.resetTime();

            // Rebuild visible tiles
            this.tile_manager.pruneToVisibleTiles();
            this.tile_manager.forEachTile(tile => {
                if (!sources || sources.indexOf(tile.source.name) > -1) {
                    this.tile_manager.buildTile(tile, { fade_in });
                }
            });
            this.tile_manager.updateTilesForView(); // picks up additional tiles for any new/changed data sources
            this.tile_manager.checkBuildQueue();    // resolve immediately if no tiles to build
        }).then(() => {
            // Profiling
            if (profile) {
                this.debug.profileEnd('Scene.rebuild');
            }
        });
    }

    // Tile manager finished building tiles
    // TODO move to tile manager
    tileManagerBuildDone() {
        TextCanvas.pruneTextCache();

        if (this.building) {
            log('info', 'Scene: build geometry finished');
            if (this.building.resolve) {
                this.logFirstBuild();
                this.building.resolve(true);
            }

            // Another rebuild queued?
            var queued = this.building.queued;
            this.building = null;
            if (queued) {
                log('debug', 'Scene: starting queued rebuild() request');
                this.rebuild(queued.options).then(queued.resolve, queued.reject);
            }
            else {
                this.tile_manager.updateLabels(); // refresh label if nothing to rebuild
            }
        }
    }

    /**
       Load (or reload) the scene config
       @return {Promise}
    */
    async loadScene(config_source = null, { base_path, file_type } = {}) {
        this.config_source = config_source || this.config_source;

        if (typeof this.config_source === 'string') {
            this.base_path = URLs.pathForURL(base_path || this.config_source);
        }
        else {
            this.base_path = URLs.pathForURL(base_path);
        }

        // backwards compatibility for accessing base path under previous name
        // TODO: schedule for deprecation
        this.config_path = this.base_path;

        const { config, bundle, texture_nodes } = await SceneLoader.loadScene(
            this.config_source,
            { path: this.base_path, type: file_type });

        this.config = config;
        this.config_bundle = bundle;
        return { texture_nodes }; // pass along texture nodes for resolution after global property subtistution
    }

    // Add source to a scene, arguments `name` and `config` need to be provided:
    //  - If the name doesn't match a sources it will create it
    //  - the `config` obj follow the YAML scene spec, ex: ```{type: 'TopoJSON', url: "//tile.mapzen.com/mapzen/vector/v1/all/{z}/{x}/{y}.topojson"]}```
    //    that looks like:
    //
    //      scene.setDataSource("osm", {type: 'TopoJSON', url: "//tile.mapzen.com/mapzen/vector/v1/all/{z}/{x}/{y}.topojson" });
    //
    //  - also can be pass a ```data``` obj: ```{type: 'GeoJSON', data: JSObj ]}```
    //
    //      var geojson_data = {};
    //      ...
    //      scene.setDataSource("dynamic_data", {type: 'GeoJSON', data: geojson_data });
    //
    setDataSource (name, config) {
        if (!name || !config || !config.type || (!config.url && !config.data)) {
            log('error', 'No name provided or not a valid config:', name, config);
            return;
        }

        let load = (this.config.sources[name] == null);
        let source = this.config.sources[name] = Object.assign({}, config);

        // Convert raw data into blob URL
        if (source.data && typeof source.data === 'object') {
            source.url = URLs.createObjectURL(new Blob([JSON.stringify(source.data)], { type: 'application/json' }));
            delete source.data;
        }

        if (load) {
            return this.updateConfig({ rebuild: { sources: [name] } });
        } else {
            return this.rebuild({ sources: [name] });
        }
    }

    // (Re-)create all data sources. Re-layout view and rebuild tiles when either:
    // 1) all tiles if `rebuild_all` parameter is specified (used when loading a new scene)
    // 2) the data source has changed in a way that affects tile layout (e.g. tile size, max_zoom, etc.)
    createDataSources(rebuild_all = false) {
        const reset = []; // sources to reset
        const prev_source_names = Object.keys(this.sources);
        let source_id = 0;

        for (var name in this.config.sources) {
            const source = this.config.sources[name];
            const prev_source = this.sources[name];

            try {
                const config = { ...source, name, id: source_id++ };
                this.sources[name] = DataSource.create(config, this.sources);
                if (!this.sources[name]) {
                    throw {};
                }
            }
            catch(e) {
                delete this.sources[name];
                const message = `Could not create data source: ${e.message}`;
                log('warn', `Scene: ${message}`, source);
                this.trigger('warning', { type: 'sources', source, message });
            }

            // Data source changed in a way that affects tile layout?
            // If so, we'll re-calculate the tiles in view for this source and rebuild them
            if (rebuild_all || DataSource.tileLayoutChanged(this.sources[name], prev_source)) {
                reset.push(name);
            }
        }

        // Sources that were removed
        prev_source_names.forEach(s => {
            if (!this.config.sources[s]) {
                delete this.sources[s]; // TODO: remove from workers too?
                reset.push(s);
            }
        });

        // Remove tiles from sources that have changed
        if (reset.length > 0) {
            this.tile_manager.removeTiles(tile => {
                return (reset.indexOf(tile.source.name) > -1);
            });
        }

        // Mark sources that will generate geometry tiles (any that are referenced in scene layers)
        for (let ln in this.config.layers) {
            let layer = this.config.layers[ln];
            if (layer.enabled !== false && layer.data && this.sources[layer.data.source]) {
                this.sources[layer.data.source].builds_geometry_tiles = true;
            }
        }
    }

    // Load all textures in the scene definition
    loadTextures() {
        return Texture.createFromObject(this.gl, this.config.textures)
            .then(() => Texture.createDefault(this.gl)); // create a 'default' texture for placeholders
    }

    // Free textures from previously loaded scene
    freePreviousTextures() {
        if (!this.prev_textures) {
            return;
        }

        this.prev_textures.forEach(t => {
            // free textures that aren't in the new scene, but are still in the global texture set
            if (!this.config.textures[t] && Texture.textures[t]) {
                Texture.textures[t].destroy();
            }
        });
        this.prev_textures = null;
    }

    // Called (currently manually) after styles are updated in stylesheet
    updateStyles() {
        if (!this.initialized && !this.initializing) {
            throw new Error('Scene.updateStyles() called before scene was initialized');
        }

        // (Re)build styles from config
        this.styles = this.style_manager.build(this.config.styles);
        this.style_manager.initStyles(this);

        // Optionally set GL context (used when initializing or re-initializing GL resources)
        for (let style in this.styles) {
            this.styles[style].setGL(this.gl);
        }

        this.dirty = true;
    }

    // Is scene currently animating?
    get animated () {
        // Disable animation is scene flag requests it, otherwise enable animation if any animated styles are in view
        return (this.config.scene.animated === false ?
            false :
            this.style_manager.getActiveStyles().some(s => this.styles[s].animated));
    }

    // Get active camera - for public API
    getActiveCamera() {
        return this.view.getActiveCamera();
    }

    // Set active camera - for public API
    setActiveCamera(name) {
        return this.view.setActiveCamera(name);
    }

    // Create lighting
    createLights() {
        this.lights = {};

        if (debugSettings.wireframe) {
            Light.enabled = false; // disable lighting for wireframe mode
        }

        for (let i in this.config.lights) {
            if (!this.config.lights[i] || typeof this.config.lights[i] !== 'object') {
                continue;
            }
            let light = this.config.lights[i];
            light.name = i.replace('-', '_'); // light names are injected in shaders, can't have hyphens
            light.visible = (light.visible === false) ? false : true;
            if (light.visible) {
                this.lights[light.name] = Light.create(this.view, light);
            }
        }
        Light.inject(this.lights);
    }

    // Set background color from scene config
    setBackground() {
        const bg = this.config.scene.background;

        this.background = {};
        if (bg && bg.color) {
            this.background.color = StyleParser.createColorPropertyCache(bg.color);
        }
        if (!this.background.color) {
            this.background.color = StyleParser.createColorPropertyCache([0, 0, 0, 0]); // default background TODO: vary w/scene alpha
        }
    }

    // Update background color each frame as needed (e.g. may be zoom-interpolated)
    updateBackground () {
        const last_color = this.background.computed_color;
        const color = this.background.computed_color = StyleParser.evalCachedColorProperty(this.background.color, { zoom: this.view.tile_zoom });

        // update GL/canvas if color has changed
        if (!last_color || color.some((v, i) => last_color[i] !== v)) {
            // if background is fully opaque, set canvas background to match
            if (color[3] === 1) {
                this.canvas.style.backgroundColor =
                    `rgba(${color.map(c => Math.floor(c * 255)).join(', ')})`;
            }
            else {
                this.canvas.style.backgroundColor = 'transparent';
            }

            this.gl.clearColor(...color);
        }
    }

    // Turn introspection mode on/off
    setIntrospection (val) {
        if (val !== this.introspection) {
            this.introspection = (val != null) ? val : false;
            this.updating++;
            return this.updateConfig({ normalize: false }).then(() => this.updating--);
        }
        return Promise.resolve();
    }

    // Update scene config, and optionally rebuild geometry
    // rebuild can be boolean, or an object containing rebuild options to passthrough
    updateConfig({ loading = false, rebuild = true, serialize_funcs, texture_nodes = {}, normalize = true, fade_in = false } = {}) {
        this.generation = ++Scene.generation;
        this.updating++;

        // Apply globals, finalize textures and other resource paths if needed
        this.config = SceneLoader.applyGlobalProperties(this.config);
        if (normalize) {
            // normalize whole scene if requested - usually when user is making run-time updates to scene
            SceneLoader.normalize(this.config, this.config_bundle, texture_nodes);
        }
        SceneLoader.hoistTextureNodes(this.config, this.config_bundle, texture_nodes);

        this.trigger(loading ? 'load' : 'update', { config: this.config });

        this.style_manager.init();
        this.view.reset();
        this.createLights();
        this.createDataSources(loading);
        this.loadTextures();
        this.setBackground();
        FontManager.loadFonts(this.config.fonts);

        // TODO: detect changes to styles? already (currently) need to recompile anyway when camera or lights change
        this.updateStyles();

        // Optionally rebuild geometry
        let done = rebuild ?
            this.rebuild(Object.assign({ initial: loading, new_generation: false, serialize_funcs, fade_in }, typeof rebuild === 'object' && rebuild)) :
            this.syncConfigToWorker({ serialize_funcs }); // rebuild() also syncs config

        // Finish by updating bounds and re-rendering
        this.updating--;
        this.view.updateBounds();
        this.requestRedraw();

        return done.then(() => {
            this.last_render_count = 0; // force re-evaluation of selection map
            this.requestRedraw();
        });
    }

    // Serialize config and send to worker
    syncConfigToWorker({ serialize_funcs = true } = {}) {
        // Tell workers we're about to rebuild (so they can update styles, etc.)
        let config_serialized =
            serialize_funcs ? Utils.serializeWithFunctions(this.config) : JSON.stringify(this.config);
        return WorkerBroker.postMessage(this.workers, 'self.updateConfig', {
            config: config_serialized,
            generation: this.generation,
            introspection: this.introspection
        }, debugSettings);
    }

    // Listen to related objects
    createListeners () {
        this.listeners = {};

        this.listeners.view = {
            move: () => this.trigger('move')
        };
        this.view.subscribe(this.listeners.view);

        this.listeners.texture = {
            update: () => this.dirty = true,
            warning: (data) => this.trigger('warning', Object.assign({ type: 'textures' }, data))
        };
        Texture.subscribe(this.listeners.texture);

        this.listeners.scene_loader = {
            error: (data) => this.trigger('error', Object.assign({ type: 'scene' }, data))
        };
        SceneLoader.subscribe(this.listeners.scene_loader);
    }

    destroyListeners () {
        this.unsubscribeAll();
        this.view.unsubscribe(this.listeners.view);
        Texture.unsubscribe(this.listeners.texture);
        SceneLoader.unsubscribe(this.listeners.scene_loader);
        this.listeners = null;
    }

    destroyFeatureSelection() {
        if (this.selection) {
            this.selection.destroy();
            this.selection = null;
        }
    }

    resetFeatureSelection() {
        this.selection = new FeatureSelection(this.gl, this.workers, () => this.building);
        this.last_render_count = 0; // force re-evaluation of selection map
    }

    resetWorkerFeatureSelection(sources = null) {
        if (this.workers) {
            WorkerBroker.postMessage(this.workers, 'self.resetFeatureSelection', sources);
        }
    }

    // Gets the current feature selection map size across all workers. Returns a promise.
    getFeatureSelectionMapSize() {
        // Only allow one fetch process to run at a time
        if (this.fetching_selection_map == null) {
            this.fetching_selection_map = WorkerBroker.postMessage(this.workers, 'self.getFeatureSelectionMapSize')
                .then(sizes => {
                    this.fetching_selection_map = null;
                    return sizes.reduce((a, b) => a + b);
                });
        }
        return this.fetching_selection_map;
    }

    // Reset internal clock, mostly useful for consistent experience when changing styles/debugging
    resetTime() {
        this.start_time = +new Date();
    }

    // Fires event when rendered tile set or style changes
    updateViewComplete () {
        if ((this.render_count_changed || this.generation !== this.last_complete_generation) &&
            !this.building &&
            !this.tile_manager.isLoadingVisibleTiles() &&
            this.tile_manager.allVisibleTilesLabeled()) {
            this.tile_manager.updateLabels();
            this.last_complete_generation = this.generation;
            this.trigger('view_complete', { first: (this.view_complete !== true) });
            this.view_complete = true;
        }
    }

    resetViewComplete () {
        this.last_complete_generation = null;
    }

    // Take a screenshot
    // Asynchronous because we have to wait for next render to capture buffer
    // Returns a promise
    screenshot ({ background = 'white' } = {}) {
        this.requestRedraw();
        return this.media_capture.screenshot({background});
    }

    startVideoCapture () {
        this.requestRedraw();
        return this.media_capture.startVideoCapture();
    }

    stopVideoCapture () {
        return this.media_capture.stopVideoCapture();
    }

    // Log first frame rendered (with any geometry)
    logFirstFrame() {
        if (this.last_render_count === 0 && !this.times.first_frame) {
            this.times.first_frame = (+new Date()) - this.start_time;
            log('debug', `Scene: initial frame time: ${this.times.first_frame}`);
        }
    }

    // Log completion of first scene build
    logFirstBuild() {
        if (this.times.first_build == null) {
            this.times.first_build = (+new Date()) - this.start_time;
            log('debug', `Scene: initial build time: ${this.times.first_build}`);
        }
    }

}

Scene.id = 0;         // unique id for a scene instance
Scene.generation = 0; // id that is incremented each time a scene config is re-parsed
