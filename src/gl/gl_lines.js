// Draws a set of lines
import {GLGeometry} from './gl_geom';


GLLines.prototype = Object.create(GLGeometry.prototype);

function GLLines (gl, vertex_data, vertex_layout, options)
{
    options = options || {};
    options.draw_mode = this.gl.LINES;

    this.line_width = options.line_width || 2;
    this.vertices_per_geometry = 2;

    GLGeometry.call(this, gl, vertex_data, vertex_layout, options);
}

GLLines.prototype._render_setup = function ()
{
    this.gl.lineWidth(this.line_width);
};

if (module !== undefined) {
    module.exports = GLLines;
}
