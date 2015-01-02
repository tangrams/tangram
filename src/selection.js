import GLTexture from './gl/gl_texture';
import WorkerBroker from './worker_broker';

export default class FeatureSelection {

    constructor(gl, workers) {
        this.gl = gl;
        this.workers = workers;
        this.init();
    }

    init() {
        // Selection state tracking
        this.pixel = new Uint8Array(4);
        this.pixel32 = new Float32Array(this.pixel.buffer);
        this.selection_requests = {};
        this.selected_feature = null;
        this.selection_delay_timer = null;
        this.selection_frame_delay = 5; // delay from selection render to framebuffer sample, to avoid CPU/GPU sync lock

        // Frame buffer for selection
        // TODO: initiate lazily in case we don't need to do any selection
        this.fbo = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
        this.fbo_size = { width: 256, height: 256 }; // TODO: make configurable / adaptive based on canvas size
        this.fbo_size.aspect = this.fbo_size.width / this.fbo_size.height;

        // Texture for the FBO color attachment
        var fbo_texture = new GLTexture(this.gl, 'selection_fbo');
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
            this.selection_requests[this.selection_request_id] = {
                type: 'point',
                id: this.selection_request_id,
                point,
                resolve
            };
        });
    }

    // Any pending selection requests
    pendingRequests() {
        return this.selection_requests;
    }

    // Read pending results from the selection buffer. Called after rendering to selection buffer.
    read() {
        // Delay reading the pixel result from the selection buffer to avoid CPU/GPU sync lock.
        // Calling readPixels synchronously caused a massive performance hit, presumably since it
        // forced this function to wait for the GPU to finish rendering and retrieve the texture contents.
        if (this.selection_delay_timer != null) {
            clearTimeout(this.selection_delay_timer);
        }
        this.selection_delay_timer = setTimeout(() => {
            var gl = this.gl;

            gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);

            for (var r in this.selection_requests) {
                var request = this.selection_requests[r];

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
                            this.workerGetFeatureSelection(message);
                        });
                    }
                }
                // No feature found, but still need to resolve promise
                else {
                    this.workerGetFeatureSelection({ id: request.id, feature: null });
                }

                request.sent = true;
            }

            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        }, this.selection_frame_delay);
    }

    // Called on main thread when a web worker finds a feature in the selection buffer
    workerGetFeatureSelection (message) {
        var request = this.selection_requests[message.id];
        if (!request) {
            throw new Error("Scene.workerGetFeatureSelection() called without any message");
        }

        var feature = message.feature;
        var changed = false;
        if ((feature != null && this.selected_feature == null) ||
            (feature == null && this.selected_feature != null) ||
            (feature != null && this.selected_feature != null && feature.id !== this.selected_feature.id)) {
            changed = true;
        }

        this.selected_feature = feature; // store the most recently selected feature

        // Resolve the request
        request.resolve({ feature, changed, request });
        delete this.selection_requests[message.id]; // done processing this request
    }

}
