/*jshint worker: true*/

// Modules and dependencies to expose in the public Tangram module
import Utils from './utils/utils';

// The leaflet layer plugin is currently the primary public API
import {leafletLayer} from './leaflet_layer';

// The scene worker is only activated when a worker thread is instantiated, but must always be loaded
import Scene from './scene';
import {SceneWorker} from './scene_worker';

// Additional modules are exposed for debugging
import version from './utils/version';
import log from 'loglevel';
import Geo from './geo';
import DataSource from './sources/data_source';
import './sources/geojson';
import './sources/topojson';
import './sources/mvt';
import './sources/raster';
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
import Collision from './labels/collision';
import FeatureSelection from './selection';
import CanvasText from './styles/text/canvas_text';

import yaml from 'js-yaml';

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
    Scene,
    SceneWorker,
    WorkerBroker,
    ruleCache,
    StyleManager,
    StyleParser,
    Collision,
    FeatureSelection,
    CanvasText
};

if (Utils.isMainThread) {
    Utils.requestAnimationFramePolyfill();

    // Attach Promise polyfill to window
    // Allows FontFaceObserver to use polyfill (without needing to include its own duplicate polyfill)
    if (window.Promise === undefined) {
        window.Promise = Promise;
    }
}

// Setup logging to prefix with Tangram version
var originalFactory = log.methodFactory;
log.methodFactory = function(methodName, logLevel) {
    var rawMethod = originalFactory(methodName, logLevel);
    return function(...message) {
        rawMethod(`Tangram ${version.string}:`, ...message);
    };
};

module.exports = {
    leafletLayer,
    debug,
    version: version.string
};
