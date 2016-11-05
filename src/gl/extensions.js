// WebGL extension wrapper
// Stores extensions by name and GL context

// list of extension arrays, for each entry, 1st element GL context, 2nd map of extensions by name
let extensions = [];

export default function getExtension (gl, name) {
    let exts = extensions.filter(e => e[0] === gl)[0];
    exts = exts && exts[1];

    if (!exts) {
        extensions.push([gl, {}]);
        exts = extensions[extensions.length-1][1];
    }

    if (!exts[name]) {
        exts[name] = gl.getExtension(name);
    }
    return exts[name];
}
