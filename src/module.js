// Modules and dependencies to expose in the public Tangram module

// The leaflet layer plugin is currently the primary public API
import {LeafletLayer, leafletLayer} from './leaflet_layer';

// Additional modules are exposed for debugging
import log from 'loglevel';
import {Geo} from './geo';
import GL from './gl/gl';
import GLProgram from './gl/gl_program';
import GLTexture from './gl/gl_texture';
import WorkerBroker from './worker_broker';

window.Tangram = module.exports = {
    LeafletLayer,
    leafletLayer,
    debug: {
        log,
        Geo,
        GL,
        GLProgram,
        GLTexture,
        WorkerBroker
    }
};
