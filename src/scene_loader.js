import Utils from './utils/utils';
import GLSL from './gl/glsl';
import {StyleParser} from './styles/style_parser';
import mergeObjects from './utils/merge';

var SceneLoader;

export default SceneLoader = {

    // Load scenes definitions from URL & proprocess
    loadScene(url, path = null) {
        return SceneLoader.loadSceneRecursive(url, path).then(SceneLoader.finalize);
    },

    // Loads scene files from URL, recursively loading 'import' scenes
    // Optional *initial* path only (won't be passed to recursive 'import' calls)
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
            // accept single-string or array
            if (typeof config.import === 'string') {
                config.import = [config.import];
            }

            if (!Array.isArray(config.import)) {
                SceneLoader.normalize(config, path);
                return config;
            }

            // Collect URLs of scenes to import
            let imports = [];
            for (let url of config.import) {
                imports.push(Utils.addBaseURL(url, path));
            }
            delete config.import; // don't want to merge this property

            return Promise.
                all(imports.map(url => SceneLoader.loadSceneRecursive(url))).
                then(configs => {
                    config = mergeObjects({}, ...configs, config);
                    SceneLoader.normalize(config, path);
                    return config;
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

            if (Array.isArray(source.scripts)) {
                source.scripts = source.scripts.map(url => Utils.addBaseURL(url, path));
            }
        }

        return config;
    },

    // Expand paths and centralize texture definitions for a scene object
    normalizeTextures(config, path) {
        config.textures = config.textures || {};

        // Move "locally defined" textures, e.g. those specified as strings or blocks,
        // to the scene's top-level set of textures (config.textures). There are 3 such types of textures:
        // - in a style's `texture` property (texture can be specified as string or object)
        // - in a style's `material` properties (texture can be specified as string or object)
        // - in a style's custom uniforms (`shaders.uniforms`) (texture can be specified as string only)
        //
        // For textures specified as strings, we first check to see if there is a texture already defined
        // with that string name. If there IS, then no changes are made. If there is NOT, then the texture string
        // is assumed to be a URL. A top-level `config.textures` object is created for the texture (with a private,
        // synthetic texture name); the texture's URL will be expanded to include the current scene file's path below.
        if (config.styles) {
            for (let [style_name, style] of Utils.entries(config.styles)) {
                // Style `texture`
                if (style.texture) {
                    let tex = style.texture;

                    // Texture by URL (string-named texture not referencing existing texture definition)
                    if (typeof tex === 'string' && !config.textures[tex]) {
                        let texture_name = '__' + style_name;
                        config.textures[texture_name] = { url: tex };
                        style.texture = texture_name; // point style to location of texture
                    }
                    // Texture by object
                    else if (typeof tex === 'object') {
                        let texture_name = '__' + style_name;
                        config.textures[texture_name] = tex;
                        style.texture = texture_name; // point style to location of texture
                    }
                }

                // Material
                if (style.material) {
                    for (let prop of ['emission', 'ambient', 'diffuse', 'specular', 'normal']) {
                        // Material property has a texture
                        if (style.material[prop] != null && style.material[prop].texture) {
                            let tex = style.material[prop].texture;

                            // Texture by URL (string-named texture not referencing existing texture definition)
                            if (typeof tex === 'string' &&
                                !config.textures[tex]) {
                                let texture_name = '__' + style_name + '_material_' + prop;
                                config.textures[texture_name] = { url: tex };
                                style.material[prop].texture = texture_name; // point style to location of texture
                            }
                            // Texture by object
                            else if (typeof tex === 'object') {
                                let texture_name = '__' + style_name + '_material_' + prop;
                                config.textures[texture_name] = tex;
                                style.material[prop].texture = texture_name; // point style to location of texture
                            }
                        }
                    }
                }

                // Shader uniforms
                if (style.shaders && style.shaders.uniforms) {
                    for (let {type, value, key, uniforms} of GLSL.parseUniforms(style.shaders.uniforms)) {
                        // Texture by URL (string-named texture not referencing existing texture definition)
                        if (type === 'sampler2D' && typeof value === 'string' && !config.textures[value]) {
                            let texture_name = '__' + style_name + '_uniform_' + key;
                            config.textures[texture_name] = { url: value };
                            uniforms[key] = texture_name; // point style to location of texture
                        }
                    }

                }
            }
        }

        // Add current scene file base path to textures
        // Only adds path for textures with relative URLs, so textures in imported scenes get the base
        // path of their immediate scene file
        if (config.textures) {
            for (let texture of Utils.values(config.textures)) {
                if (texture.url) {
                    texture.url = Utils.addBaseURL(texture.url, path);
                }
            }
        }

        return config;
    },

    // Normalize some scene-wide settings that apply to the final, merged scene
    finalize(config) {
        // Replace global scene properties
        config = StyleParser.applyGlobalProperties(config);

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
            config.cameras[Object.keys(config.cameras)[0]].active = true;
        }

        // Ensure top-level properties
        config.lights = config.lights || {};
        config.styles = config.styles || {};
        config.layers = config.layers || {};
        config.fonts = config.fonts || {};

        return config;
    }

};
