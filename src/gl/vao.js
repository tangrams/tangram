// Creates a Vertex Array Object if the extension is available, or falls back on standard attribute calls

import log from '../utils/log';

var VertexArrayObject;
export default VertexArrayObject = {};

VertexArrayObject.disabled = false;      // set to true to disable VAOs even if extension is available
VertexArrayObject.ext = new Map();       // VAO extensions, by GL context
VertexArrayObject.bound_vao = new Map(); // currently bound VAO, by GL context

VertexArrayObject.init = function (gl) {
    if (VertexArrayObject.disabled !== true) {
        VertexArrayObject.ext.set(gl, gl.getExtension("OES_vertex_array_object"));
    }

    if (VertexArrayObject.ext.get(gl) != null) {
        log('info', 'Vertex Array Object extension available');
    }
    else if (VertexArrayObject.disabled !== true) {
        log('warn', 'Vertex Array Object extension NOT available');
    }
    else {
        log('warn', 'Vertex Array Object extension force disabled');
    }
};

VertexArrayObject.create = function (gl, setup, teardown) {
    let vao = {};
    vao.setup = setup;
    vao.teardown = teardown;

    let ext = VertexArrayObject.ext.get(gl);
    if (ext != null) {
        vao._vao = ext.createVertexArrayOES();
        ext.bindVertexArrayOES(vao._vao);
    }

    vao.setup(true);

    return vao;
};

VertexArrayObject.bind = function (gl, vao) {
    let ext = VertexArrayObject.ext.get(gl);
    if (vao != null) {
        if (ext != null && vao._vao != null) {
            ext.bindVertexArrayOES(vao._vao);
            VertexArrayObject.bound_vao.set(gl, vao);
        }
        else {
            vao.setup(false);
        }
    }
    else {
        let bound_vao = VertexArrayObject.bound_vao.get(gl);
        if (ext != null) {
            ext.bindVertexArrayOES(null);
        }
        else if (bound_vao != null && typeof bound_vao.teardown === 'function') {
            bound_vao.teardown();
        }
        VertexArrayObject.bound_vao.set(gl, null);
    }
};

VertexArrayObject.destroy = function (gl, vao) {
    let ext = VertexArrayObject.ext.get(gl);
    if (ext != null && vao != null && vao._vao != null) {
        ext.deleteVertexArrayOES(vao._vao);
        vao._vao = null;
    }
    // destroy is a no-op if VAO extension isn't available
};
