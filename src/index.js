/*jshint worker: true*/

import './utils/polyfills';

// primary public API
import { tangramLayer } from './tangramLayer';
import { leafletLayer } from './leaflet_layer';

// The scene worker is only activated when a worker thread is instantiated, but must always be loaded
import Scene from './scene';

// Additional modules are exposed for debugging
import version from './utils/version';
import log from './utils/log';
import Utils from './utils/utils';
import Geo from './utils/geo';
import Vector from './utils/vector';
import DataSource from './sources/data_source';
import GLSL from './gl/glsl';
import ShaderProgram from './gl/shader_program';
import VertexData from './gl/vertex_data';
import Texture from './gl/texture';
import Material from './lights/material';
import Light from './lights/light';
import WorkerBroker from './utils/worker_broker';
import Task from './utils/task';
import {StyleManager} from './styles/style_manager';
import StyleParser from './styles/style_parser';
import {TileID} from './tile/tile_id';
import Collision from './labels/collision';
import FeatureSelection from './selection/selection';
import TextCanvas from './styles/text/text_canvas';
import debugSettings from './utils/debug_settings';

import yaml from 'js-yaml';

// Make some modules accessible for debugging
const debug = {
    log,
    yaml,
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
    WorkerBroker,
    Task,
    StyleManager,
    StyleParser,
    TileID,
    Collision,
    FeatureSelection,
    TextCanvas,
    debugSettings
};

export default {
    tangramLayer,
    leafletLayer,
    debug,
    version
};
