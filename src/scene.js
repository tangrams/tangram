import log from './utils/log';
import Utils from './utils/utils';
import WorkerBroker from './utils/worker_broker';
import subscribeMixin from './utils/subscribe';
import Context from './gl/context';
import Texture from './gl/texture';
import VertexArrayObject from './gl/vao';
import {Style} from './styles/style';
import {StyleManager} from './styles/style_manager';
import {StyleParser} from './styles/style_parser';
import SceneLoader from './scene_loader';
import View from './view';
import Light from './light';
import TileManager from './tile_manager';
import DataSource from './sources/data_source';
import FeatureSelection from './selection';
import RenderState from './gl/render_state';
import CanvasText from './styles/text/canvas_text';

import {Polygons} from './styles/polygons/polygons';
import {Lines} from './styles/lines/lines';
import {Points} from './styles/points/points';
import {TextStyle} from './styles/text/text';
import {RasterStyle} from './styles/raster/raster';

// Add built-in rendering styles
StyleManager.register(Polygons);
StyleManager.register(Lines);
StyleManager.register(Points);
StyleManager.register(TextStyle);
StyleManager.register(RasterStyle);

// Load scene definition: pass an object directly, or a URL as string to load remotely
export default class Scene {

    constructor(config_source, options) {
        options = options || {};
        subscribeMixin(this);

        this.initialized = false;
        this.initializing = null; // will be a promise that resolves when scene is loaded
        this.sources = {};

        this.view = new View(this, options);
        this.tile_manager = TileManager;
        this.tile_manager.init({ scene: this, view: this.view });
        this.num_workers = options.numWorkers || 2;
        this.worker_url = options.workerUrl;
        if (options.disableVertexArrayObjects === true) {
            VertexArrayObject.disabled = true;
        }

        Utils.use_high_density_display = options.highDensityDisplay !== undefined ? options.highDensityDisplay : true;
        Utils.updateDevicePixelRatio();

        this.config = null;
        this.config_source = config_source;
        this.config_serialized = null;
        this.last_valid_config_source = null;

        this.styles = null;
        this.active_styles = {};

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
        this.queue_screenshot = null;
        this.selection = null;
        this.introspection = false;
        this.resetTime();

        this.container = options.container;

        this.lights = null;
        this.background = null;

        // Listen to related objects
        this.listeners = {
            view: {
                move: () => this.trigger('move')
            }
        };
        this.view.subscribe(this.listeners.view);

        this.updating = 0;
        this.generation = 0; // an id that is incremented each time the scene config is invalidated
        this.last_complete_generation = 0; // last generation id with a complete view
        this.setupDebug();

        this.log_level = options.logLevel || 'warn';
        log.setLevel(this.log_level);
    }

    static create (config, options = {}) {
        return new Scene(config, options);
    }

    // Load (or reload) scene config
    // Optionally specify new scene file URL
    load(config_source = null, config_path = null) {
        if (this.initializing) {
            return this.initializing;
        }

        this.updating++;
        this.initialized = false;

        // Load scene definition (sources, styles, etc.), then create styles & workers
        this.initializing = this.loadScene(config_source, config_path)
            .then(() => this.createWorkers())
            .then(() => {
                this.createCanvas();
                this.resetFeatureSelection();

                if (!this.listeners.texture) {
                    this.listeners.texture = {
                        update: () => this.dirty = true,
                        warning: (data) => this.trigger('warning', Object.assign({ type: 'textures' }, data))
                    };
                    Texture.subscribe(this.listeners.texture);
                }

                // Only retain visible tiles for rebuilding
                this.tile_manager.pruneToVisibleTiles();

                // Scene loaded from a JS object may contain functions which need to be serialized,
                // while one loaded from a URL does not
                return this.updateConfig({
                    serialize_funcs: (typeof config_source === 'object')
                });
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

        this.unsubscribeAll(); // clear all event listeners

        this.view.unsubscribe(this.listeners.view);
        Texture.unsubscribe(this.listeners.texture);
        this.listeners = null;

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
            StyleManager.destroy(this.gl);
            this.styles = {};

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
        RenderState.initialize(this.gl);

        // Let VertexElements know if 32 bit indices for element arrays are available
        var Uint32_flag = this.gl.getExtension("OES_element_index_uint") ? true : false;
        WorkerBroker.postMessage(this.workers, 'VertexElements.setUint32Flag', Uint32_flag);
    }

    // Get the URL to load the web worker from
    getWorkerUrl() {
        let worker_url = this.worker_url || Utils.findCurrentURL('tangram.debug.js', 'tangram.min.js');

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
        return Utils.createObjectURL(new Blob([body], { type: 'application/javascript' }));
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
            queue.push(WorkerBroker.postMessage(worker, 'self.init', id, this.num_workers, this.log_level, Utils.device_pixel_ratio).then(
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
        return Promise.all(queue).then(() => log.setWorkers(this.workers));
    }

    destroyWorkers() {
        if (Array.isArray(this.workers)) {
            log.setWorkers(null);
            this.workers.forEach((worker) => {
                worker.terminate();
                WorkerBroker.removeWorker(worker);
            });
            this.workers = null;
        }
    }

    // Round robin selection of next worker
    nextWorker() {
        var worker = this.workers[this.next_worker];
        this.next_worker = (this.next_worker + 1) % this.workers.length;
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
        // Render on demand
        var will_render = !(
            this.dirty === false ||
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
        this.render();
        this.updateViewComplete(); // fires event when rendered tile set or style changes
        this.completeScreenshot(); // completes screenshot capture if requested

        // Post-render loop hook
        if (typeof this.postUpdate === 'function') {
            this.postUpdate(will_render);
        }

        // Redraw every frame if animating
        if (this.animated === true) {
            this.dirty = true;
        }

        this.frame++;
        log('trace', 'Scene.render()');
        return true;
    }

    render() {
        var gl = this.gl;

        // Update styles, camera, lights
        this.view.update();
        Object.keys(this.active_styles).forEach(i => this.styles[i].update());
        Object.keys(this.lights).forEach(i => this.lights[i].update());

        // Renderable tile list
        this.renderable_tiles = this.tile_manager.getRenderableTiles();
        this.renderable_tiles_count = this.renderable_tiles.length;

        // Render main pass
        this.render_count = this.renderPass();

        // Render selection pass (if needed)
        if (this.selection.pendingRequests()) {
            if (this.view.panning || this.view.zooming) {
                this.selection.clearPendingRequests();
                return;
            }

            this.selection.bind();                  // switch to FBO
            this.renderPass(
                'selection_program',                // render w/alternate program
                { allow_blend: false });
            this.selection.read();                  // read results from selection buffer

            // Reset to screen buffer
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        }

        this.render_count_changed = false;
        if (this.render_count !== this.last_render_count) {
            this.render_count_changed = true;

            this.getFeatureSelectionMapSize().then(size => {
                log('info', `Scene: rendered ${this.render_count} primitives (${size} features in selection map)`);
            }, () => {}); // no op when promise rejects (only print last response)
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
        let styles = Object.keys(this.active_styles).
            map(s => this.styles[s]).
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

    renderStyle(style, program_key) {
        let first_for_style = true;
        let render_count = 0;

        let program = this.styles[style][program_key];
        if (!program || !program.compiled) {
            return 0;
        }

        // Render tile GL geometries
        for (let t in this.renderable_tiles) {
            let tile = this.renderable_tiles[t];

            if (tile.meshes[style] == null) {
                continue;
            }

            // Style-specific state
            // Only setup style if rendering for first time this frame
            // (lazy init, not all styles will be used in all screen views; some styles might be defined but never used)
            if (first_for_style === true) {
                first_for_style = false;

                program.use();
                this.styles[style].setup();

                // TODO: don't set uniforms when they haven't changed
                program.uniform('1f', 'u_time', this.animated ? (((+new Date()) - this.start_time) / 1000) : 0);
                this.view.setupProgram(program);
                for (let i in this.lights) {
                    this.lights[i].setupProgram(program);
                }
            }

            // Tile-specific state
            this.view.setupTile(tile, program);

            // Render tile
            this.styles[style].render(tile.meshes[style]);
            render_count += tile.meshes[style].geometry_count;
        }

        return render_count;
    }

    clearFrame({ clear_color, clear_depth } = {}) {
        if (!this.initialized) {
            return;
        }

        // Defaults
        clear_color = (clear_color === false) ? false : true; // default true
        clear_depth = (clear_depth === false) ? false : true; // default true

        // Set GL state
        RenderState.depth_write.set({ depth_write: clear_depth });

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
        depth_test = (depth_test === false) ? false : RenderState.defaults.depth_test;      // default true
        depth_write = (depth_write === false) ? false : RenderState.defaults.depth_write;   // default true
        cull_face = (cull_face === false) ? false : RenderState.defaults.culling;           // default true
        blend = (blend != null) ? blend : RenderState.defaults.blending;                    // default false

        // Reset frame state
        let gl = this.gl;

        RenderState.depth_test.set({ depth_test: depth_test });
        RenderState.depth_write.set({ depth_write: depth_write });
        RenderState.culling.set({ cull: cull_face, face: RenderState.defaults.culling_face });

        // Blending of alpha channel is modified to account for WebGL alpha behavior, see:
        // http://webglfundamentals.org/webgl/lessons/webgl-and-alpha.html
        // http://stackoverflow.com/a/11533416
        if (blend) {
            // Opaque: all source, no destination
            if (blend === 'opaque') {
                RenderState.blending.set({
                    blend: true,
                    src: gl.SRC_ALPHA, dst: gl.ZERO
                });
            }
            // Traditional alpha blending
            else if (blend === 'overlay' || blend === 'inlay') {
                RenderState.blending.set({
                    blend: true,
                    src: gl.SRC_ALPHA, dst: gl.ONE_MINUS_SRC_ALPHA,
                    src_alpha: gl.ONE, dst_alpha: gl.ONE_MINUS_SRC_ALPHA
                });
            }
            // Additive blending
            else if (blend === 'add') {
                RenderState.blending.set({
                    blend: true,
                    src: gl.ONE, dst: gl.ONE,
                    src_alpha: gl.ONE, dst_alpha: gl.ONE_MINUS_SRC_ALPHA
                });
            }
            // Multiplicative blending
            else if (blend === 'multiply') {
                RenderState.blending.set({
                    blend: true,
                    src: gl.ZERO, dst: gl.SRC_COLOR,
                    src_alpha: gl.ONE, dst_alpha: gl.ONE_MINUS_SRC_ALPHA
                });
            }
        }
        else {
            RenderState.blending.set({ blend: false });
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

        this.dirty = true; // need to make sure the scene re-renders for these to be processed
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
    rebuildGeometry({ sync = true, sources = null, serialize_funcs } = {}) {
        return new Promise((resolve, reject) => {
            // Skip rebuild if already in progress
            if (this.building) {
                // Queue up to one rebuild call at a time, only save last request
                if (this.building.queued && this.building.queued.reject) {
                    // notify previous request that it did not complete
                    log('debug', 'Scene.rebuildGeometry: request superceded by a newer call');
                    this.building.queued.resolve(false); // false flag indicates rebuild request was superceded
                }

                // Save queued request
                this.building.queued = { resolve, reject };
                log('trace', `Scene.rebuildGeometry(): queuing request`);
                return;
            }

            // Track tile build state
            this.building = { resolve, reject };

            // Profiling
            if (this.debug.profile.geometry_build) {
                this._profile('rebuildGeometry');
            }

            // Update config (in case JS objects were manipulated directly)
            if (sync) {
                this.syncConfigToWorker({ serialize_funcs });
                StyleManager.compile(this.updateActiveStyles(), this); // only recompile newly active styles
            }
            this.resetFeatureSelection();
            this.resetTime();

            // Rebuild visible tiles
            this.tile_manager.pruneToVisibleTiles();
            this.tile_manager.forEachTile(tile => {
                if (!sources || sources.indexOf(tile.source.name) > -1) {
                    this.tile_manager.buildTile(tile);
                }
            });
            this.tile_manager.updateTilesForView(); // picks up additional tiles for any new/changed data sources
            this.tile_manager.checkBuildQueue();    // resolve immediately if no tiles to build
        }).then(() => {
            // Profiling
            if (this.debug.profile.geometry_build) {
                this._profileEnd('rebuildGeometry');
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
                log('debug', `Scene: starting queued rebuildGeometry() request`);
                this.rebuildGeometry().then(queued.resolve, queued.reject);
            }
        }
    }

    /**
       Load (or reload) the scene config
       @return {Promise}
    */
    loadScene(config_source = null, config_path = null) {
        this.config_source = config_source || this.config_source;

        if (typeof this.config_source === 'string') {
            this.config_path = Utils.pathForURL(config_path || this.config_source);
        }
        else {
            this.config_path = Utils.pathForURL(config_path);
        }

        return SceneLoader.loadScene(this.config_source, this.config_path).then(config => {
            this.config = config;
            this.trigger('load', { config: this.config });
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

        if (source.data && typeof source.data === 'object') {
            source.url = Utils.createObjectURL(new Blob([JSON.stringify(source.data)]));
            delete source.data;
        }

        if (load) {
            return this.updateConfig({ rebuild: { sources: [name] } });
        } else {
            return this.rebuild({ sources: [name] });
        }
    }

    createDataSources() {
        let reset = []; // sources to reset
        let prev_source_names = Object.keys(this.sources);

        for (var name in this.config.sources) {
            let source = this.config.sources[name];
            let prev_source = this.sources[name];

            try {
                this.sources[name] = DataSource.create(Object.assign({}, source, {name}), this.sources);
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
        for (let s of prev_source_names) {
            if (!this.config.sources[s]) {
                delete this.sources[s]; // TODO: remove from workers too?
                reset.push(s);
            }
        }

        // Remove tiles from sources that have changed
        if (reset.length > 0) {
            this.tile_manager.removeTiles(tile => {
                return (reset.indexOf(tile.source.name) > -1);
            });
        }

        // Mark sources that generate geometry tiles
        // (all except those that are only raster sources attached to other sources)
        for (let layer of Utils.values(this.config.layers)) {
            if (layer.data && this.sources[layer.data.source]) {
                this.sources[layer.data.source].geometry_tiles = true;
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
        this.styles = StyleManager.build(this.config.styles, this);

        // Optionally set GL context (used when initializing or re-initializing GL resources)
        for (var style of Utils.values(this.styles)) {
            style.setGL(this.gl);
        }

        // Find & compile active styles
        this.updateActiveStyles();
        StyleManager.compile(Object.keys(this.active_styles), this);

        this.dirty = true;
    }

    updateActiveStyles() {
        // Make a set of currently active styles (used in a layer)
        // Note: doesn't actually check if any geometry matches the layer, just that the style is potentially renderable
        let prev_styles = Object.keys(this.active_styles || {});
        this.active_styles = {};
        let animated = false; // is any active style animated?
        for (let layer of Utils.recurseValues(this.config.layers)) {
            if (layer && layer.draw) {
                for (let [name, group] of Utils.entries(layer.draw)) {
                    // TODO: warn on non-object draw group
                    if (group != null && typeof group === 'object' && group.visible !== false) {
                        let style_name = group.style || name;
                        let styles = [style_name];

                        // optional additional outline style
                        if (group.outline && group.outline.style) {
                            styles.push(group.outline.style);
                        }

                        styles = styles.filter(x => this.styles[x]).forEach(style_name => {
                            let style = this.styles[style_name];
                            if (style) {
                                this.active_styles[style_name] = true;
                                if (style.animated) {
                                    animated = true;
                                }
                            }
                        });
                    }
                }
            }
        }

        // Use explicitly set scene animation flag if defined, otherwise turn on animation
        // if there are any animated styles
        this.animated = this.config.scene.animated !== undefined ? this.config.scene.animated : animated;

        // Compile newly active styles
        return Object.keys(this.active_styles).filter(s => prev_styles.indexOf(s) === -1);
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
        this.updateConfig();
    }

    // Update scene config, and optionally rebuild geometry
    // rebuild can be boolean, or an object containing rebuild options to passthrough
    updateConfig({ rebuild = true, serialize_funcs } = {}) {
        this.generation++;
        this.updating++;
        this.config.scene = this.config.scene || {};

        StyleManager.init();
        this.view.reset();
        this.createLights();
        this.createDataSources();
        this.loadTextures();
        this.setBackground();
        CanvasText.loadFonts(this.config.fonts);

        // TODO: detect changes to styles? already (currently) need to recompile anyway when camera or lights change
        this.updateStyles();

        // Optionally rebuild geometry
        let done = rebuild ?
            this.rebuildGeometry(Object.assign({ serialize_funcs }, typeof rebuild === 'object' && rebuild)) :
            this.syncConfigToWorker({ serialize_funcs }); // rebuildGeometry() also syncs config

        // Finish by updating bounds and re-rendering
        return done.then(() => {
            this.updating--;
            this.view.updateBounds();
            this.requestRedraw();
        });
    }

    // Serialize config and send to worker
    syncConfigToWorker({ serialize_funcs = true } = {}) {
        // Tell workers we're about to rebuild (so they can update styles, etc.)
        this.config_serialized =
            serialize_funcs ? Utils.serializeWithFunctions(this.config) : JSON.stringify(this.config);
        return WorkerBroker.postMessage(this.workers, 'self.updateConfig', {
            config: this.config_serialized,
            generation: this.generation,
            introspection: this.introspection
        });
    }

    resetFeatureSelection() {
        if (!this.selection) {
            this.selection = new FeatureSelection(this.gl, this.workers);
        }
        else if (this.workers) {
            WorkerBroker.postMessage(this.workers, 'self.resetFeatureSelection');
        }
    }

    // Gets the current feature selection map size across all workers. Returns a promise.
    getFeatureSelectionMapSize() {
        if (this.fetching_selection_map) {
            return Promise.reject();
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
        if (this.queue_screenshot != null) {
            return this.queue_screenshot.promise; // only capture one screenshot at a time
        }

        this.requestRedraw();

        // Will resolve once rendering is complete and render buffer is captured
        this.queue_screenshot = {};
        this.queue_screenshot.promise = new Promise((resolve, reject) => {
            this.queue_screenshot.resolve = resolve;
            this.queue_screenshot.reject = reject;
        });
        return this.queue_screenshot.promise;
    }

    // Called after rendering, captures render buffer and resolves promise with image data
    completeScreenshot () {
        if (this.queue_screenshot != null) {
            // Get data URL, convert to blob
            // Strip host/mimetype/etc., convert base64 to binary without UTF-8 mangling
            // Adapted from: https://gist.github.com/unconed/4370822
            var url = this.canvas.toDataURL('image/png');
            var data = atob(url.slice(22));
            var buffer = new Uint8Array(data.length);
            for (var i = 0; i < data.length; ++i) {
                buffer[i] = data.charCodeAt(i);
            }
            var blob = new Blob([buffer], { type: 'image/png' });

            // Resolve with screenshot data
            this.queue_screenshot.resolve({ url, blob });
            this.queue_screenshot = null;
        }
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
            profile: {
                geometry_build: false
            },

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
                for (let tile of scene.tile_manager.getRenderableTiles()) {
                    for (let style in tile.meshes) {
                        counts[style] = counts[style] || 0;
                        counts[style] += tile.meshes[style].geometry_count;
                    }
                }
                return counts;
            },

            geometryCountByBaseStyle () {
                let style_counts = scene.debug.geometryCountByStyle();
                let counts = {};
                for (let style in style_counts) {
                    let base = scene.styles[style].built_in ? style : scene.styles[style].base;
                    counts[base] = counts[base] || 0;
                    counts[base] += style_counts[style];
                }
                return counts;
            }
        };
    }

}
