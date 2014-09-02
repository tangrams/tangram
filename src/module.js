// Modules and dependencies to expose in the public Tangram module

// The leaflet layer plugin is currently the primary means of using the library
var Leaflet = require('./leaflet_layer.js');

// GL functions included for easier debugging / direct access to setting global defines, reloading programs, etc.
var GL = require('./gl/gl.js');
GL.Program = require('./gl/gl_program.js');
GL.Texture = require('./gl/gl_texture.js');

if (module !== undefined) {
    module.exports = {
        LeafletLayer: Leaflet.LeafletLayer,
        leafletLayer: Leaflet.leafletLayer,
        GL: GL
    };
}
