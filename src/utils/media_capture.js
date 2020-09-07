import log from './log';
import {createObjectURL} from './urls';
import StyleParser from '../styles/style_parser';

export default class MediaCapture {

    constructor() {
        this.canvas = null;
        this.gl = null;
        this.screenshot_canvas = null;
        this.screenshot_context = null;
        this.queue_screenshot = null;
        this.video_capture = null;
    }

    setCanvas (canvas, gl) {
        this.canvas = canvas;
        this.gl = gl;
    }

    // Take a screenshot, returns a promise that resolves with the screenshot data when available
    // `background`: optional background color to blend screenshot with
    screenshot ({ background } = {}) {
        if (this.queue_screenshot != null) {
            return this.queue_screenshot.promise; // only capture one screenshot at a time
        }

        // Will resolve once rendering is complete and render buffer is captured
        this.queue_screenshot = { background };
        this.queue_screenshot.promise = new Promise((resolve, reject) => {
            this.queue_screenshot.resolve = resolve;
            this.queue_screenshot.reject = reject;
        });
        return this.queue_screenshot.promise;
    }

    // Called after rendering, captures render buffer and resolves promise with the image data
    completeScreenshot () {
        if (this.queue_screenshot != null) {
            // Firefox appears to have an issue where its alpha conversion overflows some channels when
            // the WebGL canvas content is captured. To get around this, we read pixels from the GL buffer
            // directly, then flip and unmulitply the alpha on each pixel to get the desired RGB values.
            // See https://github.com/tangrams/tangram/issues/551

            // Get raw pixels from GL
            let w = this.canvas.width;
            let h = this.canvas.height;
            let pixels = new Uint8Array(w * h * 4);
            this.gl.readPixels(0, 0, w, h, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);

            // Optional background to blend with (only RGB, alpha is ignored)
            let background = this.queue_screenshot.background;
            if (background && background !== 'transparent') {
                background = StyleParser.parseColor(background).slice(0, 3).map(c => c * 255);
            }
            else {
                background = null; // skip blend if transparent
            }

            // Flip Y (GL buffer is upside down)
            let flip = new Uint8ClampedArray(w * h * 4);    // canvas requires 'clamped' array type
            for (let y=0; y < h; y++) {
                for (let x=0; x < w; x++) {
                    let s = ((h - y - 1) * w + x) * 4;      // source offset
                    let d = (y * w + x) * 4;                // destination offset
                    let a = pixels[s + 3];                  // unmultiply alpha
                    flip[d + 0] = pixels[s + 0] * 255 / a;
                    flip[d + 1] = pixels[s + 1] * 255 / a;
                    flip[d + 2] = pixels[s + 2] * 255 / a;
                    flip[d + 3] = a;

                    if (background) {
                        a /= 255;
                        flip[d + 0] = (flip[d + 0] * a) + (background[0] * (1 - a));
                        flip[d + 1] = (flip[d + 1] * a) + (background[1] * (1 - a));
                        flip[d + 2] = (flip[d + 2] * a) + (background[2] * (1 - a));
                        flip[d + 3] = 255;
                    }
                }
            }

            // Draw flipped pixels to a canvas
            this.screenshot_canvas = this.screenshot_canvas || document.createElement('canvas');
            let canvas = this.screenshot_canvas;
            canvas.width = w;
            canvas.height = h;

            this.screenshot_context = this.screenshot_context || canvas.getContext('2d');
            let ctx = this.screenshot_context;
            let image = new ImageData(flip, w, h);
            ctx.putImageData(image, 0, 0);

            // Get data URL from canvas and convert to blob
            // Strip host/mimetype/etc., convert base64 to binary without UTF-8 mangling
            // Adapted from: https://gist.github.com/unconed/4370822
            const url = canvas.toDataURL('image/png');
            const data = atob(url.slice(22));
            const buffer = new Uint8Array(data.length);
            for (let i = 0; i < data.length; ++i) {
                buffer[i] = data.charCodeAt(i);
            }
            const blob = new Blob([buffer], { type: 'image/png' });

            // Resolve with screenshot data
            this.queue_screenshot.resolve({ url, blob, type: 'png' });
            this.queue_screenshot = null;
        }
    }

    // Starts capturing a video stream from the canvas
    startVideoCapture () {
        if (typeof window.MediaRecorder !== 'function' || !this.canvas || typeof this.canvas.captureStream !== 'function') {
            log('warn', 'Video capture (Canvas.captureStream and/or MediaRecorder APIs) not supported by browser');
            return false;
        }
        else if (this.video_capture) {
            log('warn', 'Video capture already in progress, call Scene.stopVideoCapture() first');
            return false;
        }

        // Start a new capture
        try {
            let cap = this.video_capture = {};
            cap.chunks = [];
            cap.stream = this.canvas.captureStream();
            cap.options = { mimeType: 'video/webm' }; // TODO: support other format options
            cap.media_recorder = new MediaRecorder(cap.stream, cap.options);
            cap.media_recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    cap.chunks.push(event.data);
                }

                // Stopped recording? Create the final capture file blob
                if (cap.resolve) {
                    let blob = new Blob(cap.chunks, { type: cap.options.mimeType });
                    let url = createObjectURL(blob);

                    // Explicitly remove all stream tracks, and set objects to null
                    if (cap.stream) {
                        let tracks = cap.stream.getTracks() || [];
                        tracks.forEach(track => {
                            track.stop();
                            cap.stream.removeTrack(track);
                        });
                    }
                    cap.stream = null;
                    cap.media_recorder = null;
                    this.video_capture = null;

                    cap.resolve({ url, blob, type: 'webm' });
                }
            };
            cap.media_recorder.start();
        }
        catch (e) {
            this.video_capture = null;
            log('error', 'Scene video capture failed', e);
            return false;
        }
        return true;
    }

    // Stops capturing a video stream from the canvas, returns a promise that resolves with the video when available
    stopVideoCapture () {
        if (!this.video_capture) {
            log('warn', 'No scene video capture in progress, call Scene.startVideoCapture() first');
            return Promise.resolve({});
        }

        // Promise that will resolve when final stream is available
        this.video_capture.promise = new Promise((resolve, reject) => {
            this.video_capture.resolve = resolve;
            this.video_capture.reject = reject;
        });

        // Stop recording
        this.video_capture.media_recorder.stop();

        return this.video_capture.promise;
    }

}
