// Creates a Vertex Array Object if the extension is available, or falls back on standard attribute calls

import log from 'loglevel';

var VertexArrayObject;
export default VertexArrayObject = {};

VertexArrayObject.disabled = false; // set to true to disable VAOs even if extension is available
VertexArrayObject.bound_vao = null; // currently bound VAO

VertexArrayObject.init = function (gl) {
    if (VertexArrayObject.ext == null) {
        if (VertexArrayObject.disabled !== true) {
            VertexArrayObject.ext = gl.getExtension("OES_vertex_array_object");
        }

        if (VertexArrayObject.ext != null) {
            log.info('Vertex Array Object extension available');
        }
        else if (VertexArrayObject.disabled !== true) {
            log.warn('Vertex Array Object extension NOT available');
        }
        else {
            log.warn('Vertex Array Object extension force disabled');
        }
    }
};

VertexArrayObject.create = function (setup, teardown) {
    var vao = {};
    vao.setup = setup;
    vao.teardown = teardown;

    var ext = VertexArrayObject.ext;
    if (ext != null) {
        vao._vao = ext.createVertexArrayOES();
        ext.bindVertexArrayOES(vao._vao);
        vao.setup();
        ext.bindVertexArrayOES(null);
        if (typeof vao.teardown === 'function') {
            vao.teardown();
        }
    }
    else {
        vao.setup();
    }

    return vao;
};

VertexArrayObject.bind = function (vao) {
    var ext = VertexArrayObject.ext;
    if (vao != null) {
        if (ext != null && vao._vao != null) {
            ext.bindVertexArrayOES(vao._vao);
            VertexArrayObject.bound_vao = vao;
        }
        else {
            vao.setup();
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
