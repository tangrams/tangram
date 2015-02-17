/*global Scene */
import Geo from './geo';
import Utils from './utils/utils';
import WorkerBroker from './utils/worker_broker';
import subscribeMixin from './utils/subscribe';
import Context from './gl/context';
import Builders from './styles/builders';
import ShaderProgram from './gl/shader_program';
import Texture from './gl/texture';
import {StyleManager} from './styles/style_manager';
import {StyleParser} from './styles/style_parser';
import Camera from './camera';
import Lighting from './light';
import Tile from './tile';
import TileSource from './tile_source';
import FeatureSelection from './selection';

import log from 'loglevel';
import glMatrix from 'gl-matrix';
var mat4 = glMatrix.mat4;
var vec3 = glMatrix.vec3;

// Global setup
if (Utils.isMainThread) {
    // On main thread only (skip in web worker)
    Utils.requestAnimationFramePolyfill();
}

Scene.tile_scale = 4096; // coordinates are locally scaled to the range [0, tile_scale]
Geo.setTileScale(Scene.tile_scale);
Builders.setTileScale(Scene.tile_scale);
ShaderProgram.defines.TILE_SCALE = Scene.tile_scale;

// Load scene definition: pass an object directly, or a URL as string to load remotely
export default function Scene(config_source, options) {
    options = options || {};
    subscribeMixin(this);

    this.initialized = false;
    this.initializing = false;
    this.sources = {};

    this.tiles = {};
    this.visible_tiles = {};
    this.queued_tiles = [];
    this.num_workers = options.numWorkers || 2;
    this.allow_cross_domain_workers = (options.allowCrossDomainWorkers === false ? false : true);
    this.worker_url = options.workerUrl;

    this.config = null;
    this.config_source = config_source;
    this.config_serialized = null;

    this.styles = null;

    this.building = null;                           // tracks current scene building state (tiles being built, etc.)
    this.dirty = true;                              // request a redraw
    this.animated = false;                          // request redraw every frame
    this.preUpdate = options.preUpdate;             // optional pre-render loop hook
    this.postUpdate = options.postUpdate;           // optional post-render loop hook
    this.render_loop = !options.disableRenderLoop;  // disable render loop - app will have to manually call Scene.render() per frame
    this.frame = 0;
    this.resetTime();

    this.zoom = null;
    this.center = null;
    this.device_pixel_ratio = window.devicePixelRatio || 1;

    this.zooming = false;
    this.panning = false;
    this.container = options.container;

    // Model-view matrices
    // 64-bit versions are for CPU calcuations
    // 32-bit versions are downsampled and sent to GPU
    this.modelMatrix = new Float64Array(16);
    this.modelMatrix32 = new Float32Array(16);
    this.modelViewMatrix = new Float64Array(16);
    this.modelViewMatrix32 = new Float32Array(16);

    this.selection = null;
    this.texture_listener = null;

    // Debug config
    this.debug = {
        profile: {
            geometry_build: false
        }
    };

    this.logLevel = options.logLevel || 'info';
    log.setLevel(this.logLevel);
}

Scene.create = function (config, options = {}) {
    return new Scene(config, options);
};

Scene.prototype.init = function () {
    if (this.initialized) {
        return Promise.resolve();
    }
    this.initializing = true;

    // Load scene definition (sources, styles, etc.), then create styles & workers
    return new Promise((resolve, reject) => {
        this.loadScene().then(() => {

            this.createWorkers().then(() => {
                this.createCanvas();
                this.selection = new FeatureSelection(this.gl, this.workers);

                this.texture_listener = { update: () => this.dirty = true };
                Texture.subscribe(this.texture_listener);

                // Loads rendering styles from config, sets GL context and compiles programs
                this.updateConfig();

                this.initializing = false;
                this.initialized = true;
                resolve();

                if (this.render_loop !== false) {
                    this.setupRenderLoop();
                }
            }).catch(e => { throw e; });
        }).catch(e => { reject(e); });
    });
};

Scene.prototype.destroy = function () {
    this.initialized = false;
    this.renderLoop = () => {}; // set to no-op because a null can cause requestAnimationFrame to throw

    this.unsubscribeAll(); // clear all event listeners

    Texture.unsubscribe(this.texture_listener);
    this.texture_listener = null;

    if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
        this.canvas = null;
    }
    this.container = null;

    if (this.gl) {
        this.gl.deleteFramebuffer(this.fbo);
        this.fbo = null;

        Texture.destroy(this.gl);
        StyleManager.destroy(this.gl);
        this.styles = {};

        this.gl = null;
    }

    if (Array.isArray(this.workers)) {
        this.workers.forEach((worker) => {
            worker.terminate();
        });
        this.workers = null;
    }
    this.sources = {};
    this.tiles = {}; // TODO: probably destroy each tile separately too
};

Scene.prototype.createCanvas = function () {
    this.container = this.container || document.body;
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = 0;
    this.canvas.style.left = 0;
    this.canvas.style.zIndex = -1;
    this.container.appendChild(this.canvas);

    this.gl = Context.getContext(this.canvas, { alpha: false /*premultipliedAlpha: false*/ });
    this.resizeMap(this.container.clientWidth, this.container.clientHeight);
};

Scene.prototype.createObjectURL = function () {
    return (window.URL && window.URL.createObjectURL) || (window.webkitURL && window.webkitURL.createObjectURL);
};

Scene.loadWorkerUrl = function (scene) {
    var worker_url = scene.worker_url || Utils.findCurrentURL('tangram.debug.js', 'tangram.min.js'),
        createObjectURL = scene.createObjectURL();

    return new Promise((resolve, reject) => {
        if (!worker_url) {
            reject(new Error("Can't load worker because couldn't find base URL that library was loaded from"));
            return;
        }

        if (createObjectURL && scene.allow_cross_domain_workers) {
            var body = `importScripts('${worker_url}');`;
            var worker_local_url = createObjectURL(new Blob([body], { type: 'application/javascript' }));
            resolve(worker_local_url);
        } else {
            resolve(worker_url);
        }

    });

};


// Web workers handle heavy duty tile construction: networking, geometry processing, etc.
Scene.prototype.createWorkers = function () {
    return new Promise((resolve, reject) => {
        Scene.loadWorkerUrl(this).then((worker_url) => {
            this.makeWorkers(worker_url).then(resolve, reject);
        });
    });
};


// Instantiate workers from URL, init event handlers
Scene.prototype.makeWorkers = function (url) {
    var queue = [];

    this.workers = [];
    for (var id=0; id < this.num_workers; id++) {
        var worker = new Worker(url);
        this.workers[id] = worker;

        worker.addEventListener('message', this.workerLogMessage.bind(this));
        WorkerBroker.addWorker(worker);

        log.debug(`Scene.makeWorkers: initializing worker ${id}`);
        let _id = id;
        queue.push(WorkerBroker.postMessage(worker, 'init', id).then(
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
    this.selection_map_worker_size = {};

    return Promise.all(queue);
};

// Round robin selection of next worker
Scene.prototype.nextWorker = function () {
    var worker = this.workers[this.next_worker];
    this.next_worker = (this.next_worker + 1) % this.workers.length;
    return worker;
};

/**
    Set the map view, can be passed an object with lat/lng and/or zoom
*/
Scene.prototype.setView = function ({ lng, lat, zoom } = {}) {
    var changed = false;

    // Set center
    if (lng && lat) {
        changed = changed || !this.center || lng !== this.center.lng || lat !== this.center.lat;
        this.center = { lng, lat };
    }

    // Set zoom
    if (zoom) {
        changed = changed || zoom !== this.zoom;
        this.setZoom(zoom);
    }

    if (changed) {
        this.updateBounds();
    }
    return changed;
};

Scene.prototype.startZoom = function () {
    this.last_zoom = this.zoom;
    this.zooming = true;
};

// Choose the base zoom level to use for a given fractional zoom
Scene.prototype.baseZoom = function (zoom) {
    return Math.round(zoom);
};

Scene.prototype.preserve_tiles_within_zoom = 2;
Scene.prototype.setZoom = function (zoom) {
    this.zooming = false;

    // Schedule tiles for removal on integer zoom level change
    if (this.baseZoom(zoom) !== this.baseZoom(this.last_zoom)) {
        var below = this.baseZoom(zoom);
        var above = this.baseZoom(zoom);

        log.trace(`scene.last_zoom: ${this.last_zoom}`);
        if (Math.abs(zoom - this.last_zoom) <= this.preserve_tiles_within_zoom) {
            below -= this.preserve_tiles_within_zoom;
            above += this.preserve_tiles_within_zoom;
        }

        log.debug(`removing tiles outside range [${below}, ${above}]`);
        this.removeTilesOutsideZoomRange(below, above);
    }


    this.last_zoom = this.zoom;
    this.zoom = zoom;

    this.updateBounds();

    this.dirty = true;
};

Scene.prototype.viewReady = function () {
    if (this.css_size == null || this.center == null || this.zoom == null || Object.keys(this.sources).length === 0) {
         return false;
    }
    return true;
};

// Calculate viewport bounds based on current center and zoom
Scene.prototype.updateBounds = function () {
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

    let z = this.baseZoom(this.zoom);
    let max_zoom = this.findMaxZoom();
    if (z > max_zoom) {
        z = max_zoom;
    }
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

    // Find visible tiles and load new ones
    this.visible_tiles = this.findVisibleTiles();
    for (let key in this.visible_tiles) {
        this.loadTile(this.visible_tiles[key]);
    }

    // Update tile visible flags
    for (let key in this.tiles) {
        this.tiles[key].update(this);
    }

    this.trigger('move');
    this.dirty = true;
};

Scene.prototype.findVisibleTiles = function ({ buffer } = {}) {
    let z = this.baseZoom(this.zoom);
    let max_zoom = this.findMaxZoom();
    if (z > max_zoom) {
        z = max_zoom;
    }

    let sw = Geo.tileForMeters([this.bounds_meters.sw.x, this.bounds_meters.sw.y], z);
    let ne = Geo.tileForMeters([this.bounds_meters.ne.x, this.bounds_meters.ne.y], z);
    buffer = buffer || 0;

    let tiles = {};
    for (let x = sw.x - buffer; x <= ne.x + buffer; x++) {
        for (let y = ne.y - buffer; y <= sw.y + buffer; y++) {
            let coords = { x, y, z };
            tiles[Tile.key(coords)] = coords;
        }
    }
    return tiles;
};

Scene.prototype.removeTilesOutsideZoomRange = function (below, above) {
    below = Math.min(below, this.findMaxZoom() || below);
    above = Math.min(above, this.findMaxZoom() || above);

    var remove_tiles = [];
    for (var t in this.tiles) {
        var tile = this.tiles[t];
        if (tile.coords.z < below || tile.coords.z > above) {
            remove_tiles.push(t);
        }
    }
    for (var r=0; r < remove_tiles.length; r++) {
        var key = remove_tiles[r];
        log.debug(`removed ${key} (outside range [${below}, ${above}])`);
        this.removeTile(key);
    }
};

Scene.prototype.resizeMap = function (width, height) {
    this.dirty = true;

    this.css_size = { width: width, height: height };
    this.device_size = { width: Math.round(this.css_size.width * this.device_pixel_ratio), height: Math.round(this.css_size.height * this.device_pixel_ratio) };
    this.view_aspect = this.css_size.width / this.css_size.height;
    this.updateBounds();

    if (this.canvas) {
        this.canvas.style.width = this.css_size.width + 'px';
        this.canvas.style.height = this.css_size.height + 'px';
        this.canvas.width = this.device_size.width;
        this.canvas.height = this.device_size.height;

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
};

// Request scene be redrawn at next animation loop
Scene.prototype.requestRedraw = function () {
    this.dirty = true;
};

// Redraw scene immediately - don't wait for animation loop
// Use sparingly, but for cases where you need the closest possible sync with other UI elements,
// such as other, non-WebGL map layers (e.g. Leaflet raster layers, markers, etc.)
Scene.prototype.immediateRedraw = function () {
    this.dirty = true;
    this.render();
};

// Setup the render loop
Scene.prototype.setupRenderLoop = function ({ pre_render, post_render } = {}) {
    this.renderLoop = () => {
        if (this.initialized) {
            // Render the scene
            this.update();
        }

        // Request the next frame
        window.requestAnimationFrame(this.renderLoop);
    };
    setTimeout(() => { this.renderLoop(); }, 0); // delay start by one tick
};

Scene.prototype.update = function () {
    this.loadQueuedTiles();

    // Render on demand
    var will_render = !(this.dirty === false || this.initialized === false || this.viewReady() === false);

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
};

Scene.prototype.resetFrame = function ({ depth_test, cull_face, alpha_blend } = {}) {
    if (!this.initialized) {
        return;
    }

    // Reset frame state
    var gl = this.gl;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Defaults
    // TODO: when we abstract out support for multiple render passes, these can be per-pass config options
    depth_test = (depth_test === false) ? false : true;
    cull_face = (cull_face === false) ? false : true;
    alpha_blend = (alpha_blend !== true) ? false : true;

    if (depth_test !== false) {
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
    }
    else {
        gl.disable(gl.DEPTH_TEST);
    }

    if (cull_face !== false) {
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
    }
    else {
        gl.disable(gl.CULL_FACE);
    }

    if (alpha_blend !== false) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
    else {
        gl.disable(gl.BLEND);
    }
};

// Find min/max order for a set of tiles
Scene.prototype.calcOrderRange = function (tiles) {
    let order = { min: Infinity, max: -Infinity };
    for (let t of tiles) {
        if (t.order.min < order.min) {
            order.min = t.order.min;
        }
        if (t.order.max > order.max) {
            order.max = t.order.max;
        }
    }
    order.max += 1;
    order.range = order.max - order.min;
    return order;
};

Scene.prototype.renderStyle = function (style, program) {
    var first_for_style = true;
    var render_count = 0;

    // Render tile GL geometries
    for (var t in this.renderable_tiles) {
        var tile = this.renderable_tiles[t];

        if (tile.meshes[style] != null) {
            // Setup style if encountering for first time this frame
            // (lazy init, not all styles will be used in all screen views; some styles might be defined but never used)
            if (first_for_style === true) {
                first_for_style = false;

                program.use();
                this.styles[style].setup();

                // TODO: don't set uniforms when they haven't changed
                program.uniform('2f', 'u_resolution', this.device_size.width, this.device_size.height);
                program.uniform('2f', 'u_aspect', this.view_aspect, 1.0);
                program.uniform('1f', 'u_time', ((+new Date()) - this.start_time) / 1000);
                program.uniform('1f', 'u_map_zoom', this.zoom); // Math.floor(this.zoom) + (Math.log((this.zoom % 1) + 1) / Math.LN2 // scale fractional zoom by log
                program.uniform('2f', 'u_map_center', this.center_meters.x, this.center_meters.y);
                program.uniform('1f', 'u_order_min', this.order.min);
                program.uniform('1f', 'u_order_range', this.order.range);
                program.uniform('1f', 'u_meters_per_pixel', this.meters_per_pixel);

                this.camera.setupProgram(program);
                this.lighting.setupProgram(program);
            }

            // TODO: calc these once per tile (currently being needlessly re-calculated per-tile-per-style)

            // Tile origin
            program.uniform('2f', 'u_tile_origin', tile.min.x, tile.min.y);

            // Model matrix - transform tile space into world space (meters, absolute mercator position)
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, vec3.fromValues(tile.min.x, tile.min.y, 0));
            mat4.scale(this.modelMatrix, this.modelMatrix, vec3.fromValues(tile.span.x / Scene.tile_scale, -1 * tile.span.y / Scene.tile_scale, 1)); // scale tile local coords to meters
            mat4.copy(this.modelMatrix32, this.modelMatrix);
            program.uniform('Matrix4fv', 'u_model', false, this.modelMatrix32);

            // Model view matrix - transform tile space into view space (meters, relative to camera)
            mat4.multiply(this.modelViewMatrix32, this.camera.viewMatrix, this.modelMatrix);
            program.uniform('Matrix4fv', 'u_modelView', false, this.modelViewMatrix32);

            // Render tile
            tile.meshes[style].render();
            render_count += tile.meshes[style].geometry_count;
        }
    }

    return render_count;
};

Scene.prototype.render = function () {
    var gl = this.gl;

    this.resetFrame({ alpha_blend: true });

    // Map transforms
    if (!this.center_meters) {
        return;
    }

    // Update camera & lights
    this.camera.update();
    this.lighting.update();

    // Renderable tile list
    this.renderable_tiles = [];
    for (var t in this.tiles) {
        var tile = this.tiles[t];
        if (tile.visible && tile.loaded) {
            this.renderable_tiles.push(tile);
        }
    }
    this.renderable_tiles_count = this.renderable_tiles.length;

    // Find min/max order for current tiles
    this.order = this.calcOrderRange(this.renderable_tiles);

    // Render main pass - tiles grouped by rendering style (GL program)
    this.render_count = 0;
    for (var style in this.styles) {
        // Per-frame style updates/animations
        // Called even if the style isn't rendered by any current tiles, so time-based animations, etc. continue
        this.styles[style].update();

        var program = this.styles[style].program;
        if (!program || !program.compiled) {
            continue;
        }

        this.render_count += this.renderStyle(style, program);
    }

    // Render selection pass (if needed)
    if (this.selection.pendingRequests()) {
        if (this.panning) {
            return;
        }

        // Switch to FBO
        this.selection.bind();
        this.resetFrame({ alpha_blend: false });

        for (style in this.styles) {
            program = this.styles[style].selection_program;
            if (!program || !program.compiled) {
                continue;
            }

            this.renderStyle(style, program);
        }

        // Read results from selection buffer
        this.selection.read();

        // Reset to screen buffer
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }

    if (this.render_count !== this.last_render_count) {
        log.info(`Scene: rendered ${this.render_count} primitives`);
    }
    this.last_render_count = this.render_count;

    return true;
};

// Request feature selection at given pixel. Runs async and returns results via a promise.
Scene.prototype.getFeatureAt = function (pixel) {
    if (!this.initialized) {
        return Promise.reject(new Error("Scene.getFeatureAt() called before scene was initialized"));
    }

    // Point scaled to [0..1] range
    var point = {
        x: pixel.x * this.device_pixel_ratio / this.device_size.width,
        y: pixel.y * this.device_pixel_ratio / this.device_size.height
    };

    this.dirty = true; // need to make sure the scene re-renders for these to be processed
    return this.selection.getFeatureAt(point);
};

// Queue a tile for load
Scene.prototype.loadTile = function (coords) {
    this.queued_tiles[this.queued_tiles.length] = coords;
};

// Load all queued tiles
Scene.prototype.loadQueuedTiles = function () {
    if (!this.initialized) {
        return;
    }

    if (this.queued_tiles.length === 0) {
        return;
    }

    // Sort queued tiles from center tile
    this.queued_tiles.sort((a, b) => {
        let ad = Math.abs(this.center_tile.x - a.x) + Math.abs(this.center_tile.y - a.y);
        let bd = Math.abs(this.center_tile.x - b.x) + Math.abs(this.center_tile.y - b.y);
        return (bd > ad ? -1 : (bd === ad ? 0 : 1));
    });
    this.queued_tiles.forEach(coords => this._loadTile(coords));
    this.queued_tiles = [];
};

// Load a single tile
Scene.prototype._loadTile = function (coords) {
    // Skip if not at current scene zoom
    if (coords.z !== this.center_tile.z) {
        return;
    }

    let key = Tile.key(coords);
    let tile;
    if (!this.hasTile(key)) {
        tile = Tile.create({
            coords: coords,
            max_zoom: this.findMaxZoom(),
            worker: this.nextWorker()
        });

        this.cacheTile(tile);
        tile.load(this);
    }
    else {
        tile = this.tiles[key];
    }
    return tile;
};

// tile manager
Scene.prototype.cacheTile = function (tile) {
    this.tiles[tile.key] = tile;
};

Scene.prototype.hasTile = function (key) {
    return this.tiles[key] !== undefined;
};

Scene.prototype.forgetTile = function (key) {
    delete this.tiles[key];
};

Scene.prototype.findMaxZoom = function () {
    var max_zoom = this.max_zoom || Geo.max_zoom;

    for (var name in this.sources) {
        let source = this.sources[name];
        if (source.max_zoom < max_zoom) {
            max_zoom = source.max_zoom;
        }
    }
    return max_zoom;
};

// TODO: detect which elements need to be refreshed/rebuilt (stylesheet changes, etc.)
Scene.prototype.rebuild = function () {
    return this.rebuildGeometry();
};

// Rebuild all tiles
Scene.prototype.rebuildGeometry = function () {
    if (!this.initialized) {
        return Promise.reject(new Error('Scene.rebuildGeometry: scene is not initialized'));
    }

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
        this.building = { resolve, reject, tiles: {} };

        // Profiling
        if (this.debug.profile.geometry_build) {
            this._profile('rebuildGeometry');
        }

        // Update config (in case JS objects were manipulated directly)
        this.syncConfigToWorker();

        // Rebuild visible tiles, sorted from center
        let build = [];
        for (let tile of Utils.values(this.tiles)) {
            if (tile.visible) {
                build.push(tile);
            }
            else {
                this.removeTile(tile.key);
            }
        }
        Tile.sort(build).forEach(tile => tile.build(this));

        this.updateActiveStyles();
        this.resetTime();

        // Edge case: if nothing is being rebuilt, immediately resolve promise and don't lock further rebuilds
        if (this.building && Object.keys(this.building.tiles).length === 0) {
            resolve(false);

            // Another rebuild queued?
            var queued = this.building.queued;
            this.building = null;
            if (queued) {
                log.debug(`Scene: starting queued rebuildGeometry() request`);
                this.rebuildGeometry().then(queued.resolve, queued.reject);
            }
        }
    }).then(() => {
        // Profiling
        if (this.debug.profile.geometry_build) {
            this._profileEnd('rebuildGeometry');
        }
    });
};

// TODO: move to Tile class
// Called on main thread when a web worker completes processing for a single tile (initial load, or rebuild)
Scene.prototype.buildTileCompleted = function ({ tile, worker_id, selection_map_size }) {
    // Track selection map size (for stats/debug) - update per worker and sum across workers
    this.selection_map_worker_size[worker_id] = selection_map_size;
    this.selection_map_size = 0;
    for (var wid in this.selection_map_worker_size) {
        this.selection_map_size += this.selection_map_worker_size[wid];
    }

    // Removed this tile during load?
    if (this.tiles[tile.key] == null) {
        log.debug(`discarded tile ${tile.key} in Scene.buildTileCompleted because previously removed`);
    }
    else {
        var cached = this.tiles[tile.key];

        // Update tile with properties from worker
        if (cached) {
            tile = cached.merge(tile);
        }

        if (!tile.error) {
            tile.finalizeBuild(this.styles);
            this.dirty = true;
        }
        else {
            log.error(`main thread tile load error for ${tile.key}: ${tile.error}`);
        }
        tile.printDebug();
    }

    this.trackTileSetLoadStop();
    this.trackTileBuildStop(tile.key);
};

// Track tile build state
Scene.prototype.trackTileBuildStart = function (key) {
    if (!this.building) {
        this.building = {
            tiles: {}
        };
    }
    this.building.tiles[key] = true;
    log.trace(`trackTileBuildStart for ${key}: ${Object.keys(this.building.tiles).length}`);
};

Scene.prototype.trackTileBuildStop = function (key) {
    // Done building?
    if (this.building) {
        log.trace(`trackTileBuildStop for ${key}: ${Object.keys(this.building.tiles).length}`);
        delete this.building.tiles[key];
        if (Object.keys(this.building.tiles).length === 0) {
            log.info(`Scene: build geometry finished`);
            log.debug(`Scene: updated selection map: ${this.selection_map_size} features`);

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
};

Scene.prototype.removeTile = function (key) {
    if (!this.initialized) {
        return;
    }
    log.debug(`tile unload for ${key}`);

    if (this.zooming === true) {
        return; // short circuit tile removal, will sweep out tiles by zoom level when zoom ends
    }

    var tile = this.tiles[key];

    if (tile != null) {
        tile.freeResources();
        tile.remove(this);
    }

    this.forgetTile(tile.key);
    this.dirty = true;
};

/**
   Load (or reload) the scene config
   @return {Promise}
*/
Scene.prototype.loadScene = function () {
    return Utils.loadResource(this.config_source).then((config) => {
        this.config = config;
        return this.preProcessSceneConfig().then(() => { this.trigger('loadScene', this.config); });
    }).catch(e => { throw e; });
};

// Reload scene config and rebuild tiles
Scene.prototype.reload = function () {
    if (!this.initialized) {
        return;
    }

    this.loadScene().then(() => {
        this.updateStyles(this.gl);
        this.syncConfigToWorker();
        return this.rebuildGeometry();
    }, (error) => {
        throw error;
    });
};

Scene.prototype.loadDataSources = function () {
    for (var name in this.config.sources) {
        let source = this.config.sources[name];
        source.url = Utils.addBaseURL(source.url);
        this.sources[name] = TileSource.create(Object.assign({}, source, {name}));
    }
    this.updateBounds();
};

Scene.prototype.setSourceMax = function () {
    let max_zoom = this.findMaxZoom();

    for (var name in this.sources) {
        let source = this.sources[name];
        source.max_zoom = max_zoom;
    }
    return max_zoom;
};

// Normalize some settings that may not have been explicitly specified in the scene definition
Scene.prototype.preProcessSceneConfig = function () {
    // Pre-process styles
    for (var rule of Utils.recurseValues(this.config.layers)) {
        if (rule.style) {
            // Styles are visible by default
            if (rule.style.visible !== false) {
                rule.style.visible = true;
            }
        }
    }

    // If only one camera specified, set it as default
    this.config.cameras = this.config.cameras || {};
    if (this.config.camera) {
        this.config.cameras.default = this.config.camera;
    }
    var camera_names = Object.keys(this.config.cameras);
    if (camera_names.length === 0) {
        this.config.cameras.default = { active: true };

    }
    else if (!this._active_camera) {
        // If no camera set as active, use first one
        this.config.cameras[camera_names[0]].active = true;
    }

    this.config.lighting = this.config.lighting || {}; // ensure lighting object

    return StyleManager.preload(this.config.styles);
};

// Called (currently manually) after styles are updated in stylesheet
Scene.prototype.updateStyles = function (gl) {
    if (!this.initialized && !this.initializing) {
        throw new Error('Scene.updateStyles() called before scene was initialized');
    }

    // (Re)build styles from config
    StyleManager.init();
    this.styles = StyleManager.build(this.config.styles);

    // Optionally set GL context (used when initializing or re-initializing GL resources)
    if (gl) {
        for (var style of Utils.values(this.styles)) {
            style.setGL(gl);
        }
    }

    // Compile all programs
    StyleManager.compile();

    this.updateActiveStyles();
    this.dirty = true;
};

Scene.prototype.updateActiveStyles = function () {
    // Make a set of currently active styles (used in a style rule)
    // Note: doesn't actually check if any geometry matches the rule, just that the style is potentially renderable
    this.active_styles = {};
    var animated = false; // is any active style animated?

    for (var rule of Utils.recurseValues(this.config.layers)) {
        if (rule.style && rule.style.visible !== false) {
            this.active_styles[rule.style.name || StyleParser.defaults.style.name] = true;

            if (this.styles[rule.style.name || StyleParser.defaults.style.name].animated) {
                animated = true;
            }
        }
    }
    this.animated = animated;
};

// Create camera
Scene.prototype.createCamera = function () {
    this.camera = Camera.create(this._active_camera, this, this.config.cameras[this._active_camera]);

    // TODO: replace this and move all position info to camera
    this.camera.updateScene();
};

// Get active camera - for public API
Scene.prototype.getActiveCamera = function () {
    return this._active_camera;
};

// Set active camera and recompile - for public API
Scene.prototype.setActiveCamera = function (name) {
    this._active_camera = name;
    this.updateConfig();
    return this._active_camera;
};

// Internal management of active camera
Object.defineProperty(Scene.prototype, '_active_camera', {

    get: function() {
        for (var name in this.config.cameras) {
            if (this.config.cameras[name].active) {
                return name;
            }
        }
    },

    set: function(name) {
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

});

// Create lighting
Scene.prototype.createLighting = function () {
    this.lighting = Lighting.create(this, this.config.lighting);
};

// Update scene config
Scene.prototype.updateConfig = function () {
    this.createCamera();
    this.createLighting();
    this.loadDataSources();
    this.setSourceMax();

    // TODO: detect changes to styles? already (currently) need to recompile anyway when camera or lights change
    this.updateStyles(this.gl);
    this.syncConfigToWorker();
};

// Serialize config and send to worker
Scene.prototype.syncConfigToWorker = function () {
    this.config_serialized = Utils.serializeWithFunctions(this.config);
    this.selection_map_worker_size = {};
    // Tell workers we're about to rebuild (so they can update styles, etc.)
    this.workers.forEach(worker => {
        WorkerBroker.postMessage(worker, 'updateConfig', {
            config: this.config_serialized
        });
    });
};

// Reset internal clock, mostly useful for consistent experience when changing styles/debugging
Scene.prototype.resetTime = function () {
    this.start_time = +new Date();
};


// Stats/debug/profiling methods

// Profiling methods used to track when sets of tiles start/stop loading together
// e.g. initial page load is one set of tiles, new sets of tile loads are then initiated by a map pan or zoom
Scene.prototype.trackTileSetLoadStart = function () {
    // Start tracking new tile set if no other tiles already loading
    if (this.tile_set_loading == null) {
        this.tile_set_loading = +new Date();
        log.info('Scene: tile set load start');
    }
};

Scene.prototype.trackTileSetLoadStop = function () {
    // No more tiles actively loading?
    if (this.tile_set_loading != null) {
        var end_tile_set = true;
        for (var t in this.tiles) {
            if (this.tiles[t].loading === true) {
                end_tile_set = false;
                break;
            }
        }

        if (end_tile_set === true) {
            this.last_tile_set_load = (+new Date()) - this.tile_set_loading;
            this.tile_set_loading = null;
            log.info(`Scene: tile set load finished in ${this.last_tile_set_load}ms`);
        }
    }
};

// Sum of a debug property across tiles
Scene.prototype.getDebugSum = function (prop, filter) {
    var sum = 0;
    for (var t in this.tiles) {
        if (this.tiles[t].debug[prop] != null && (typeof filter !== 'function' || filter(this.tiles[t]) === true)) {
            sum += this.tiles[t].debug[prop];
        }
    }
    return sum;
};

// Average of a debug property across tiles
Scene.prototype.getDebugAverage = function (prop, filter) {
    return this.getDebugSum(prop, filter) / Object.keys(this.tiles).length;
};

// Log messages pass through from web workers
Scene.prototype.workerLogMessage = function (event) {
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
};

// Profile helpers, issues a profile on main thread & all workers
Scene.prototype._profile = function (name) {
    console.profile(`main thread: ${name}`);
    this.workers.forEach(w => WorkerBroker.postMessage(w, 'profile', name));
};

Scene.prototype._profileEnd = function (name) {
    console.profileEnd(`main thread: ${name}`);
    this.workers.forEach(w => WorkerBroker.postMessage(w, 'profileEnd', name));
};
