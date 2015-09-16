import Utils from './utils/utils';
import GLSL from './gl/glsl';
import {mergeObjects} from './styles/rule';
import {StyleManager} from './styles/style_manager';

var SceneLoader;

export default SceneLoader = {

    // Load scenes definitions from URL & proprocess
    loadScene(url, path = null) {
        return SceneLoader.loadSceneRecursive(url, path).then(SceneLoader.finalize);
    },

    // Loads scene files from URL, recursively loading 'included' scenes
    // Optional *initial* path only (won't be passed to recursive 'include' calls)
    // Useful for loading resources in base scene file from a separate location
    // (e.g. in Tangram Play, when modified local scene should still refer to original resource URLs)
    loadSceneRecursive(url, path = null) {
        if (!url) {
            return Promise.resolve({});
        }

        if (typeof url === 'string') {
            path = path || Utils.pathForURL(url);
        }

        return Utils.loadResource(url).then(config => {
            return StyleManager.loadRemoteStyles(config.styles, path).
                then(styles => StyleManager.loadShaderBlocks(styles, path)). // TODO: deprecate remote shader blocks?
                then(() => {
                    // accept single-string or array
                    if (typeof config.include === 'string') {
                        config.include = [config.include];
                    }

                    if (!Array.isArray(config.include)) {
                        SceneLoader.normalize(config, path);
                        return config;
                    }

                    // Collect URLs of scenes to include
                    let includes = [];
                    for (let url of config.include) {
                        includes.push(Utils.addBaseURL(url, path));
                    }
                    delete config.include; // don't want to merge this property

                    return Promise.
                        all(includes.map(url => SceneLoader.loadSceneRecursive(url))).
                        then(configs => {
                            config = mergeObjects({}, ...configs, config);
                            SceneLoader.normalize(config, path);
                            return config;
                        });
                });
        });
    },

    // Normalize properties that should be adjust within each local scene file (usually by path)
    normalize(config, path) {
        SceneLoader.normalizeDataSources(config, path);
        SceneLoader.normalizeTextures(config, path);
        return config;
    },

    // Expand paths for data source
    normalizeDataSources(config, path) {
        config.sources = config.sources || {};

        for (let source of  Utils.values(config.sources)) {
            source.url = Utils.addBaseURL(source.url, path);
        }

        return config;
    },

    // Expand paths and centralize texture definitions for a scene object
    normalizeTextures(config, path) {
        config.textures = config.textures || {};

        if (config.styles) {
            for (let [style_name, style] of Utils.entries(config.styles)) {
                if (style.texture) {
                    // Texture by URL, expand relative to scene file
                    if (typeof style.texture === 'string' && !config.textures[style.texture]) {
                        style.texture = Utils.addBaseURL(style.texture, path);
                    }
                    // Texture by object, move it to the global scene texture set and give it a default name
                    else if (typeof style.texture === 'object') {
                        let texture_name = '__' + style_name;
                        config.textures[texture_name] = style.texture;
                        style.texture = texture_name; // point style to location of texture
                    }
                }

                // If style has texture uniforms, expand texture URLs relative to scene file
                if (style.shaders && style.shaders.uniforms) {
                    for (let {type, value, key, uniforms} of GLSL.parseUniforms(style.shaders.uniforms)) {
                        if (type === 'sampler2D' && !config.textures[value]) {
                            uniforms[key] = Utils.addBaseURL(value, path);
                        }
                    }
                }

                // If style has material, expand texture URLs relative to scene file
                if (style.material) {
                    for (let prop of ['emission', 'ambient', 'diffuse', 'specular', 'normal']) {
                        if (style.material[prop] != null &&
                            style.material[prop].texture &&
                            !config.textures[style.material[prop].texture]) {
                            style.material[prop].texture = Utils.addBaseURL(style.material[prop].texture, path);
                        }
                    }
                }
            }
        }

        // Add path to textures
        if (config.textures) {
            for (let texture of Utils.values(config.textures)) {
                texture.url = Utils.addBaseURL(texture.url, path);
            }
        }

        return config;
    },

    // Normalize some scene-wide settings that apply to the final, merged scene
    finalize(config) {
        // Assign ids to data sources
        let source_id = 0;
        for (let source in config.sources) {
            config.sources[source].id = source_id++;
        }

        // If only one camera specified, set it as default
        config.cameras = config.cameras || {};
        if (config.camera) {
            config.cameras.default = config.camera;
        }

        // If no cameras specified, create one
        if (Object.keys(config.cameras).length === 0) {
            config.cameras.default = {};
        }

        // If no camera set as active, use first one
        let active = false;
        for (let camera of Utils.values(config.cameras)) {
            if (camera.active) {
                active = true;
                break;
            }
        }

        if (!active) {
            config.cameras[camera_names[0]].active = true;
        }

        // Ensure top-level properties
        config.lights = config.lights || {};
        config.styles = config.styles || {};

        return config;
    }

};
