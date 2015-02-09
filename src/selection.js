import Texture from './gl/texture';
import WorkerBroker from './utils/worker_broker';

class FeatureSelection {

    constructor(gl, workers) {
        this.gl = gl;
        this.workers = workers; // pool of workers to request feature look-ups from, keyed by id
        this.init();
    }

    init() {
        // Selection state tracking
        this.requests = {}; // pending selection requests
        this.feature = null; // currently selected feature
        this.read_delay = 5; // delay time from selection render to framebuffer sample, to avoid CPU/GPU sync lock
        this.read_delay_timer = null; // current timer (setTimeout) for delayed selection reads

        this.pixel = new Uint8Array(4);
        this.pixel32 = new Float32Array(this.pixel.buffer);

        // Frame buffer for selection
        // TODO: initiate lazily in case we don't need to do any selection
        this.fbo = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
        this.fbo_size = { width: 256, height: 256 }; // TODO: make configurable / adaptive based on canvas size
        this.fbo_size.aspect = this.fbo_size.width / this.fbo_size.height;

        // Texture for the FBO color attachment
        var fbo_texture = new Texture(this.gl, 'selection_fbo');
        fbo_texture.setData(this.fbo_size.width, this.fbo_size.height, null, { filtering: 'nearest' });
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, fbo_texture.texture, 0);

        // Renderbuffer for the FBO depth attachment
        var fbo_depth_rb = this.gl.createRenderbuffer();
        this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, fbo_depth_rb);
        this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.fbo_size.width, this.fbo_size.height);
        this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, fbo_depth_rb);

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
    }

    bind() {
        // Switch to FBO
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
        this.gl.viewport(0, 0, this.fbo_size.width, this.fbo_size.height);
    }

    // Request feature selection
    // Runs asynchronously, schedules selection buffer to be updated
    getFeatureAt(point) {
        return new Promise((resolve, reject) => {
            // Queue requests for feature selection, and they will be picked up by the render loop
            this.selection_request_id = (this.selection_request_id + 1) || 0;
            this.requests[this.selection_request_id] = {
                type: 'point',
                id: this.selection_request_id,
                point,
                resolve
            };
        });
    }

    // Any pending selection requests
    pendingRequests() {
        return this.requests;
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
            var gl = this.gl;

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

            for (var r in this.requests) {
                var request = this.requests[r];

                // This request was already sent to the worker, we're just awaiting its reply
                if (request.sent) {
                    continue;
                }

                // TODO: support other selection types, such as features within a box
                if (request.type !== 'point') {
                    continue;
                }

                // Check selection map against FBO
                gl.readPixels(
                    Math.floor(request.point.x * this.fbo_size.width),
                    Math.floor((1 - request.point.y) * this.fbo_size.height),
                    1, 1, gl.RGBA, gl.UNSIGNED_BYTE, this.pixel);
                var feature_key = (this.pixel[0] + (this.pixel[1] << 8) + (this.pixel[2] << 16) + (this.pixel[3] << 24)) >>> 0;

                // If feature found, ask appropriate web worker to lookup feature
                var worker_id = this.pixel[3];
                if (worker_id !== 255) { // 255 indicates an empty selection buffer pixel
                    if (this.workers[worker_id] != null) {
                        WorkerBroker.postMessage(
                            this.workers[worker_id],
                            'getFeatureSelection',
                            { id: request.id, key: feature_key })
                        .then(message => {
                            this.finishRead(message);
                        });
                    }
                }
                // No feature found, but still need to resolve promise
                else {
                    this.finishRead({ id: request.id, feature: null });
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
            throw new Error("FeatureSelection.finishRead() called without any message");
        }

        var feature = message.feature;
        var changed = false;
        if ((feature != null && this.feature == null) ||
            (feature == null && this.feature != null) ||
            (feature != null && this.feature != null && feature.id !== this.feature.id)) {
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
    static makeEntry() {
        // 32-bit color key
        this.map_size++;
        var ir = this.map_size & 255;
        var ig = (this.map_size >> 8) & 255;
        var ib = (this.map_size >> 16) & 255;
        var ia = this.map_prefix;
        var r = ir / 255;
        var g = ig / 255;
        var b = ib / 255;
        var a = ia / 255;
        var key = (ir + (ig << 8) + (ib << 16) + (ia << 24)) >>> 0; // need unsigned right shift to convert to positive #

        this.map[key] = {
            color: [r, g, b, a],
        };

        return this.map[key];
    }

    static makeColor(feature) {
        var selector = this.makeEntry();
        selector.feature = {
            id: feature.id,
            properties: feature.properties
        };

        return selector.color;
    }

    static reset() {
        this.map = {};
        this.map_size = 1;
    }

    static setPrefix(prefix) {
        this.map_prefix = prefix;
    }

}

// js hint requires export statement below class definition in order to recognize
// class name when setting static properties below (sigh)
export default FeatureSelection;

// Static properties
FeatureSelection.map = {}; // this will be unique per module instance (so unique per worker)
FeatureSelection.map_size = 1; // start at 1 since 1 will be divided by this
FeatureSelection.map_prefix = 0; // set by worker to worker id #
FeatureSelection.defaultColor = [0, 0, 0, 1];
