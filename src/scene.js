import log from './utils/log';
import Utils from './utils/utils';
import * as URLs from './utils/urls';
import WorkerBroker from './utils/worker_broker';
import subscribeMixin from './utils/subscribe';
import Context from './gl/context';
import Texture from './gl/texture';
import ShaderProgram from './gl/shader_program';
import VertexArrayObject from './gl/vao';
import {StyleManager} from './styles/style_manager';
import {Style} from './styles/style';
import {StyleParser} from './styles/style_parser';
import SceneLoader from './scene_loader';
import View from './view';
import Light from './light';
import TileManager from './tile_manager';
import DataSource from './sources/data_source';
import FeatureSelection from './selection';
import RenderStateManager from './gl/render_state';
import FontManager from './styles/text/font_manager';
import MediaCapture from './utils/media_capture';

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
        this.tile_manager = new TileManager({ scene: this, view: this.view });
        this.num_workers = options.numWorkers || 2;
        this.worker_url = options.workerUrl;
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
        this.animated = false;                          // request redraw every frame
        this.preUpdate = options.preUpdate;             // optional pre-render loop hook
        this.postUpdate = options.postUpdate;           // optional post-render loop hook
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
        this.introspection = false;
        this.resetTime();

        this.container = options.container;

        this.lights = null;
        this.background = null;

        this.createListeners();
        this.updating = 0;
        this.generation = Scene.generation; // an id that is incremented each time the scene config is invalidated
        this.last_complete_generation = Scene.generation; // last generation id with a complete view
        this.setupDebug();

        this.log_level = options.logLevel || 'warn';
        log.setLevel(this.log_level);
    }

    static create (config, options = {}) {
        return new Scene(config, options);
    }

    // Load scene (or reload existing scene if no new source specified)
    // Options:
    //   `config_path`: base URL against which roo scene resources should be resolved (useful for Play) (default nulll)
    //   `blocking`: should rendering block on scene load completion (default true)
    load(config_source = null, options = {}) {
        if (this.initializing) {
            return this.initializing;
        }

        this.updating++;
        this.initialized = false;

        // Backwards compatibilty for passing `config_path` string as second argument
        // (since transitioned to using options argument to accept more parameters)
        options = (typeof options === 'string') ? { config_path: options } : options;
        let config_path = options.config_path;

        // Should rendering block on load (not desirable for initial load, often desired for live style-switching)
        options.blocking = (options.blocking !== undefined) ? options.blocking : true;

        // Load scene definition (sources, styles, etc.), then create styles & workers
        this.createCanvas();
        this.initializing = this.loadScene(config_source, config_path)
            .then(() => this.createWorkers())
            .then(() => {
                this.resetFeatureSelection();

                // Scene loaded from a JS object, or modified by a `load` event, may contain compiled JS functions
                // which need to be serialized, while one loaded only from a URL does not.
                const serialize_funcs = ((typeof this.config_source === 'object') || this.hasSubscribersFor('load'));

                const updating = this.updateConfig({ serialize_funcs, load_event: true, fade_in: true });
                if (options.blocking === true) {
                    return updating;
                }
            }).then(() => {
                this.updating--;
                this.initializing = null;
                this.initialized = true;
                this.last_valid_config_source = this.config_source;
                this.last_valid_config_path = this.config_path;

                if (this.render_loop !== false) {
                    this.setupRenderLoop();
                }
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

            message = `Scene.load() failed to load ${this.config_source}: ${error.message}`;
            if (this.last_valid_config_source) {
                log('warn', message, error);
                log('info', `Scene.load() reverting to last valid configuration`);
                return this.load(this.last_valid_config_source, this.last_valid_config_path);
            }
            log('error', message, error);
            throw error;
        });

        return this.initializing;
    }

    // For API compatibility
    reload(config_source = null, config_path = null) {
        return this.load(config_source, config_path);
    }

    destroy() {
        this.initialized = false;
        this.render_loop_stop = true; // schedule render loop to stop

        this.destroyListeners();

        if (this.canvas && this.canvas.parentNode) {
            this.canvas.parentNode.removeChild(this.canvas);
            this.canvas = null;
        }
        this.container = null;

        if (this.selection) {
            this.selection.destroy();
        }

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
            this.gl = Context.getContext(this.canvas, {
                alpha: true, premultipliedAlpha: true, // TODO: vary w/scene alpha
                device_pixel_ratio: Utils.device_pixel_ratio
            });
        }
        catch(e) {
            throw new Error(
                "Couldn't create WebGL context. " +
                "Your browser may not support WebGL, or it's turned off? " +
                "Visit http://webglreport.com/ for more info."
            );
        }

        this.resizeMap(this.container.clientWidth, this.container.clientHeight);
        VertexArrayObject.init(this.gl);
        this.render_states = new RenderStateManager(this.gl);
        this.media_capture.setCanvas(this.canvas);
    }

    // Get the URL to load the web worker from
    getWorkerUrl() {
        let worker_url = this.worker_url || URLs.findCurrentURL('tangram.debug.js', 'tangram.min.js');

        if (!worker_url) {
            throw new Error("Can't load worker because couldn't find base URL that library was loaded from");
        }

        // Import custom data source scripts alongside core library
        // NOTE: workaround for issue where large libraries intermittently fail to load in web workers,
        // when multiple importScripts() calls are used. Loading all scripts (including Tangram itself)
        // in one call at at worker creation time has not exhibited the same issue.
        let urls = [...this.data_source_scripts];
        urls.push(worker_url); // load Tangram *last* (has been more reliable, though reason unknown)
        let body = `importScripts(${urls.map(url => `'${url}'`).join(',')});`;
        return URLs.createObjectURL(new Blob([body], { type: 'application/javascript' }));
    }

    // Update list of any custom data source scripts (if any)
    updateDataSourceScripts () {
        let prev_scripts = [...(this.data_source_scripts||[])]; // save list of previously loaded scripts
        let scripts = Object.keys(this.config.sources).map(s => this.config.sources[s].scripts).filter(x => x);
        if (scripts.length > 0) {
            log('debug', 'loading custom data source scripts in worker:', scripts);
        }
        this.data_source_scripts = [].concat(...scripts).sort();

        // Scripts changed?
        return !(this.data_source_scripts.length === prev_scripts.length &&
            this.data_source_scripts.every((v, i) => v === prev_scripts[i]));
    }

    // Web workers handle heavy duty tile construction: networking, geometry processing, etc.
    createWorkers() {
        // Reset old workers (if any) if we need to re-instantiate with new external scripts
        if (this.updateDataSourceScripts()) {
            this.destroyWorkers();
        }

        if (!this.workers) {
            return this.makeWorkers(this.getWorkerUrl());
        }
        return Promise.resolve();
    }

    // Instantiate workers from URL, init event handlers
    makeWorkers(url) {
        var queue = [];

        this.workers = [];
        for (var id=0; id < this.num_workers; id++) {
            var worker = new Worker(url);
            this.workers[id] = worker;

            WorkerBroker.addWorker(worker);

            log('debug', `Scene.makeWorkers: initializing worker ${id}`);
            let _id = id;
            queue.push(WorkerBroker.postMessage(worker, 'self.init', this.id, id, this.num_workers, this.log_level, Utils.device_pixel_ratio).then(
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

            // Let VertexElements know if 32 bit indices for element arrays are available
            let Uint32_flag = this.gl.getExtension("OES_element_index_uint") ? true : false;
            WorkerBroker.postMessage(this.workers, 'VertexElements.setUint32Flag', Uint32_flag);

            // Free memory after worker initialization
            URLs.revokeObjectURL(url);
        });
    }

    destroyWorkers() {
        if (Array.isArray(this.workers)) {
            log.setWorkers(null);
            this.workers.forEach((worker) => {
                worker.terminate();
            });
            this.workers = null;
        }
    }

    // Assign tile to worker thread based on data source
    getWorkerForDataSource(source) {
        let worker;

        if (source.tiled) {
            // Round robin tiled sources across all workers
            worker = this.workers[this.next_worker];
            this.next_worker = (this.next_worker + 1) % this.workers.length;
        }
        else {
            // Pin all tiles from each non-tiled source to a single worker
            // Prevents data for these sources from being loaded more than once
            worker = this.workers[source.id % this.workers.length];
        }

        return worker;
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

        if (this.initialized) {
            // Render the scene
            this.update();
        }

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
        if (typeof this.preUpdate === 'function') {
            this.preUpdate(will_render);
        }

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
        if (typeof this.postUpdate === 'function') {
            this.postUpdate(will_render);
        }

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

        // Update styles, camera, lights
        this.view.update();
        Object.keys(this.lights).forEach(i => this.lights[i].update());

        // Render main pass
        if (main) {
            this.render_count = this.renderPass();
            this.last_main_render = this.frame;
        }

        // Render selection pass (if needed)
        if (selection) {
            if (this.view.panning || this.view.zooming) {
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
                this.last_selection_render = this.frame;
            }

            this.selection.read(); // process any pending results from selection buffer
        }

        this.render_count_changed = false;
        if (this.render_count !== this.last_render_count) {
            this.render_count_changed = true;

            this.getFeatureSelectionMapSize().then(size => {
                if (size) { // returns undefined if previous request pending
                    log('info', `Scene: rendered ${this.render_count} primitives (${size} features in selection map)`);
                }
            });
        }
        this.last_render_count = this.render_count;

        return true;
    }

    // Render all active styles, grouped by blend/depth type (opaque, overlay, etc.) and by program (style)
    // Called both for main render pass, and for secondary passes like selection buffer
    renderPass(program_key = 'program', { allow_blend } = {}) {
        // optionally force alpha off (e.g. for selection pass)
        allow_blend = (allow_blend == null) ? true : allow_blend;

        this.clearFrame({ clear_color: true, clear_depth: true });

        // Sort styles by blend order
        let styles = this.tile_manager.getActiveStyles().
            map(s => this.styles[s]).
            filter(s => s). // guard against missing styles, such as while loading a new scene
            sort(Style.blendOrderSort);

        // Render styles
        let count = 0; // how many primitives were rendered
        let last_blend;
        for (let s=0; s < styles.length; s++) {
            let style = styles[s];

            // Only update render state when blend mode changes
            if (style.blend !== last_blend) {
                let state = Object.assign({},
                    Style.render_states[style.blend],       // render state for blend mode
                    { blend: (allow_blend && style.blend) } // enable/disable blending (e.g. no blend for selection)
                );
                this.setRenderState(state);
            }
            count += this.renderStyle(style.name, program_key);
            last_blend = style.blend;
        }

        return count;
    }

    renderStyle(style_name, program_key) {
        let style = this.styles[style_name];
        let first_for_style = true;
        let render_count = 0;
        let program;

        // Render tile GL geometries
        let renderable_tiles = this.tile_manager.getRenderableTiles();
        for (let t=0; t < renderable_tiles.length; t++) {
            let tile = renderable_tiles[t];

            if (tile.meshes[style_name] == null) {
                continue;
            }

            // Style-specific state
            // Only setup style if rendering for first time this frame
            // (lazy init, not all styles will be used in all screen views; some styles might be defined but never used)
            if (first_for_style === true) {
                first_for_style = false;
                program = this.setupStyle(style, program_key);
                if (!program) {
                    return 0;
                }
            }

            // Skip proxy tiles if new tiles have finished loading this style
            if (!tile.shouldProxyForStyle(style_name)) {
                // log('trace', `Scene.renderStyle(): Skip proxy tile for style '${style_name}' `, tile, tile.proxy_for);
                continue;
            }

            // Tile-specific state
            this.view.setupTile(tile, program);

            // Render tile
            let mesh = tile.meshes[style_name];
            if (style.render(mesh)) {
                // Don't incur additional renders while viewport is moving
                if (!(this.view.panning || this.view.zooming)) {
                   this.requestRedraw();
                }
            }
            render_count += mesh.geometry_count;
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

    clearFrame({ clear_color, clear_depth } = {}) {
        if (!this.initialized) {
            return;
        }

        // Defaults
        clear_color = (clear_color === false) ? false : true; // default true
        clear_depth = (clear_depth === false) ? false : true; // default true

        // Set GL state
        this.render_states.depth_write.set({ depth_write: clear_depth });

        let gl = this.gl;
        if (clear_color || clear_depth) {
            let mask = (clear_color && gl.COLOR_BUFFER_BIT) | (clear_depth && gl.DEPTH_BUFFER_BIT);
            gl.clear(mask);
        }
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

        render_states.depth_test.set({ depth_test: depth_test });
        render_states.depth_write.set({ depth_write: depth_write });
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
            else if (blend === 'overlay' || blend === 'inlay') {
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
    getFeatureAt(pixel) {
        if (!this.initialized) {
            log('debug', "Scene.getFeatureAt() called before scene was initialized");
            return Promise.resolve();
        }

        // Point scaled to [0..1] range
        var point = {
            x: pixel.x * Utils.device_pixel_ratio / this.view.size.device.width,
            y: pixel.y * Utils.device_pixel_ratio / this.view.size.device.height
        };

        return this.selection.getFeatureAt(point).
            then(selection => Object.assign(selection, { pixel })).
            catch(error => Promise.resolve({ error }));
    }

    // Rebuild geometry, without re-parsing the config or re-compiling styles
    // TODO: detect which elements need to be refreshed/rebuilt (stylesheet changes, etc.)
    rebuild(options) {
        return this.rebuildGeometry(options);
    }

    // Rebuild all tiles
    // sync: boolean of whether to sync the config object to the worker
    // sources: optional array of data sources to selectively rebuild (by default all our rebuilt)
    rebuildGeometry({ sync = true, sources = null, serialize_funcs, profile = false, fade_in = false } = {}) {
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
                let options = { sync, sources, serialize_funcs, profile, fade_in };
                this.building.queued = { resolve, reject, options };
                log('trace', `Scene.rebuild(): queuing request`);
                return;
            }

            // Track tile build state
            this.building = { resolve, reject };

            // Profiling
            if (profile) {
                this._profile('Scene.rebuild');
            }

            // Update config (in case JS objects were manipulated directly)
            if (sync) {
                this.syncConfigToWorker({ serialize_funcs });
            }
            this.resetFeatureSelection();
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
                this._profileEnd('Scene.rebuild');
            }
        });
    }

    // Tile manager finished building tiles
    // TODO move to tile manager
    tileManagerBuildDone() {
        if (this.building) {
            log('info', `Scene: build geometry finished`);
            if (this.building.resolve) {
                this.building.resolve(true);
            }

            // Another rebuild queued?
            var queued = this.building.queued;
            this.building = null;
            if (queued) {
                log('debug', `Scene: starting queued rebuild() request`);
                this.rebuild(queued.options).then(queued.resolve, queued.reject);
            }
        }
    }

    /**
       Load (or reload) the scene config
       @return {Promise}
    */
    loadScene(config_source = null, config_path = null) {
        this.config_source = config_source || this.config_source;
        this.config_globals_applied = [];

        if (typeof this.config_source === 'string') {
            this.config_path = URLs.pathForURL(config_path || this.config_source);
        }
        else {
            this.config_path = URLs.pathForURL(config_path);
        }

        return SceneLoader.loadScene(this.config_source, this.config_path).then(({config, bundle}) => {
            this.config = config;
            this.config_bundle = bundle;
            return this.config;
        });
    }

    // Add source to a scene, arguments `name` and `config` need to be provided:
    //  - If the name doesn't match a sources it will create it
    //  - the `config` obj follow the YAML scene spec, ex: ```{type: 'TopoJSON', url: "//vector.mapzen.com/osm/all/{z}/{x}/{y}.topojson"]}```
    //    that looks like:
    //
    //      scene.setDataSource("osm", {type: 'TopoJSON', url: "//vector.mapzen.com/osm/all/{z}/{x}/{y}.topojson" });
    //
    //  - also can be pass a ```data``` obj: ```{type: 'GeoJSON', data: JSObj ]}```
    //
    //      var geojson_data = {};
    //      ...
    //      scene.setDataSource("dynamic_data", {type: 'GeoJSON', data: geojson_data });
    //
    setDataSource (name, config) {
        if (!name || !config || !config.type || (!config.url && !config.data)) {
            log('error', "No name provided or not a valid config:", name, config);
            return;
        }

        let load = (this.config.sources[name] == null);
        let source = this.config.sources[name] = Object.assign({}, config);

        // Convert raw data into blob URL
        if (source.data && typeof source.data === 'object') {
            source.url = URLs.createObjectURL(new Blob([JSON.stringify(source.data)]));
            delete source.data;
        }

        // Resolve paths relative to root scene bundle
        SceneLoader.normalizeDataSource(source, this.config_bundle);

        if (load) {
            return this.updateConfig({ rebuild: { sources: [name] } });
        } else {
            return this.rebuild({ sources: [name] });
        }
    }

    createDataSources() {
        let reset = []; // sources to reset
        let prev_source_names = Object.keys(this.sources);
        let source_id = 0;

        for (var name in this.config.sources) {
            let source = this.config.sources[name];
            let prev_source = this.sources[name];

            try {
                let config = Object.assign({}, source, { name, id: source_id++ });
                this.sources[name] = DataSource.create(config, this.sources);
                if (!this.sources[name]) {
                    throw {};
                }
            }
            catch(e) {
                delete this.sources[name];
                let message = `Could not create data source: ${e.message}`;
                log('warn', `Scene: ${message}`, source);
                this.trigger('warning', { type: 'sources', source, message });
            }

            // Data source changed?
            if (DataSource.changed(this.sources[name], prev_source)) {
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

        // Mark sources that will generate geometry tiles
        // (all except those that are only raster sources attached to other sources)
        for (let ln in this.config.layers) {
            let layer = this.config.layers[ln];
            if (layer.data && this.sources[layer.data.source]) {
                this.sources[layer.data.source].builds_geometry_tiles = true;
            }
        }
    }

    // Load all textures in the scene definition
    loadTextures() {
        return Texture.createFromObject(this.gl, this.config.textures).
            then(() => Texture.createDefault(this.gl)); // create a 'default' texture for placeholders
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

        // Use explicitly set scene animation flag if defined, otherwise turn on animation if there are any animated styles
        this.animated =
            this.config.scene.animated !== undefined ?
                this.config.scene.animated :
                Object.keys(this.styles).some(s => this.styles[s].animated);

        this.dirty = true;
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

    // Set background color
    setBackground() {
        let bg = this.config.scene.background;
        this.background = {};
        if (bg && bg.color) {
            this.background.color = StyleParser.parseColor(bg.color);
        }
        if (!this.background.color) {
            this.background.color = [0, 0, 0, 0]; // default background TODO: vary w/scene alpha
        }

        // if background is fully opaque, set canvas background to match
        if (this.background.color[3] === 1) {
            this.canvas.style.backgroundColor =
                `rgba(${this.background.color.map(c => Math.floor(c * 255)).join(', ')})`;
        }
        else {
            this.canvas.style.backgroundColor = 'transparent';
        }

        this.gl.clearColor(...this.background.color);
    }

    // Turn introspection mode on/off
    setIntrospection (val) {
        this.introspection = val || false;
        this.updating++;
        return this.updateConfig().then(() => this.updating--);
    }

    // Update scene config, and optionally rebuild geometry
    // rebuild can be boolean, or an object containing rebuild options to passthrough
    updateConfig({ load_event = false, rebuild = true, serialize_funcs, fade_in = false } = {}) {
        this.generation = ++Scene.generation;
        this.updating++;

        this.config = SceneLoader.applyGlobalProperties(this.config, this.config_globals_applied);
        this.trigger(load_event ? 'load' : 'update', { config: this.config });

        SceneLoader.hoistTextures(this.config); // move inline textures into global texture set
        this.style_manager.init();
        this.view.reset();
        this.createLights();
        this.createDataSources();
        this.loadTextures();
        this.setBackground();
        FontManager.loadFonts(this.config.fonts);

        // TODO: detect changes to styles? already (currently) need to recompile anyway when camera or lights change
        this.updateStyles();

        // Optionally rebuild geometry
        let done = rebuild ?
            this.rebuild(Object.assign({ serialize_funcs, fade_in }, typeof rebuild === 'object' && rebuild)) :
            this.syncConfigToWorker({ serialize_funcs }); // rebuild() also syncs config

        // Finish by updating bounds and re-rendering
        this.updating--;
        this.view.updateBounds();
        this.requestRedraw();

        return done;
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
        });
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

    resetFeatureSelection() {
        if (!this.selection) {
            this.selection = new FeatureSelection(this.gl, this.workers, () => this.building);
        }
        else if (this.workers) {
            WorkerBroker.postMessage(this.workers, 'self.resetFeatureSelection');
        }
    }

    // Gets the current feature selection map size across all workers. Returns a promise.
    getFeatureSelectionMapSize() {
        if (this.fetching_selection_map) {
            return Promise.resolve(); // return undefined if already pending
        }
        this.fetching_selection_map = true;

        return WorkerBroker.postMessage(this.workers, 'self.getFeatureSelectionMapSize')
            .then(sizes => {
                this.fetching_selection_map = false;
                return sizes.reduce((a, b) => a + b);
            });
    }

    // Reset internal clock, mostly useful for consistent experience when changing styles/debugging
    resetTime() {
        this.start_time = +new Date();
    }

    // Fires event when rendered tile set or style changes
    updateViewComplete () {
        if ((this.render_count_changed || this.generation !== this.last_complete_generation) &&
            !this.tile_manager.isLoadingVisibleTiles()) {
            this.last_complete_generation = this.generation;
            this.trigger('view_complete');
        }
    }

    resetViewComplete () {
        this.last_complete_generation = null;
    }

    // Take a screenshot
    // Asynchronous because we have to wait for next render to capture buffer
    // Returns a promise
    screenshot () {
        this.requestRedraw();
        return this.media_capture.screenshot();
    }

    startVideoCapture () {
        this.requestRedraw();
        return this.media_capture.startVideoCapture();
    }

    stopVideoCapture () {
        return this.media_capture.stopVideoCapture();
    }


    // Stats/debug/profiling methods

    // Profile helpers, issues a profile on main thread & all workers
    _profile(name) {
        console.profile(`main thread: ${name}`);
        WorkerBroker.postMessage(this.workers, 'self.profile', name);
    }

    _profileEnd(name) {
        console.profileEnd(`main thread: ${name}`);
        WorkerBroker.postMessage(this.workers, 'self.profileEnd', name);
    }

    // Debug config and functions
    setupDebug () {
        let scene = this;
        this.debug = {
            // Rebuild geometry a given # of times and print average, min, max timings
            timeRebuild (num = 1, options = {}) {
                let times = [];
                let cycle = () => {
                    let start = +new Date();
                    scene.rebuild(options).then(() => {
                        times.push(+new Date() - start);

                        if (times.length < num) {
                            cycle();
                        }
                        else {
                            let avg = ~~(times.reduce((a, b) => a + b) / times.length);
                            log('info', `Profiled rebuild ${num} times: ${avg} avg (${Math.min(...times)} min, ${Math.max(...times)} max)`);
                        }
                    });
                };
                cycle();
            },

            // Return geometry counts of visible tiles, grouped by style name
            geometryCountByStyle () {
                let counts = {};
                scene.tile_manager.getRenderableTiles().forEach(tile => {
                    for (let style in tile.meshes) {
                        counts[style] = counts[style] || 0;
                        counts[style] += tile.meshes[style].geometry_count;
                    }
                });
                return counts;
            },

            geometryCountByBaseStyle () {
                let style_counts = scene.debug.geometryCountByStyle();
                let counts = {};
                for (let style in style_counts) {
                    let base = scene.styles[style].baseStyle();
                    counts[base] = counts[base] || 0;
                    counts[base] += style_counts[style];
                }
                return counts;
            },

            renderableTilesCount () {
                return scene.tile_manager.getRenderableTiles().length;
            }
        };
    }

}

Scene.id = 0;         // unique id for a scene instance
Scene.generation = 0; // id that is incremented each time a scene config is re-parsed
