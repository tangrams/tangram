// Creates a Vertex Array Object if the extension is available, or falls back on standard attribute calls
import log from 'loglevel';
export var GLVertexArrayObject = {};
GLVertexArrayObject.disabled = false; // set to true to disable VAOs even if extension is available
GLVertexArrayObject.bound_vao = null; // currently bound VAO

GLVertexArrayObject.init = function (gl)
{
    if (GLVertexArrayObject.ext == null) {
        if (GLVertexArrayObject.disabled !== true) {
            GLVertexArrayObject.ext = gl.getExtension("OES_vertex_array_object");
        }

        if (GLVertexArrayObject.ext != null) {
            log.info('Vertex Array Object extension available');
        }
        else if (GLVertexArrayObject.disabled !== true) {
            log.warn('Vertex Array Object extension NOT available');
        }
        else {
            log.warn('Vertex Array Object extension force disabled');
        }
    }
};

GLVertexArrayObject.create = function (setup, teardown)
{
    var vao = {};
    vao.setup = setup;
    vao.teardown = teardown;

    var ext = GLVertexArrayObject.ext;
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

GLVertexArrayObject.bind = function (vao)
{
    var ext = GLVertexArrayObject.ext;
    if (vao != null) {
        if (ext != null && vao._vao != null) {
            ext.bindVertexArrayOES(vao._vao);
            GLVertexArrayObject.bound_vao = vao;
        }
        else {
            vao.setup();
        }
    }
    else {
        if (ext != null) {
            ext.bindVertexArrayOES(null);
        }
        else if (GLVertexArrayObject.bound_vao != null && typeof GLVertexArrayObject.bound_vao.teardown === 'function') {
            GLVertexArrayObject.bound_vao.teardown();
        }
        GLVertexArrayObject.bound_vao = null;
    }
};

if (module !== undefined) {
    module.exports = GLVertexArrayObject;
}
