// WebGL extension wrapper
// Stores extensions by name and GL context

let extensions = new Map(); // map of extensions by GL context

export default function getExtension (gl, name) {
    let exts = extensions.get(gl);
    if (!exts) {
        extensions.set(gl, new Map());
        exts = extensions.get(gl);
    }

    if (!exts.get(name)) {
        exts.set(name, gl.getExtension(name));
    }
    return exts.get(name);
}
