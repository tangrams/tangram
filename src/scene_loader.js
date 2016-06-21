import log from './utils/log';
import Utils from './utils/utils';
import GLSL from './gl/glsl';
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
        }).catch(error => {
            // TODO: publish an event that clients like Play can consume to be aware of load failures
            log('error', `Failed to load scene URL: ${url}`, error);
        });
    },

    // Normalize properties that should be adjust within each local scene file (usually by path)
    normalize(config, path) {
        SceneLoader.normalizeDataSources(config, path);
        SceneLoader.normalizeFonts(config, path);
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

    // Expand paths for fonts
    normalizeFonts(config, path) {
        config.fonts = config.fonts || {};

        for (let val of Utils.recurseValues(config.fonts)) {
            if (val.url) {
                val.url = Utils.addBaseURL(val.url, path);
            }
        }

        return config;
    },

    // Expand paths and centralize texture definitions for a scene object
    normalizeTextures(config, path) {
        config.textures = config.textures || {};

        // Add current scene's base path to globally defined textures
        // Only adds path for textures with relative URLs, so textures in imported scenes get the base
        // path of their immediate scene file
        if (config.textures) {
            for (let texture of Utils.values(config.textures)) {
                if (texture.url) {
                    texture.url = Utils.addBaseURL(texture.url, path);
                }
            }
        }

        // Move "URL shortcut" textures, e.g. those specified as inline URL strings, to the scene's top-level
        // set of textures (config.textures). There are 3 such cases of textures:
        // - in a style's `texture` property
        // - in a style's `material` properties
        // - in a style's custom uniforms (`shaders.uniforms`)
        //
        // We first check to see if there is a texture already defined with that string name. The texture's URL
        // is expanded to include the current scene's base path.
        if (config.styles) {
            for (let style of Utils.values(config.styles)) {
                // Style `texture`
                let tex = style.texture;
                if (typeof tex === 'string' && !config.textures[tex]) {
                    tex = Utils.addBaseURL(tex, path);
                    config.textures[tex] = { url: tex };
                    style.texture = tex;
                }

                // Material
                if (style.material) {
                    for (let prop of ['emission', 'ambient', 'diffuse', 'specular', 'normal']) {
                        // Material property has a texture
                        let tex = style.material[prop] != null && style.material[prop].texture;
                        if (typeof tex === 'string' && !config.textures[tex]) {
                            tex = Utils.addBaseURL(tex, path);
                            config.textures[tex] = { url: tex };
                            style.material[prop].texture = tex;
                        }
                    }
                }

                // Shader uniforms
                if (style.shaders && style.shaders.uniforms) {
                    for (let {type, value, key, uniforms} of GLSL.parseUniforms(style.shaders.uniforms)) {
                        // Texture by URL (string-named texture not referencing existing texture definition)
                        if (type === 'sampler2D' && typeof value === 'string' && !config.textures[value]) {
                            let tex = Utils.addBaseURL(value, path);
                            config.textures[tex] = { url: tex };
                            uniforms[key] = tex;
                        }
                    }

                }
            }
        }

        return config;
    },

    // Substitutes global scene properties (those defined in the `config.global` object) for any style values
    // of the form `global.`, for example `color: global.park_color` would be replaced with the value (if any)
    // defined for the `park_color` property in `config.global.park_color`.
    applyGlobalProperties(config) {
        if (!config.global || Object.keys(config.global).length === 0) {
            return config; // no global properties to transform
        }

        const separator = ':';
        const props = flattenProperties(config.global, separator);

        function applyProps (obj) {
            // Convert string
            if (typeof obj === 'string') {
                let key = (obj.slice(0, 7) === 'global.') && (obj.slice(7).replace(/\./g, separator));
                if (key && props[key]) {
                    obj = props[key];
                }
            }
            // Loop through object properties
            else if (typeof obj === 'object') {
                for (let p in obj) {
                    obj[p] = applyProps(obj[p]);
                }
            }
            return obj;
        }

        return applyProps(config);
    },

    // Normalize some scene-wide settings that apply to the final, merged scene
    finalize(config) {
        // Replace global scene properties
        config = SceneLoader.applyGlobalProperties(config);

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

        return config;
    }

};

// Flatten nested properties for simpler string look-ups
// e.g. global.background.color -> 'global:background:color'
function flattenProperties (obj, separator = ':', prefix = null, props = {}) {
    prefix = prefix ? (prefix + separator) : '';

    for (let p in obj) {
        let key = prefix + p;
        let val = obj[p];
        props[key] = val;

        if (typeof val === 'object' && !Array.isArray(val)) {
            flattenProperties(val, separator, key, props);
        }
    }
    return props;
}
