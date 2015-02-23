/*jshint worker: true*/

// Modules and dependencies to expose in the public Tangram module
import Utils from './utils/utils';

// The leaflet layer plugin is currently the primary public API
import {LeafletLayer, leafletLayer} from './leaflet_layer';

// The scene worker is only activated when a worker thread is instantiated, but must always be loaded
import {SceneWorker} from '../src/scene_worker';

// Additional modules are exposed for debugging
import log from 'loglevel';
import Geo from './geo';
import GLSL from './gl/glsl';
import ShaderProgram from './gl/shader_program';
import Texture from './gl/texture';
import WorkerBroker from './utils/worker_broker';
import {ruleCache} from 'unruly';

import glMatrix from 'gl-matrix';

// Default to 64-bit because we need the extra precision when multiplying matrices w/mercator projected values
glMatrix.glMatrix.setMatrixArrayType(Float64Array);

// Make some modules accessible for debugging
var debug = {
    log,
    Utils,
    Geo,
    GLSL,
    ShaderProgram,
    Texture,
    SceneWorker,
    WorkerBroker,
    ruleCache
};

// Window can only be set in main thread
if (Utils.isMainThread) {
    // Main thread objects that can be called from workers
    WorkerBroker.addTarget('Texture', Texture);

    window.Tangram = module.exports = {
        LeafletLayer,
        leafletLayer,
        debug
    };

}

if (Utils.isWorkerThread) {
    self.Tangram = {
        debug
    };
}
