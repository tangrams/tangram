/*global Texture */
// Texture management
import Utils from '../utils/utils';
import subscribeMixin from '../utils/subscribe';
import WorkerBroker from '../utils/worker_broker';
import Builders from '../styles/builders';
import log from 'loglevel';

// GL texture wrapper object for keeping track of a global set of textures, keyed by a unique user-defined name
export default class Texture {

    constructor(gl, name, options = {}) {
        this.gl = gl;
        this.texture = gl.createTexture();
        if (this.texture) {
            this.valid = true;
        }
        this.bind();
        this.image = null;      // an Image object/element that is the source for this texture
        this.canvas = null;     // a Canvas object/element that is the source for this texture
        this.loading = null;    // a Promise object to track the loading state of this texture

        // Default to a 1-pixel black texture so we can safely render while we wait for an image to load
        // See: http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load
        this.setData(1, 1, new Uint8Array([0, 0, 0, 255]), { filtering: 'nearest' });

        // TODO: better support for non-URL sources: canvas/video elements, raw pixel buffers

        this.name = name;
        this.filtering = options.filtering;

        // Destroy previous texture if present
        if (Texture.textures[this.name]) {
            Texture.textures[this.name].destroy();
        }

        Texture.textures[this.name] = this;

        this.sprites = options.sprites;
        this.texcoords = {};
    }

    // Destroy a single texture instance
    destroy() {
        if (!this.valid) {
            return;
        }
        this.gl.deleteTexture(this.texture);
        this.texture = null;
        delete this.data;
        this.data = null;
        delete Texture.textures[this.name];
        this.valid = false;
    }

    bind(unit) {
        if (!this.valid) {
            return;
        }
        if (typeof unit === 'number') {
            this.gl.activeTexture(this.gl.TEXTURE0 + unit);
        }
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
    }

    unbind() {
        this.gl.bindTexture(this.gl.TEXTURE_2D, null);
    }

    // Loads a texture from a URL
    load(url, options = {}) {
        if (!this.valid) {
            return;
        }

        if (Texture.base_url) {
            url = Utils.addBaseURL(url, Texture.base_url);
        }

        this.loading = new Promise((resolve, reject) => {
            this.image = new Image();
            this.image.onload = () => {
                this.update(options);
                this.setTextureFiltering(options);
                this.calculateSprites();

                this.canvas = null; // mutually exclusive with other types
                this.data = null;

                resolve(this);
            };
            this.image.crossOrigin = 'anonymous';
            this.image.src = url;
            // TODO: error/promise reject
        });
        return this.loading;
    }

    // Sets texture to a raw image buffer
    setData(width, height, data, options = {}) {
        this.width = width;
        this.height = height;
        this.data = data;

        this.image = null; // mutually exclusive with other types
        this.canvas = null;

        this.update(options);
        this.setTextureFiltering(options);
    }

    // Sets the texture to track a canvas element
    setCanvas(canvas, options) {
        this.canvas = canvas;
        this.update(options);
        this.setTextureFiltering(options);

        this.image = null; // mutually exclusive with other types
        this.data = null;
    }

    // Uploads current image or buffer to the GPU (can be used to update animated textures on the fly)
    update(options = {}) {
        if (!this.valid) {
            return;
        }

        this.bind();
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, (options.UNPACK_FLIP_Y_WEBGL === false ? false : true));
        this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.UNPACK_PREMULTIPLY_ALPHA_WEBGL || false);

        // Image element
        if (this.image && this.image.complete) {
            this.width = this.image.width;
            this.height = this.image.height;
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
        }
        // Canvas element
        else if (this.canvas) {
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.canvas);
        }
        // Raw image buffer
        else if (this.width && this.height) { // NOTE: this.data can be null, to zero out texture
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.data);
        }

        Texture.trigger('update', this);
    }

    // Determines appropriate filtering mode
    setTextureFiltering(options = {}) {
        if (!this.valid) {
            return;
        }

        options.filtering = options.filtering || this.filtering || 'linear'; // default to mipmaps for power-of-2 textures

        var gl = this.gl;
        this.bind();

        // For power-of-2 textures, the following presets are available:
        // mipmap: linear blend from nearest mip
        // linear: linear blend from original image (no mips)
        // nearest: nearest pixel from original image (no mips, 'blocky' look)
        if (Utils.isPowerOf2(this.width) && Utils.isPowerOf2(this.height)) {
            this.power_of_2 = true;
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.TEXTURE_WRAP_S || (options.repeat && gl.REPEAT) || gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.TEXTURE_WRAP_T || (options.repeat && gl.REPEAT) || gl.CLAMP_TO_EDGE);

            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.TEXTURE_WRAP_S || gl.REPEAT);
            // gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.TEXTURE_WRAP_T || gl.REPEAT);

            if (options.filtering === 'mipmap') {
                log.trace('power-of-2 MIPMAP');
                this.filtering = 'mipmap';
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // TODO: use trilinear filtering by defualt instead?
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            else if (options.filtering === 'linear') {
                log.trace('power-of-2 LINEAR');
                this.filtering = 'linear';
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
            else if (options.filtering === 'nearest') {
                log.trace('power-of-2 NEAREST');
                this.filtering = 'nearest';
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
        }
        else {
            // WebGL has strict requirements on non-power-of-2 textures:
            // No mipmaps and must clamp to edge
            this.power_of_2 = false;
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

            if (options.filtering === 'nearest') {
                log.trace('power-of-2 NEAREST');
                this.filtering = 'nearest';
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
            else { // default to linear for non-power-of-2 textures
                log.trace('power-of-2 LINEAR');
                this.filtering = 'linear';
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
        }

        this.unbind();
        Texture.trigger('update', this);
    }

    // Pre-calc sprite regions for a texture sprite in UV [0, 1] space
    calculateSprites() {
        if (this.sprites) {
            for (let s in this.sprites) {
                let sprite = this.sprites[s];

                // Map [0, 0] to [1, 1] coords to the appropriate sprite sub-area of the texture
                this.texcoords[s] = Builders.getTexcoordsForSprite(
                    [sprite[0], sprite[1]],
                    [sprite[2], sprite[3]],
                    [this.width, this.height]
                );
            }
        }
    }

}


// Static/class methods and state

// Destroy all texture instances for a given GL context
Texture.destroy = function (gl) {
    var textures = Object.keys(Texture.textures);
    for (var t of textures) {
        var texture = Texture.textures[t];
        if (texture.gl === gl) {
            log.trace(`destroying Texture ${texture.name}`);
            texture.destroy();
        }
    }
};

// Get sprite sub-area to use for texture coordinates (default is [0, 1])
Texture.getSpriteTexcoords = function (texname, sprite) {
    let texture = Texture.textures[texname];
    return texture && texture.texcoords[sprite];
};

// Create a set of textures keyed in an object
// Optionally load each if it has a URL specified
Texture.createFromObject = function (gl, textures) {
    let loading = [];
    if (textures) {
        for (let texname in textures) {
            let config = textures[texname];
            if (!Texture.textures[texname]) {
                let texture = new Texture(gl, texname, config);
                if (config.url) {
                    loading.push(texture.load(config.url, config));
                }
            }
        }
    }
    return Promise.all(loading);
};

// Get metadata for a texture by name
// Returns via promise, in case texture is still loading
// Can be called on main thread from worker, to sync texture info to worker
Texture.getInfo = function (name) {
    // Get info for all textures by default
    if (!name) {
        name = Object.keys(Texture.textures);
    }

    // Get multiple textures
    if (Array.isArray(name)) {
        return Promise.all(name.map(n => Texture.getInfo(n)));
    }

    // Get single texture
    var tex = Texture.textures[name];
    if (tex) {
        // Wait for this texture to finish loading, or return immediately
        var loading = tex.loading || Promise.resolve(tex);
        return loading.then(() => {
            // Return a subset of texture info
            // (compatible w/structured cloning, suitable for passing to a worker)
            return {
                name: tex.name,
                width: tex.width,
                height: tex.height,
                sprites: tex.sprites,
                texcoords: tex.texcoords,
                filtering: tex.filtering,
                power_of_2: tex.power_of_2,
                valid: tex.valid
            };
        });
    }
    else {
        // No texture found
        return Promise.resolve(null);
    }
};

// Sync texture info to worker
// Called from worker, gets info on one or more textures info from main thread via remote call, then stores it
// locally in worker. 'textures' can be an array of texture names to sync, or if null, all textures are synced.
Texture.syncTexturesToWorker = function (names) {
    return WorkerBroker.postMessage('Texture', 'getInfo', names).
        then(textures => {
            for (var tex of textures) {
                Texture.textures[tex.name] = tex;
            }
            return Texture.textures;
        });
};

// Global set of textures, by name
Texture.textures = {};

Texture.base_url = null; // optional base URL to add to textures

subscribeMixin(Texture);
