// Modules and dependencies to expose in the public Tangram module

// The leaflet layer plugin is currently the primary means of using the library

import {LeafletLayer, leafletLayer} from './leaflet_layer';
import {Geo} from './geo';
import GL from './gl/gl';
import GLProgram from './gl/gl_program';
import GLTexture from './gl/gl_texture';
import log from 'loglevel';
// GL functions included for easier debugging / direct access to
// setting global defines, reloading programs, etc.

window.Tangram = module.exports = {
    log,
    LeafletLayer,
    leafletLayer,
    Geo,
    GL,
    GLProgram,
    GLTexture };
