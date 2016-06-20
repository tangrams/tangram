// Creates a Vertex Array Object if the extension is available, or falls back on standard attribute calls

import log from '../utils/log';

var VertexArrayObject;
export default VertexArrayObject = {};

VertexArrayObject.disabled = false; // set to true to disable VAOs even if extension is available
VertexArrayObject.bound_vao = null; // currently bound VAO

VertexArrayObject.init = function (gl) {
    if (VertexArrayObject.disabled !== true) {
        VertexArrayObject.ext = gl.getExtension("OES_vertex_array_object");
    }

    if (VertexArrayObject.ext != null) {
        log('info', 'Vertex Array Object extension available');
    }
    else if (VertexArrayObject.disabled !== true) {
        log('warn', 'Vertex Array Object extension NOT available');
    }
    else {
        log('warn', 'Vertex Array Object extension force disabled');
    }
};

VertexArrayObject.create = function (setup, teardown) {
    let vao = {};
    vao.setup = setup;
    vao.teardown = teardown;

    let ext = VertexArrayObject.ext;
    if (ext != null) {
        vao._vao = ext.createVertexArrayOES();
        ext.bindVertexArrayOES(vao._vao);
    }

    vao.setup(true);

    return vao;
};

VertexArrayObject.bind = function (vao) {
    let ext = VertexArrayObject.ext;
    if (vao != null) {
        if (ext != null && vao._vao != null) {
            ext.bindVertexArrayOES(vao._vao);
            VertexArrayObject.bound_vao = vao;
        }
        else {
            vao.setup(false);
        }
    }
    else {
        if (ext != null) {
            ext.bindVertexArrayOES(null);
        }
        else if (VertexArrayObject.bound_vao != null && typeof VertexArrayObject.bound_vao.teardown === 'function') {
            VertexArrayObject.bound_vao.teardown();
        }
        VertexArrayObject.bound_vao = null;
    }
};

VertexArrayObject.destroy = function (vao) {
    let ext = VertexArrayObject.ext;
    if (ext != null && vao != null && vao._vao != null) {
        ext.deleteVertexArrayOES(vao._vao);
        vao._vao = null;
    }
    // destroy is a no-op if VAO extension isn't available
};
