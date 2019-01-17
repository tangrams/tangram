// Texture management
import log from '../utils/log';
import Utils from '../utils/utils';
import subscribeMixin from '../utils/subscribe';
import WorkerBroker from '../utils/worker_broker';

// GL texture wrapper object for keeping track of a global set of textures, keyed by a unique user-defined name
export default class Texture {

    constructor(gl, name, options = {}) {
        options = Texture.sliceOptions(options); // exclude any non-texture-specific props
        this.gl = gl;
        this.texture = gl.createTexture();
        if (this.texture) {
            this.valid = true;
        }
        this.bind();

        this.name = name;
        this.retain_count = 0;
        this.config_type = null;
        this.loading = null;    // a Promise object to track the loading state of this texture
        this.loaded = false;    // successfully loaded as expected
        this.filtering = options.filtering;
        this.density = options.density || 1; // native pixel density of texture
        this.sprites = options.sprites;
        this.texcoords = {};    // sprite UVs ([0, 1] range)
        this.sizes = {};        // sprite sizes (pixel size)
        this.css_sizes = {};    // sprite sizes, adjusted for native texture pixel density
        this.aspects = {};      // sprite aspect ratios

        // Default to a 1-pixel transparent black texture so we can safely render while we wait for an image to load
        // See: http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load
        this.setData(1, 1, new Uint8Array([0, 0, 0, 0]), { filtering: 'nearest' });
        this.loaded = false; // don't consider loaded when only placeholder data is present

        // Destroy previous texture if present
        if (Texture.textures[this.name]) {
            // Preserve previous retain count
            this.retain_count = Texture.textures[this.name].retain_count;
            Texture.textures[this.name].retain_count = 0; // allow to be freed
            Texture.textures[this.name].destroy();
        }

        // Cache texture instance and definition
        Texture.textures[this.name] = this;
        Texture.texture_configs[this.name] = JSON.stringify(Object.assign({ name }, options));

        this.load(options);
        log('trace', `creating Texture ${this.name}`);
    }

    // Destroy a single texture instance
    destroy({ force } = {}) {
        if (this.retain_count > 0 && !force) {
            log('error', `Texture '${this.name}': destroying texture with retain count of '${this.retain_count}'`);
            return;
        }

        if (!this.valid) {
            return;
        }
        this.gl.deleteTexture(this.texture);
        this.texture = null;
        delete this.data;
        this.data = null;
        delete Texture.textures[this.name];
        delete Texture.texture_configs[this.name];
        this.valid = false;
        log('trace', `destroying Texture ${this.name}`);
    }

    retain () {
        this.retain_count++;
    }

    release () {
        if (this.retain_count <= 0) {
            log('error', `Texture '${this.name}': releasing texture with retain count of '${this.retain_count}'`);
        }

        this.retain_count--;
        if (this.retain_count <= 0) {
            this.destroy();
        }
    }

    bind(unit = 0) {
        if (!this.valid) {
            return;
        }

        if (Texture.activeUnit !== unit) {
            this.gl.activeTexture(this.gl.TEXTURE0 + unit);
            Texture.activeUnit = unit;
            Texture.boundTexture = null; // texture must be re-bound when unit changes
        }

        if (Texture.boundTexture !== this.texture) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
            Texture.boundTexture = this.texture;
        }
    }

    load(options) {
        if (!options) {
            return this.loading || Promise.resolve(this);
        }

        this.loading = null;
        if (typeof options.url === 'string') {
            this.config_type = 'url';
            this.setUrl(options.url, options);
        } else if (options.element) {
            this.config_type = 'element';
            this.setElement(options.element, options);
        } else if (options.data && options.width && options.height) {
            this.config_type = 'data';
            this.setData(options.width, options.height, options.data, options);
        }

        this.loading =
            (this.loading && this.loading.then(() => { this.calculateSprites(); return this; })) ||
            Promise.resolve(this);
        return this.loading;
    }

    // Sets texture from an url
    setUrl(url, options = {}) {
        if (!this.valid) {
            return;
        }

        this.url = url; // save URL reference (will be overwritten when element is loaded below)

        this.loading = new Promise(resolve => {
            let image = new Image();
            image.onload = () => {
                try {
                    this.setElement(image, options);
                }
                catch (e) {
                    this.loaded = false;
                    log('warn', `Texture '${this.name}': failed to load url: '${this.url}'`, e, options);
                    Texture.trigger('warning', { message: `Failed to load texture from ${this.url}`, error: e, texture: options });
                }

                this.loaded = true;
                resolve(this);
            };
            image.onerror = e => {
                // Warn and resolve on error
                this.loaded = false;
                log('warn', `Texture '${this.name}': failed to load url: '${this.url}'`, e, options);
                Texture.trigger('warning', { message: `Failed to load texture from ${this.url}`, error: e, texture: options });
                resolve(this);
            };

            // Safari has a bug loading data-URL images with CORS enabled, so it must be disabled in that case
            // https://bugs.webkit.org/show_bug.cgi?id=123978
            if (!(Utils.isSafari() && this.url.slice(0, 5) === 'data:')) {
                image.crossOrigin = 'anonymous';
            }

            image.src = this.url;
        });
        return this.loading;
    }

    // Sets texture to a raw image buffer
    setData(width, height, data, options = {}) {
        this.width = width;
        this.height = height;

        // Convert regular array to typed array
        if (Array.isArray(data)) {
            data = new Uint8Array(data);
        }

        this.update(data, options);
        this.setFiltering(options);

        this.loaded = true;
        this.loading = Promise.resolve(this);
        return this.loading;
    }

    // Sets the texture to track a element (canvas/image)
    setElement(element, options) {
        let el = element;

        // a string element is interpeted as a CSS selector
        if (typeof element === 'string') {
            element = document.querySelector(element);
        }

        if (element instanceof HTMLCanvasElement ||
            element instanceof HTMLImageElement ||
            element instanceof HTMLVideoElement) {
            this.update(element, options);
            this.setFiltering(options);
        }
        else {
            this.loaded = false;
            let msg = `the 'element' parameter (\`element: ${JSON.stringify(el)}\`) must be a CSS `;
            msg += 'selector string, or a <canvas>, <image> or <video> object';
            log('warn', `Texture '${this.name}': ${msg}`, options);
            Texture.trigger('warning', { message: `Failed to load texture because ${msg}`, texture: options });
        }

        this.loaded = true;
        this.loading = Promise.resolve(this);
        return this.loading;
    }

    // Uploads current image or buffer to the GPU (can be used to update animated textures on the fly)
    update(source, options = {}) {
        if (!this.valid) {
            return;
        }

        this.bind();

        // Image or Canvas element
        if (source instanceof HTMLCanvasElement || source instanceof HTMLVideoElement ||
            (source instanceof HTMLImageElement && source.complete)) {

            this.width = source.width;
            this.height = source.height;
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, (options.UNPACK_FLIP_Y_WEBGL === false ? false : true));
            this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, options.UNPACK_PREMULTIPLY_ALPHA_WEBGL || false);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, source);
        }
        // Raw image buffer
        else {
            // these pixel store params are deprecated for non-DOM element uploads
            // (e.g. when creating texture from raw data)
            // setting them to null avoids a Firefox warning
            this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, null);
            this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, null);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, source);
        }

        Texture.trigger('update', this);
    }

    // Determines appropriate filtering mode
    setFiltering(options = {}) {
        if (!this.valid) {
            return;
        }

        options.filtering = options.filtering || 'linear';

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

            if (options.filtering === 'mipmap') {
                this.filtering = 'mipmap';
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); // TODO: use trilinear filtering by defualt instead?
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.generateMipmap(gl.TEXTURE_2D);
            }
            else if (options.filtering === 'linear') {
                this.filtering = 'linear';
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
            else if (options.filtering === 'nearest') {
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
                this.filtering = 'nearest';
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            }
            else { // default to linear for non-power-of-2 textures
                this.filtering = 'linear';
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            }
        }

        Texture.trigger('update', this);
    }

    // Pre-calc sprite regions for a texture sprite in UV [0, 1] space
    calculateSprites() {
        if (this.sprites) {
            for (let s in this.sprites) {
                let sprite = this.sprites[s];

                // Map [0, 0] to [1, 1] coords to the appropriate sprite sub-area of the texture
                this.texcoords[s] = Texture.getTexcoordsForSprite(
                    [sprite[0], sprite[1]],
                    [sprite[2], sprite[3]],
                    [this.width, this.height]
                );

                // Pixel size of sprite
                // Divide by native texture density to get correct CSS pixels
                this.sizes[s] = [sprite[2], sprite[3]];
                this.css_sizes[s] = [sprite[2] / this.density, sprite[3] / this.density];
                this.aspects[s] = sprite[2] / sprite[3];
            }
        }
    }

    // Get the tetxure size in bytes
    byteSize() {
        // mipmaps use 33% additional memory
        return Math.round(this.width * this.height * 4 * (this.filtering == 'mipmap' ? 1.33 : 1));
    }

}


// Static/class methods and state

Texture.create = function (gl, name, options) {
    return new Texture(gl, name, options);
};

Texture.retain = function (name) {
    if (Texture.textures[name]) {
        Texture.textures[name].retain();
    }
};

Texture.release = function (name) {
    if (Texture.textures[name]) {
        Texture.textures[name].release();
    }
};

// Destroy all texture instances for a given GL context
Texture.destroy = function (gl) {
    var textures = Object.keys(Texture.textures);
    textures.forEach(t => {
        var texture = Texture.textures[t];
        if (texture.gl === gl) {
            texture.destroy({ force: true });
        }
    });
};

// Get sprite pixel size and UVs
Texture.getSpriteInfo = function (texname, sprite) {
    let texture = Texture.textures[texname];
    return texture && {
        size: texture.sizes[sprite],
        css_size: texture.css_sizes[sprite],
        aspect: texture.aspects[sprite],
        texcoords: texture.texcoords[sprite]
    };
};

// Re-scale UVs from [0, 1] range to a smaller area within the image
Texture.getTexcoordsForSprite = function (area_origin, area_size, tex_size) {
    var area_origin_y = tex_size[1] - area_origin[1] - area_size[1];

    return [
        area_origin[0] / tex_size[0],
        area_origin_y / tex_size[1],
        (area_size[0] + area_origin[0]) / tex_size[0],
        (area_size[1] + area_origin_y) / tex_size[1]
    ];
};

// Create a set of textures keyed in an object
// Optionally load each if it has a URL specified
Texture.createFromObject = function (gl, textures) {
    let loading = [];
    if (textures) {
        for (let texname in textures) {
            let config = textures[texname];

            // If texture already exists and definition hasn't changed, no need to re-create
            // Note: to avoid flicker when other textures/scene items change
            if (!Texture.changed(texname, config)) {
                continue;
            }

            let texture = Texture.create(gl, texname, config);
            loading.push(texture.loading);
        }
    }
    return Promise.all(loading);
};

// Create a 'default' texture (1x1 pixel) that can be used as a placeholder
// (for example to prevent GL from complaining about unbound textures)
Texture.default = '__default';
Texture.createDefault = function (gl) {
    return Texture.create(gl, Texture.default);
};

// Only include texture-specific properties (avoid faulty equality comparisons between
// textures when caller may include other ancillary props)
Texture.sliceOptions = function(options) {
    return {
        filtering: options.filtering,
        sprites: options.sprites,
        url: options.url,
        element: options.element,
        data: options.data,
        width: options.width,
        height: options.height,
        density: options.density,
        repeat: options.repeat,
        TEXTURE_WRAP_S: options.TEXTURE_WRAP_S,
        TEXTURE_WRAP_T: options.TEXTURE_WRAP_T,
        UNPACK_FLIP_Y_WEBGL: options.UNPACK_FLIP_Y_WEBGL,
        UNPACK_PREMULTIPLY_ALPHA_WEBGL: options.UNPACK_PREMULTIPLY_ALPHA_WEBGL
    };
};

// Indicate if a texture definition would be a change from the current cache
Texture.changed = function (name, config) {
    let texture = Texture.textures[name];
    if (texture) { // cached texture
        // canvas/image-based textures are considered dynamic and always refresh
        if (texture.config_type === 'element' || config.element != null) {
            return true;
        }

        // compare definitions
        config = Texture.sliceOptions(config); // exclude any non-texture-specific props
        if (Texture.texture_configs[name] === JSON.stringify(Object.assign({ name }, config))) {
            return false;
        }
    }
    return true;
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
                density: tex.density,
                css_size: [ tex.width / tex.density, tex.height / tex.density ],
                aspect: tex.width / tex.height,
                sprites: tex.sprites,
                texcoords: tex.texcoords,
                sizes: tex.sizes,
                css_sizes: tex.css_sizes,
                aspects: tex.aspects,
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
    return WorkerBroker.postMessage('Texture.getInfo', names).
        then(textures => {
            textures.forEach(tex => {
                Texture.textures[tex.name] = tex;
            });
            return Texture.textures;
        });
};

// Report max texture size for a GL context
Texture.getMaxTextureSize = function (gl) {
    return gl.getParameter(gl.MAX_TEXTURE_SIZE);
};

// Global set of textures, by name
Texture.textures = {};
Texture.texture_configs = {};
Texture.boundTexture = null;
Texture.activeUnit = null;

WorkerBroker.addTarget('Texture', Texture);
subscribeMixin(Texture);
