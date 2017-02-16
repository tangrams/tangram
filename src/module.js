/*jshint worker: true*/

import './utils/polyfills';

// The leaflet layer plugin is currently the primary public API
import {leafletLayer} from './leaflet_layer';

// The scene worker is only activated when a worker thread is instantiated, but must always be loaded
import Scene from './scene';
import {SceneWorker} from './scene_worker';

// Additional modules are exposed for debugging
import version from './utils/version';
import log from './utils/log';
import Thread from './utils/thread';
import Utils from './utils/utils';
import Geo from './geo';
import Vector from './vector';
import DataSource from './sources/data_source';
import './sources/geojson';
import './sources/topojson';
import './sources/mvt';
import './sources/raster';
import GLSL from './gl/glsl';
import ShaderProgram from './gl/shader_program';
import VertexData from './gl/vertex_data';
import Texture from './gl/texture';
import Material from './material';
import Light from './light';
import WorkerBroker from './utils/worker_broker';
import {layer_cache} from './styles/layer';
import {StyleManager} from './styles/style_manager';
import {StyleParser} from './styles/style_parser';
import Collision from './labels/collision';
import FeatureSelection from './selection';
import CanvasText from './styles/text/canvas_text';
import debugSettings from './utils/debug_settings';

import yaml from 'js-yaml';
import JSZip from 'jszip';

// Make some modules accessible for debugging
var debug = {
    log,
    yaml,
    Thread,
    Utils,
    Geo,
    Vector,
    DataSource,
    GLSL,
    ShaderProgram,
    VertexData,
    Texture,
    Material,
    Light,
    Scene,
    SceneWorker,
    WorkerBroker,
    layer_cache,
    StyleManager,
    StyleParser,
    Collision,
    FeatureSelection,
    CanvasText,
    debugSettings
};

if (Thread.is_main) {
    Utils.requestAnimationFramePolyfill();

    // Attach Promise polyfill to window
    // Allows FontFaceObserver to use polyfill (without needing to include its own duplicate polyfill)
    if (window.Promise === undefined) {
        window.Promise = Promise;
        JSZip.external.Promise = Promise;
    }
}

module.exports = {
    leafletLayer,
    debug,
    version
};
