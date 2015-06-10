// WebGL extension wrapper
// Stores extensions by name and GL context

var Extensions;
export default Extensions = {};

Extensions.extensions = new Map(); // map of extensions by GL context

Extensions.getExtension = function (gl, name) {
    let exts = Extensions.extensions.get(gl);
    if (!exts) {
        Extensions.extensions.set(gl, {});
        exts = Extensions.extensions.get(gl);
    }

    if (!exts[name]) {
        exts[name] = gl.getExtension(name);
    }
    return exts[name];
};
