// Modules and dependencies to expose in the public Tangram module

// The leaflet layer plugin is currently the primary means of using the library
var Leaflet = require('./leaflet_layer.js');

// Renderer modules need to be explicitly included since they are not otherwise referenced
require('./gl/gl_renderer.js');
require('./canvas/canvas_renderer.js');

// GL functions included for easier debugging / direct access to setting global defines, reloading programs, etc.
var GL = require('./gl/gl.js');

if (module !== undefined) {
    module.exports = {
        LeafletLayer: Leaflet.LeafletLayer,
        leafletLayer: Leaflet.leafletLayer,
        GL: GL
    };
}
