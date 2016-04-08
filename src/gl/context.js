// WebGL context wrapper

var Context;
export default Context = {};

// Setup a WebGL context
// If no canvas element is provided, one is created and added to the document body
Context.getContext = function getContext (canvas, options)
{
    var fullscreen = false;
    if (canvas == null) {
        canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.zIndex = -1;
        document.body.appendChild(canvas);
        fullscreen = true;
    }

    var gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
    if (!gl) {
        throw new Error("Couldn't create WebGL context.");
    }

    if (!fullscreen) {
        Context.resize(gl, parseFloat(canvas.style.width), parseFloat(canvas.style.height), options.device_pixel_ratio);
    }
    else {
        Context.resize(gl, window.innerWidth, window.innerHeight, options.device_pixel_ratio);
        window.addEventListener('resize', function () {
            Context.resize(gl, window.innerWidth, window.innerHeight, options.device_pixel_ratio);
        });
    }

    return gl;
};

Context.resize = function (gl, width, height, device_pixel_ratio)
{
    device_pixel_ratio = device_pixel_ratio || window.devicePixelRatio || 1;
    gl.canvas.style.width = width + 'px';
    gl.canvas.style.height = height + 'px';
    gl.canvas.width = Math.round(width * device_pixel_ratio);
    gl.canvas.height = Math.round(height * device_pixel_ratio);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
};
