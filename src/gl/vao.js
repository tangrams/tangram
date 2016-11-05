// Creates a Vertex Array Object if the extension is available, or falls back on standard attribute calls

import getExtension from './extensions';
import log from '../utils/log';

var VertexArrayObject;
export default VertexArrayObject = {};

VertexArrayObject.disabled = false; // set to true to disable VAOs even if extension is available
VertexArrayObject.bound_vao = [];   // currently bound VAO, by GL context

VertexArrayObject.init = function (gl) {
    let ext;
    if (VertexArrayObject.disabled !== true) {
        ext = getExtension(gl, 'OES_vertex_array_object');
    }

    if (ext != null) {
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

    let ext = getExtension(gl, 'OES_vertex_array_object');
    if (ext != null) {
        vao._vao = ext.createVertexArrayOES();
        ext.bindVertexArrayOES(vao._vao);
    }

    vao.setup(true);

    return vao;
};

VertexArrayObject.getCurrentBinding = function (gl) {
    let bound = VertexArrayObject.bound_vao.filter(e => e[0] === gl)[0];
    return bound && bound[1];
};

VertexArrayObject.setCurrentBinding = function (gl, vao) {
    let bound_vao = VertexArrayObject.bound_vao;
    let binding = bound_vao.filter(e => e[0] === gl)[0];
    if (binding == null) {
        bound_vao.push([gl, vao]);
    }
    else {
        binding[1] = vao;
    }
};

VertexArrayObject.bind = function (gl, vao) {
    let ext = getExtension(gl, 'OES_vertex_array_object');
    if (vao != null) {
        if (ext != null && vao._vao != null) {
            ext.bindVertexArrayOES(vao._vao);
            VertexArrayObject.setCurrentBinding(gl, vao);
        }
        else {
            vao.setup(false);
        }
    }
    else {
        let bound_vao = VertexArrayObject.getCurrentBinding(gl);
        if (ext != null) {
            ext.bindVertexArrayOES(null);
        }
        else if (bound_vao != null && typeof bound_vao.teardown === 'function') {
            bound_vao.teardown();
        }
        VertexArrayObject.setCurrentBinding(gl, null);
    }
};

VertexArrayObject.destroy = function (gl, vao) {
    let ext = getExtension(gl, 'OES_vertex_array_object');
    if (ext != null && vao != null && vao._vao != null) {
        ext.deleteVertexArrayOES(vao._vao);
        vao._vao = null;
    }
    // destroy is a no-op if VAO extension isn't available
};
