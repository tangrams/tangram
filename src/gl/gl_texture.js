/*global GLTexture */
// Texture management
import Utils from '../utils';
import log from 'loglevel';

// Global set of textures, by name
GLTexture.textures = {};

// GL texture wrapper object for keeping track of a global set of textures, keyed by an arbitrary name
export default function GLTexture (gl, name, options = {}) {
    this.gl = gl;
    this.texture = gl.createTexture();
    if (this.texture) {
        this.valid = true;
    }
    this.bind(0);
    this.image = null;

    // Default to a 1-pixel black texture so we can safely render while we wait for an image to load
    // See: http://stackoverflow.com/questions/19722247/webgl-wait-for-texture-to-load
    this.setData(1, 1, new Uint8Array([0, 0, 0, 255]), { filtering: 'nearest' });

    // TODO: better support for non-URL sources: canvas/video elements, raw pixel buffers

    this.name = name;
    GLTexture.textures[this.name] = this;
}

// Destroy a single texture instance
GLTexture.prototype.destroy = function () {
    if (!this.valid) {
        return;
    }
    this.gl.deleteTexture(this.texture);
    this.texture = null;
    delete this.data;
    this.data = null;
    delete GLTexture.textures[this.name];
    this.valid = false;
};

// Destroy all texture instances for a given GL context
GLTexture.destroy = function (gl) {
    var textures = Object.keys(GLTexture.textures);
    for (var t of textures) {
        var texture = GLTexture.textures[t];
        if (texture.gl === gl) {
            log.trace(`destroying GLTexture ${texture.name}`);
            texture.destroy();
        }
    }
};

GLTexture.prototype.bind = function (unit) {
    if (!this.valid) {
        return;
    }
    this.gl.activeTexture(this.gl.TEXTURE0 + unit);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
};

// Loads a texture from a URL
GLTexture.prototype.load = function (url, options = {}) {
    if (!this.valid) {
        return;
    }
    this.image = new Image();
    this.image.onload = () => {
        this.width = this.image.width;
        this.height = this.image.height;
        this.data = null; // mutually exclusive with direct data buffer textures
        this.update(options);
        this.setTextureFiltering(options);
    };
    this.image.src = url;
};

// Sets texture to a raw image buffer
GLTexture.prototype.setData = function (width, height, data, options = {}) {
    this.width = width;
    this.height = height;
    this.data = data;
    this.image = null; // mutually exclusive with image element-based textures

    this.update(options);
    this.setTextureFiltering(options);
};

// Uploads current image or buffer to the GPU (can be used to update animated textures on the fly)
GLTexture.prototype.update = function (options = {}) {
    if (!this.valid) {
        return;
    }

    this.bind(0);
    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, (options.UNPACK_FLIP_Y_WEBGL === false ? false : true));

    // Image element
    if (this.image && this.image.complete) {
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.image);
    }
    // Raw image buffer
    else if (this.width && this.height) { // NOTE: this.data can be null, to zero out texture
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.width, this.height, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.data);
    }
};

// Determines appropriate filtering mode
// Assumes texture to be operated on is already bound
GLTexture.prototype.setTextureFiltering = function (options = {}) {
    if (!this.valid) {
        return;
    }

    options.filtering = options.filtering || 'mipmap'; // default to mipmaps for power-of-2 textures
    var gl = this.gl;

    // For power-of-2 textures, the following presets are available:
    // mipmap: linear blend from nearest mip
    // linear: linear blend from original image (no mips)
    // nearest: nearest pixel from original image (no mips, 'blocky' look)
    if (Utils.isPowerOf2(this.width) && Utils.isPowerOf2(this.height)) {
        this.power_of_2 = true;
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, options.TEXTURE_WRAP_S || gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, options.TEXTURE_WRAP_T || gl.CLAMP_TO_EDGE);

        if (options.filtering === 'mipmap') {
            log.trace('power-of-2 MIPMAP');
            this.filtering = 'mipmap';
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST); // TODO: use trilinear filtering by defualt instead?
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
};
