import Geo from './geo';
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
import Camera from './camera';
import Light from './light';
import TileManager from './tile_manager';
import DataSource from './sources/data_source';
import FeatureSelection from './selection';
import RenderState from './gl/render_state';

import {Polygons} from './styles/polygons/polygons';
import {Lines} from './styles/lines/lines';
import {Points} from './styles/points/points';
import {TextStyle} from './styles/text/text';

// Add built-in rendering styles
StyleManager.register(Polygons);
StyleManager.register(Lines);
StyleManager.register(Points);
StyleManager.register(TextStyle);

import log from 'loglevel';
import glMatrix from 'gl-matrix';
let mat4 = glMatrix.mat4;
let mat3 = glMatrix.mat3;
let vec3 = glMatrix.vec3;

// Load scene definition: pass an object directly, or a URL as string to load remotely
export default class Scene {

    constructor(config_source, options) {
        options = options || {};
        subscribeMixin(this);

        this.initialized = false;
        this.initializing = false;
        this.sources = {};

        this.tile_manager = TileManager;
        this.tile_manager.init(this);
        this.num_workers = options.numWorkers || 2;
        this.continuous_zoom = (typeof options.continuousZoom === 'boolean') ? options.continuousZoom : true;
        this.tile_simplification_level = 0; // level-of-detail downsampling to apply to tile loading
        this.allow_cross_domain_workers = (options.allowCrossDomainWorkers === false ? false : true);
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
        this.frame = 0;
        this.resetTime();

        this.zoom = null;
        this.center = null;

        this.zooming = false;
        this.preserve_tiles_within_zoom = 1;
        this.panning = false;
        this.container = options.container;

        this.camera = null;
        this.lights = null;
        this.background = null;

        // Model-view matrices
        // 64-bit versions are for CPU calcuations
        // 32-bit versions are downsampled and sent to GPU
        this.modelMatrix = new Float64Array(16);
        this.modelMatrix32 = new Float32Array(16);
        this.modelViewMatrix = new Float64Array(16);
        this.modelViewMatrix32 = new Float32Array(16);
        this.normalMatrix = new Float64Array(9);
        this.normalMatrix32 = new Float32Array(9);
        this.inverseNormalMatrix32 = new Float32Array(9);

        this.selection = null;
        this.texture_listener = null;

        this.updating = 0;
        this.generation = 0; // an id that is incremented each time the scene config is invalidated
        this.setupDebug();

        this.logLevel = options.logLevel || 'warn';
        log.setLevel(this.logLevel);
    }

    // Load (or reload) scene config
    // Optionally specify new scene file URL
    load(config_source = null, config_path = null) {
        if (this.initializing) {
            return Promise.resolve();
        }

        this.updating++;
        this.initialized = false;
        this.initializing = true;

        // Load scene definition (sources, styles, etc.), then create styles & workers
        return this.loadScene(config_source, config_path)
            .then(() => this.createWorkers())
            .then(() => {
                this.createCanvas();
                this.resetFeatureSelection();

                if (!this.texture_listener) {
                    this.texture_listener = {
                        update: () => this.dirty = true,
                        warning: (data) => this.trigger('warning', Object.assign({ type: 'textures' }, data))
                    };
                    Texture.subscribe(this.texture_listener);
                }

                // Remove tiles before rebuilding
                this.tile_manager.removeTiles(tile => !tile.visible);
                return this.updateConfig({ rebuild: true });
            }).then(() => {
                this.updating--;
                this.initializing = false;
                this.initialized = true;
                this.last_valid_config_source = this.config_source;
                this.last_valid_config_path = this.config_path;

                if (this.render_loop !== false) {
                    this.setupRenderLoop();
                }
                this.requestRedraw();
        }).catch(error => {
            this.initializing = false;
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
                log.warn(message, error);
                log.info(`Scene.load() reverting to last valid configuration`);
                return this.load(this.last_valid_config_source, this.last_valid_config_path);
            }
            log.error(message, error);
            throw error;
        });
    }

    // For API compatibility
    reload(config_source = null, config_path = null) {
        return this.load(config_source, config_path);
    }

    destroy() {
        this.initialized = false;
        this.render_loop_stop = true; // schedule render loop to stop

        this.unsubscribeAll(); // clear all event listeners

        Texture.unsubscribe(this.texture_listener);
        this.texture_listener = null;

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

            this.gl = null;
        }

        this.sources = {};

        if (Array.isArray(this.workers)) {
            this.workers.forEach((worker) => {
                worker.terminate();
            });
            this.workers = null;
        }

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
    }

    // Get the URL to load the web worker from
    getWorkerUrl() {
        let worker_url = this.worker_url || Utils.findCurrentURL('tangram.debug.js', 'tangram.min.js');

        if (!worker_url) {
            throw new Error("Can't load worker because couldn't find base URL that library was loaded from");
        }

        if (this.allow_cross_domain_workers) {
            let body = `importScripts('${worker_url}');`;
            return Utils.createObjectURL(new Blob([body], { type: 'application/javascript' }));
        }
        return worker_url;
    }

    // Web workers handle heavy duty tile construction: networking, geometry processing, etc.
    createWorkers() {
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

            worker.addEventListener('message', this.workerLogMessage.bind(this));
            WorkerBroker.addWorker(worker);

            log.debug(`Scene.makeWorkers: initializing worker ${id}`);
            let _id = id;
            queue.push(WorkerBroker.postMessage(worker, 'self.init', id, this.num_workers, Utils.device_pixel_ratio).then(
                (id) => {
                    log.debug(`Scene.makeWorkers: initialized worker ${id}`);
                    return id;
                },
                (error) => {
                    log.error(`Scene.makeWorkers: failed to initialize worker ${_id}:`, error);
                    return Promise.reject(error);
                })
            );
        }

        this.next_worker = 0;
        return Promise.all(queue);
    }

    // Round robin selection of next worker
    nextWorker() {
        var worker = this.workers[this.next_worker];
        this.next_worker = (this.next_worker + 1) % this.workers.length;
        return worker;
    }

    /**
        Set the map view, can be passed an object with lat/lng and/or zoom
    */
    setView({ lng, lat, zoom } = {}) {
        var changed = false;

        // Set center
        if (typeof lng === 'number' && typeof lat === 'number') {
            if (!this.center || lng !== this.center.lng || lat !== this.center.lat) {
                changed = true;
                this.center = { lng: Geo.wrapLng(lng), lat };
            }
        }

        // Set zoom
        if (typeof zoom === 'number' && zoom !== this.zoom) {
            changed = true;
            this.setZoom(zoom);
        }

        if (changed) {
            this.updateBounds();
        }
        return changed;
    }

    startZoom() {
        this.last_zoom = this.zoom;
        this.zooming = true;
    }

    // Choose the base zoom level to use for a given fractional zoom
    baseZoom(zoom) {
        return Math.floor(zoom);
    }

    // For a given view zoom, what tile zoom should be loaded?
    tileZoom(view_zoom) {
        return this.baseZoom(view_zoom) - this.tile_simplification_level;
    }

    // For a given tile zoom, what style zoom should be used?
    styleZoom(tile_zoom) {
        return this.baseZoom(tile_zoom) + this.tile_simplification_level;
    }

    setZoom(zoom) {
        this.zooming = false;
        let tile_zoom = this.tileZoom(zoom);

        if (!this.continuous_zoom) {
            zoom = tile_zoom;
        }

        if (tile_zoom !== this.tileZoom(this.last_zoom)) {
            // Remove tiles outside current zoom that are still loading
            this.tile_manager.removeTiles(tile => {
                if (tile.loading && this.tileZoom(tile.coords.z) !== tile_zoom) {
                    log.trace(`removed ${tile.key} (was loading, but outside current zoom)`);
                    return true;
                }
            });
        }

        this.last_zoom = this.zoom;
        this.zoom = zoom;
        this.tile_zoom = tile_zoom;

        this.updateBounds();

        this.dirty = true;
    }

    viewReady() {
        if (this.css_size == null || this.center == null || this.zoom == null || Object.keys(this.sources).length === 0) {
             return false;
        }
        return true;
    }

    // Calculate viewport bounds based on current center and zoom
    updateBounds() {
        // TODO: better concept of "readiness" state?
        if (!this.viewReady()) {
            return;
        }

        this.meters_per_pixel = Geo.metersPerPixel(this.zoom);

        // Size of the half-viewport in meters at current zoom
        this.viewport_meters = {
            x: this.css_size.width * this.meters_per_pixel,
            y: this.css_size.height * this.meters_per_pixel
        };

        // Center of viewport in meters, and tile
        let [x, y] = Geo.latLngToMeters([this.center.lng, this.center.lat]);
        this.center_meters = { x, y };

        let z = this.tileZoom(this.zoom);
        this.center_tile = Geo.tileForMeters([this.center_meters.x, this.center_meters.y], z);

        this.bounds_meters = {
            sw: {
                x: this.center_meters.x - this.viewport_meters.x / 2,
                y: this.center_meters.y - this.viewport_meters.y / 2
            },
            ne: {
                x: this.center_meters.x + this.viewport_meters.x / 2,
                y: this.center_meters.y + this.viewport_meters.y / 2
            }
        };

        this.tile_manager.updateTilesForView();

        this.trigger('move');
        this.dirty = true;
    }

    findVisibleTileCoordinates({ buffer } = {}) {
        if (!this.bounds_meters) {
            return [];
        }

        let z = this.tileZoom(this.zoom);
        let sw = Geo.tileForMeters([this.bounds_meters.sw.x, this.bounds_meters.sw.y], z);
        let ne = Geo.tileForMeters([this.bounds_meters.ne.x, this.bounds_meters.ne.y], z);
        buffer = buffer || 0;

        let coords = [];
        for (let x = sw.x - buffer; x <= ne.x + buffer; x++) {
            for (let y = ne.y - buffer; y <= sw.y + buffer; y++) {
                coords.push({ x, y, z });
            }
        }
        return coords;
    }

    // Remove tiles too far outside of view
    pruneTileCoordinatesForView(border_buffer = 2) {
        if (!this.viewReady()) {
            return;
        }

        // Remove tiles that are a specified # of tiles outside of the viewport border
        let border_tiles = [
            Math.ceil((Math.floor(this.css_size.width / Geo.tile_size) + 2) / 2),
            Math.ceil((Math.floor(this.css_size.height / Geo.tile_size) + 2) / 2)
        ];
        let style_zoom = this.tileZoom(this.zoom);

        this.tile_manager.removeTiles(tile => {
            // Ignore visible tiles
            if (tile.visible) {
                return false;
            }

            // Discard if too far from current zoom
            let zdiff = tile.coords.z - style_zoom;
            if (Math.abs(zdiff) > this.preserve_tiles_within_zoom) {
                return true;
            }

            // Handle tiles at different zooms
            let ztrans = Math.pow(2, zdiff);
            let coords = {
                x: Math.floor(tile.coords.x / ztrans),
                y: Math.floor(tile.coords.y / ztrans)
            };

            // Discard tiles outside an area surrounding the viewport
            if (Math.abs(coords.x - this.center_tile.x) - border_tiles[0] > border_buffer) {
                log.trace(`Scene: remove tile ${tile.key} (as ${coords.x}/${coords.y}/${style_zoom}) for being too far out of visible area ***`);
                return true;
            }
            else if (Math.abs(coords.y - this.center_tile.y) - border_tiles[1] > border_buffer) {
                log.trace(`Scene: remove tile ${tile.key} (as ${coords.x}/${coords.y}/${style_zoom}) for being too far out of visible area ***`);
                return true;
            }
            return false;
        });
    }

    // Resize the map when device pixel ratio changes, e.g. when switching between displays
    updateDevicePixelRatio () {
        if (Utils.updateDevicePixelRatio()) {
            WorkerBroker.postMessage(this.workers, 'self.updateDevicePixelRatio', Utils.device_pixel_ratio)
                .then(() => this.rebuild())
                .then(() => this.resizeMap(this.css_size.width, this.css_size.height));
        }
    }

    resizeMap(width, height) {
        this.dirty = true;

        this.css_size = { width: width, height: height };
        this.device_size = {
            width: Math.round(this.css_size.width * Utils.device_pixel_ratio),
            height: Math.round(this.css_size.height * Utils.device_pixel_ratio)
        };
        this.view_aspect = this.css_size.width / this.css_size.height;
        this.updateBounds();

        if (this.canvas) {
            this.canvas.style.width = this.css_size.width + 'px';
            this.canvas.style.height = this.css_size.height + 'px';
            this.canvas.width = this.device_size.width;
            this.canvas.height = this.device_size.height;

            if (this.gl) {
                this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
                this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
            }
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
        this.tile_manager.loadQueuedCoordinates();

        // Render on demand
        var will_render = !(
            this.dirty === false ||
            this.initialized === false ||
            this.updating > 0 ||
            this.viewReady() === false
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

        // Post-render loop hook
        if (typeof this.postUpdate === 'function') {
            this.postUpdate(will_render);
        }

        // Redraw every frame if animating
        if (this.animated === true) {
            this.dirty = true;
        }

        this.frame++;
        log.trace('Scene.render()');
        return true;
    }

    render() {
        var gl = this.gl;

        // Map transforms
        if (!this.center_meters) {
            return;
        }

        // Update styles, camera, lights
        this.camera.update();
        Object.keys(this.active_styles).forEach(i => this.styles[i].update());
        Object.keys(this.lights).forEach(i => this.lights[i].update());

        // Renderable tile list
        this.renderable_tiles = this.tile_manager.getRenderableTiles();
        this.renderable_tiles_count = this.renderable_tiles.length;

        // Render main pass
        this.render_count = this.renderPass();

        // Render selection pass (if needed)
        if (this.selection.pendingRequests()) {
            if (this.panning) {
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

        if (this.render_count !== this.last_render_count) {
            this.getFeatureSelectionMapSize().then(size => {
                log.info(`Scene: rendered ${this.render_count} primitives (${size} features in selection map)`);
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
        for (let style of styles) {
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
                program.uniform('2f', 'u_resolution', this.device_size.width, this.device_size.height);
                program.uniform('1f', 'u_time', ((+new Date()) - this.start_time) / 1000);
                program.uniform('3f', 'u_map_position', this.center_meters.x, this.center_meters.y, this.zoom);
                program.uniform('1f', 'u_meters_per_pixel', this.meters_per_pixel);
                program.uniform('1f', 'u_device_pixel_ratio', Utils.device_pixel_ratio);

                this.camera.setupProgram(program);
                for (let i in this.lights) {
                    this.lights[i].setupProgram(program);
                }
            }

            // Tile-specific state
            // TODO: calc these once per tile (currently being needlessly re-calculated per-tile-per-style)

            // Tile origin
            program.uniform('3f', 'u_tile_origin', tile.min.x, tile.min.y, tile.style_zoom);

            // Model matrix - transform tile space into world space (meters, absolute mercator position)
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, vec3.fromValues(tile.min.x, tile.min.y, 0));
            mat4.scale(this.modelMatrix, this.modelMatrix, vec3.fromValues(tile.span.x / Geo.tile_scale, -1 * tile.span.y / Geo.tile_scale, 1)); // scale tile local coords to meters
            mat4.copy(this.modelMatrix32, this.modelMatrix);
            program.uniform('Matrix4fv', 'u_model', false, this.modelMatrix32);

            // Model view matrix - transform tile space into view space (meters, relative to camera)
            mat4.multiply(this.modelViewMatrix32, this.camera.viewMatrix, this.modelMatrix);
            program.uniform('Matrix4fv', 'u_modelView', false, this.modelViewMatrix32);

            // Normal matrices - transforms surface normals into view space
            mat3.normalFromMat4(this.normalMatrix32, this.modelViewMatrix32);
            mat3.invert(this.inverseNormalMatrix32, this.normalMatrix32);
            program.uniform('Matrix3fv', 'u_normalMatrix', false, this.normalMatrix32);
            program.uniform('Matrix3fv', 'u_inverseNormalMatrix', false, this.inverseNormalMatrix32);

            // Render tile
            tile.meshes[style].render();
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

        // Reset frame state
        let gl = this.gl;

        if (clear_color) {
            gl.clearColor(...this.background.color);
        }

        if (clear_depth) {
            gl.depthMask(true); // always clear depth if requested, even if depth write will be turned off
        }

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
        depth_test = (depth_test === false) ? false : true;     // default true
        depth_write = (depth_write === false) ? false : true;   // default true
        cull_face = (cull_face === false) ? false : true;       // default true
        blend = (blend != null) ? blend : false;                // default false

        // Reset frame state
        let gl = this.gl;

        RenderState.depth_test.set({ depth_test: depth_test, depth_func: gl.LEQUAL });
        RenderState.depth_write.set({ depth_write: depth_write });
        RenderState.culling.set({ cull: cull_face, face: gl.BACK });

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
            log.debug("Scene.getFeatureAt() called before scene was initialized");
            return Promise.resolve();
        }

        // Point scaled to [0..1] range
        var point = {
            x: pixel.x * Utils.device_pixel_ratio / this.device_size.width,
            y: pixel.y * Utils.device_pixel_ratio / this.device_size.height
        };

        this.dirty = true; // need to make sure the scene re-renders for these to be processed
        return this.selection.getFeatureAt(point).catch(r => Promise.resolve(r));
    }

    // Rebuild geometry, without re-parsing the config or re-compiling styles
    // TODO: detect which elements need to be refreshed/rebuilt (stylesheet changes, etc.)
    rebuild(options) {
        return this.rebuildGeometry(options);
    }

    // Rebuild all tiles
    rebuildGeometry({ sync = true } = {}) {
        return new Promise((resolve, reject) => {
            // Skip rebuild if already in progress
            if (this.building) {
                // Queue up to one rebuild call at a time, only save last request
                if (this.building.queued && this.building.queued.reject) {
                    // notify previous request that it did not complete
                    log.debug('Scene.rebuildGeometry: request superceded by a newer call');
                    this.building.queued.resolve(false); // false flag indicates rebuild request was superceded
                }

                // Save queued request
                this.building.queued = { resolve, reject };
                log.trace(`Scene.rebuildGeometry(): queuing request`);
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
                this.syncConfigToWorker();
                StyleManager.compile(this.updateActiveStyles(), this); // only recompile newly active styles
            }
            this.resetFeatureSelection();
            this.resetTime();

            // Rebuild visible tiles, sorted from center
            let build = [];
            this.tile_manager.forEachTile((tile) => {
                if (tile.visible) {
                    build.push(tile);
                }
                else {
                    this.tile_manager.removeTile(tile.key);
                }
            });
            this.tile_manager.buildTiles(build);
        }).then(() => {
            // Profiling
            if (this.debug.profile.geometry_build) {
                this._profileEnd('rebuildGeometry');
            }
        });
    }

    // Tile manager finished building tiles
    tileManagerBuildDone() {
        if (this.building) {
            log.info(`Scene: build geometry finished`);
            if (this.building.resolve) {
                this.building.resolve(true);
            }

            // Another rebuild queued?
            var queued = this.building.queued;
            this.building = null;
            if (queued) {
                log.debug(`Scene: starting queued rebuildGeometry() request`);
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

    loadDataSources() {
        for (var name in this.config.sources) {
            let source = this.config.sources[name];
            this.sources[name] = DataSource.create(Object.assign({}, source, {name}));

            if (!this.sources[name]) {
                delete this.sources[name];
                log.warn(`Scene: could not create data source`, source);
                this.trigger('warning', { type: 'sources', source, message: `Could not create data source` });
            }
        }
    }

    // Load all textures in the scene definition
    loadTextures() {
        return Texture.createFromObject(this.gl, this.config.textures);
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
        // Make a set of currently active styles (used in a draw rule)
        // Note: doesn't actually check if any geometry matches the rule, just that the style is potentially renderable
        let prev_styles = Object.keys(this.active_styles || {});
        this.active_styles = {};
        var animated = false; // is any active style animated?
        for (var rule of Utils.recurseValues(this.config.layers)) {
            if (rule && rule.draw) {
                for (let [name, group] of Utils.entries(rule.draw)) {
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

    // Create camera
    createCamera() {
        let active_camera = this._active_camera;
        if (active_camera) {
            this.camera = Camera.create(active_camera, this, this.config.cameras[this._active_camera]);

            // TODO: replace this and move all position info to camera
            this.camera.updateScene();
        }
    }

    // Get active camera - for public API
    getActiveCamera() {
        return this._active_camera;
    }

    // Set active camera and recompile - for public API
    setActiveCamera(name) {
        this._active_camera = name;
        this.updateConfig();
        return this._active_camera;
    }

    // Internal management of active camera
    get _active_camera() {
        if (this.config && this.config.cameras) {
            for (var name in this.config.cameras) {
                if (this.config.cameras[name].active) {
                    return name;
                }
            }
        }
    }

    set _active_camera(name) {
        var prev = this._active_camera;

        // Set new active camera
        if (this.config.cameras[name]) {
            this.config.cameras[name].active = true;

            // Clear previously active camera
            if (prev && prev !== name && this.config.cameras[prev]) {
                delete this.config.cameras[prev].active;
            }
        }
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
                this.lights[light.name] = Light.create(this, light);
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
    }

    // Update scene config, and optionally rebuild geometry
    updateConfig({ rebuild } = {}) {
        this.generation++;
        this.updating++;
        this.config.scene = this.config.scene || {};

        StyleManager.init();
        this.createCamera();
        this.createLights();
        this.loadDataSources();
        this.loadTextures();
        this.setBackground();
        this.updateBounds();

        // TODO: detect changes to styles? already (currently) need to recompile anyway when camera or lights change
        this.updateStyles();
        this.syncConfigToWorker();
        if (rebuild) {
            return this.rebuildGeometry().then(() => { this.updating--; this.requestRedraw(); });
        }
        else {
            this.updating--;
            this.requestRedraw();
            return Promise.resolve();
        }
    }

    // Serialize config and send to worker
    syncConfigToWorker() {
        // Tell workers we're about to rebuild (so they can update styles, etc.)
        this.config_serialized = Utils.serializeWithFunctions(this.config);
        WorkerBroker.postMessage(this.workers, 'self.updateConfig', {
            config: this.config_serialized,
            generation: this.generation
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


    // Stats/debug/profiling methods

    // Log messages pass through from web workers
    workerLogMessage(event) {
        if (event.data.type !== 'log') {
            return;
        }

        var { worker_id, level, msg } = event.data;

        if (log[level]) {
            log[level](`worker ${worker_id}:`,  ...msg);
        }
        else {
            log.error(`Scene.workerLogMessage: unrecognized log level ${level}`);
        }
    }

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
                            log.info(`Profiled rebuild ${num} times: ${avg} avg (${Math.min(...times)} min, ${Math.max(...times)} max)`);
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

// Static methods/state

Scene.create = function (config, options = {}) {
    return new Scene(config, options);
};
