/*jshint worker: true*/

// Modules and dependencies to expose in the public Tangram module
import Utils from './utils/utils';

// The leaflet layer plugin is currently the primary public API
import {leafletLayer} from './leaflet_layer';

// The scene worker is only activated when a worker thread is instantiated, but must always be loaded
import {SceneWorker} from '../src/scene_worker';

// Additional modules are exposed for debugging
import version from './utils/version';
import log from 'loglevel';
import Geo from './geo';
import DataSource from './sources/data_source';
import './sources/geojson';
import './sources/topojson';
import './sources/mvt';
import TileManager from './tile_manager';
import GLSL from './gl/glsl';
import ShaderProgram from './gl/shader_program';
import VertexData from './gl/vertex_data';
import Texture from './gl/texture';
import Material from './material';
import Light from './light';
import WorkerBroker from './utils/worker_broker';
import {ruleCache} from './styles/rule';
import {StyleManager} from './styles/style_manager';
import {StyleParser} from './styles/style_parser';
import FeatureSelection from './selection';

import yaml from 'js-yaml';
import glMatrix from 'gl-matrix';

// Default to 64-bit because we need the extra precision when multiplying matrices w/mercator projected values
glMatrix.glMatrix.setMatrixArrayType(Float64Array);

// Make some modules accessible for debugging
var debug = {
    log,
    yaml,
    Utils,
    Geo,
    DataSource,
    TileManager,
    GLSL,
    ShaderProgram,
    VertexData,
    Texture,
    Material,
    Light,
    SceneWorker,
    WorkerBroker,
    ruleCache,
    StyleManager,
    StyleParser,
    FeatureSelection
};

// Window can only be set in main thread
if (Utils.isMainThread) {

    window.Tangram = module.exports = {
        leafletLayer,
        debug,
        version: version.string
    };

}

if (Utils.isWorkerThread) {
    self.Tangram = {
        debug,
        version: version.string
    };
}

if (Utils.isMainThread) {
    Utils.requestAnimationFramePolyfill();
}

// Setup logging to prefix with Tangram version
var originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel) {
    var rawMethod = originalFactory(methodName, logLevel);
    return function (...message) {
        rawMethod(`Tangram ${version.string}:`, ...message);
    };
};
