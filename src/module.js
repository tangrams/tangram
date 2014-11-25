// Modules and dependencies to expose in the public Tangram module
import Utils from './utils';

// The leaflet layer plugin is currently the primary public API
import {LeafletLayer, leafletLayer} from './leaflet_layer';

// The scene worker is only activated when a worker thread is instantiated, but must always be loaded
import {SceneWorker} from '../src/scene_worker';

// Additional modules are exposed for debugging
import log from 'loglevel';
import {Geo} from './geo';
import GL from './gl/gl';
import GLProgram from './gl/gl_program';
import GLTexture from './gl/gl_texture';

// Window can only be set in main thread
Utils.inMainThread(() => {
    window.Tangram = module.exports = {
        LeafletLayer,
        leafletLayer,
        debug: {
            log,
            Geo,
            GL,
            GLProgram,
            GLTexture
        }
    };
});
