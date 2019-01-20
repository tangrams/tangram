import log from '../utils/log';
import Texture from '../gl/texture';
import WorkerBroker from '../utils/worker_broker';

export default class FeatureSelection {

    constructor(gl, workers, lock_fn) {
        this.gl = gl;
        this.workers = workers; // pool of workers to request feature look-ups from, keyed by id
        this._lock_fn = (typeof lock_fn === 'function') && lock_fn; // indicates if safe to read/write selection buffer this frame
        this.init();
    }

    init() {
        // Selection state tracking
        this.requests = {}; // pending selection requests
        this.feature = null; // currently selected feature
        this.read_delay = 0; // delay time from selection render to framebuffer sample, to avoid CPU/GPU sync lock
        this.read_delay_timer = null; // current timer (setTimeout) for delayed selection reads
        this.pixels = null; // allocated lazily on request

        // Frame buffer for selection
        // TODO: initiate lazily in case we don't need to do any selection
        this.fbo = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
        this.fbo_size = { width: 256, height: 256 }; // TODO: make configurable / adaptive based on canvas size

        // Texture for the FBO color attachment
        var fbo_texture = Texture.create( this.gl, '__selection_fbo', { filtering: 'nearest' });
        fbo_texture.setData(this.fbo_size.width, this.fbo_size.height, null, { filtering: 'nearest' });
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, fbo_texture.texture, 0);

        // Renderbuffer for the FBO depth attachment
        var fbo_depth_rb = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, fbo_depth_rb);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.fbo_size.width, this.fbo_size.height);
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, fbo_depth_rb);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    destroy() {
        if (this.gl && this.fbo) {
            this.gl.deleteFramebuffer(this.fbo);
            this.fbo = null;
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        }

        // TODO: free texture?
    }

    // external lock function determines when it's safe to read/write from selection buffer
    get locked () {
        return (this._lock_fn && this._lock_fn()) || false;
    }

    bind() {
        // Switch to FBO
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
        this.gl.viewport(0, 0, this.fbo_size.width, this.fbo_size.height);
        this.gl.clearColor(...FeatureSelection.defaultColor);
    }

    // Request feature selection
    // Runs asynchronously, schedules selection buffer to be updated
    getFeatureAt(point, { radius }) {
        // ensure requested point is in canvas bounds
        if (!point || point.x < 0 || point.y < 0 || point.x > 1 || point.y > 1) {
            return Promise.resolve({ feature: null, changed: false });
        }

        return new Promise((resolve, reject) => {
            // Queue requests for feature selection, and they will be picked up by the render loop
            this.selection_request_id = (this.selection_request_id + 1) || 0;
            this.requests[this.selection_request_id] = {
                id: this.selection_request_id,
                point,
                radius,
                resolve,
                reject
            };
        });
    }

    // Any pending selection requests
    pendingRequests() {
        return Object.keys(this.requests).length ? this.requests : null;
    }

    hasPendingRequests() {
        return this.pendingRequests() != null;
    }

    clearPendingRequests() {
        for (var r in this.requests) {
            var request = this.requests[r];

            // This request was already sent to the worker, we're just awaiting its reply
            if (request.sent) {
                continue;
            }

            // Reject request since it will never be fulfilled
            // TODO: pass a reason for rejection?
            request.reject({ request });
            delete this.requests[r];
        }
    }

    // Read pending results from the selection buffer. Called after rendering to selection buffer.
    read() {
        // Delay reading the pixel result from the selection buffer to avoid CPU/GPU sync lock.
        // Calling readPixels synchronously caused a massive performance hit, presumably since it
        // forced this function to wait for the GPU to finish rendering and retrieve the texture contents.
        if (this.read_delay_timer != null) {
            clearTimeout(this.read_delay_timer);
        }
        this.read_delay_timer = setTimeout(() => {
            if (this.locked) {
                return;
            }

            var gl = this.gl;

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

            for (var r in this.requests) {
                var request = this.requests[r];

                // This request was already sent to the worker, we're just awaiting its reply
                if (request.sent) {
                    continue;
                }

                // Check selection map against FBO
                let feature_key, worker_id = 255;
                let {point, radius} = request;
                let diam_px;

                if (!radius) {
                    radius = { x: 0, y: 0 };
                    diam_px = { x: 1, y: 1 };
                }
                else {
                    // diameter in selection buffer pixels
                    let max_radius = Math.min(this.fbo_size.width, this.fbo_size.height);
                    diam_px = {
                        x: Math.min(Math.ceil(radius.x * 2 * this.fbo_size.width), max_radius),
                        y: Math.min(Math.ceil(radius.y * 2 * this.fbo_size.height), max_radius)
                    };
                }

                // allocate or resize
                if (this.pixels == null || this.pixels.byteLength < diam_px.x * diam_px.y * 4) {
                    this.pixels = new Uint8Array(diam_px.x * diam_px.y * 4);
                }

                // clear pixels
                if (this.pixels.fill instanceof Function) {
                    this.pixels.fill(0); // native typed array fill
                }
                else {
                    for (let p=0; p < this.pixels.length; p++) {
                        this.pixels[p] = 0;
                    }
                }

                // capture pixels
                gl.readPixels(
                    Math.round(((point.x - radius.x) * this.fbo_size.width)),
                    Math.round((1 - point.y - radius.y) * this.fbo_size.height),
                    diam_px.x, diam_px.y, gl.RGBA, gl.UNSIGNED_BYTE, this.pixels);

                // first check center pixel (avoid scanning all pixels if cursor is directly on a feature)
                let p = (Math.round(diam_px.y / 2) * diam_px.x + Math.round(diam_px.x / 2)) * 4;
                let v = this.pixels[p] + (this.pixels[p+1] << 8) + (this.pixels[p+2] << 16); // feature id in RGB channels
                if (v > 0) {
                    feature_key = (v + (this.pixels[p+3] << 24)) >>> 0; // worker id in alpha channel
                    worker_id = this.pixels[p+3];
                }
                else {
                    // scan all pixels for feature closest to cursor
                    let min_dist = -1 >>> 0;
                    p = 0;
                    for (let y=0; y < diam_px.y; y++) {
                        for (let x=0; x < diam_px.x; x++, p += 4) {
                            v = this.pixels[p] + (this.pixels[p+1] << 8) + (this.pixels[p+2] << 16); // feature id in RGB channels
                            if (v > 0) { // non-zero value indicates a feature
                                // check to see if closer than last found feature
                                let dist = (x - diam_px.x/2) * (x - diam_px.x/2) + (y - diam_px.y/2) * (y - diam_px.y/2);
                                if (dist <= min_dist) {
                                    // get worker id from alpha channel
                                    feature_key = (v + (this.pixels[p+3] << 24)) >>> 0;
                                    worker_id = this.pixels[p+3];
                                    min_dist = dist;
                                }
                            }
                        }
                    }
                }

                // If feature found, ask appropriate web worker to lookup feature
                if (worker_id !== 255) { // 255 indicates an empty selection buffer pixel
                    if (this.workers[worker_id] != null) {
                        WorkerBroker.postMessage(
                            this.workers[worker_id],
                            'self.getFeatureSelection',
                            { id: request.id, key: feature_key })
                            .then(message => {
                                this.finishRead(message);
                            });
                    }
                }
                // No feature found, but still need to resolve promise
                else {
                    this.finishRead({ id: request.id });
                }

                request.sent = true;
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        }, this.read_delay);
    }

    // Called on main thread when a web worker finds a feature in the selection buffer
    finishRead (message) {
        var request = this.requests[message.id];
        if (!request) {
            log('error', 'FeatureSelection.finishRead(): could not find message', message);
            return; // request was cleared before it returned
        }

        var feature = message.feature;
        var changed = false;
        if ((feature != null && this.feature == null) ||
            (feature == null && this.feature != null) ||
            (feature != null && this.feature != null &&
                JSON.stringify(feature) !== JSON.stringify(this.feature))) {
            changed = true;
        }

        this.feature = feature; // store the most recently selected feature

        // Resolve the request
        request.resolve({ feature, changed, request });
        delete this.requests[message.id]; // done processing this request
    }


    // Selection map generation
    // Each worker will create its own independent, 'local' selection map

    // Create a unique 32-bit color to identify a feature
    // Workers independently create/modify selection colors in their own threads, but we also
    // need the main thread to know where each feature color originated. To accomplish this,
    // we partition the map by setting the 4th component (alpha channel) to the worker's id.
    static makeEntry(tile) {
        // 32-bit color key
        this.map_entry++;
        var ir = this.map_entry & 255;
        var ig = (this.map_entry >> 8) & 255;
        var ib = (this.map_entry >> 16) & 255;
        var ia = this.map_prefix;
        var r = ir / 255;
        var g = ig / 255;
        var b = ib / 255;
        var a = ia / 255;
        var key = (ir + (ig << 8) + (ib << 16) + (ia << 24)) >>> 0; // need unsigned right shift to convert to positive #

        this.map[key] = {
            color: [r, g, b, a],
        };
        this.map_size++;

        // Initialize tile-specific tracking info
        if (!this.tiles[tile.key]) {
            this.tiles[tile.key] = {
                entries: [],                        // set of feature entries in this thread
                tile: {                             // subset of tile properties to pass back with feature
                    key: tile.key,
                    coords: tile.coords,
                    style_zoom: tile.style_zoom,
                    source: tile.source,
                    generation: tile.generation
                }
            };
        }

        this.tiles[tile.key].entries.push(key);

        return this.map[key];
    }

    static makeColor(feature, tile, context) {
        var selector = this.makeEntry(tile);
        selector.feature = {
            id: feature.id,
            properties: feature.properties,
            source_name: context.source,
            source_layer: context.layer,
            layers: context.layers,
            tile: this.tiles[tile.key].tile
        };

        return selector.color;
    }

    static reset(sources) {
        // Clear specific sources
        if (Array.isArray(sources)) {
            sources.forEach(source => this.clearSource(source));
        }
        // Clear all sources
        else {
            this.tiles = {};
            this.map = {};
            this.map_size = 0;
            this.map_entry = 0;
        }
    }

    static clearSource(source) {
        for (let key in this.tiles) {
            if (this.tiles[key].tile.source === source) {
                this.clearTile(key);
            }
        }
    }

    static clearTile(key) {
        if (this.tiles[key]) {
            this.tiles[key].entries.forEach(k => delete this.map[k]);
            this.map_size -= this.tiles[key].entries.length;
            delete this.tiles[key];
        }
    }

    static getMapSize() {
        return this.map_size;
    }

    static setPrefix(prefix) {
        this.map_prefix = prefix;
    }

}

// Static properties
FeatureSelection.map = {};   // this will be unique per module instance (so unique per worker)
FeatureSelection.tiles = {}; // selection keys, by tile
FeatureSelection.map_size = 0;
FeatureSelection.map_entry = 0;
FeatureSelection.map_prefix = 0; // set by worker to worker id #
FeatureSelection.defaultColor = [0, 0, 0, 1];
