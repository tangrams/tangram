// Modules and dependencies to expose in the public Tangram module

// The leaflet layer plugin is currently the primary means of using the library

import {LeafletLayer, leafletLayer} from './leaflet_layer';
import {GL} from './gl/gl';
// GL functions included for easier debugging / direct access to setting global defines, reloading programs, etc.

GL.Program = require('./gl/gl_program.js').default;
GL.Texture = require('./gl/gl_texture.js');

module.exports = {
    LeafletLayer: LeafletLayer,
    leafletLayer: leafletLayer,
    GL: GL
};

window.Tangram = module.exports;
