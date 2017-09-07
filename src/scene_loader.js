import log from './utils/log';
import GLSL from './gl/glsl';
import * as URLs from './utils/urls';
import mergeObjects from './utils/merge';
import subscribeMixin from './utils/subscribe';
import {createSceneBundle, isGlobal} from './scene_bundle';

var SceneLoader;

export default SceneLoader = {

    // Load scenes definitions from URL & proprocess
    loadScene(url, { path, type } = {}) {
        let errors = [];
        return this.loadSceneRecursive({ url, path, type }, null, errors).
            then(result => this.finalize(result)).
            then(({ config, bundle }) => {
                if (!config) {
                    // root scene failed to load, reject with first error
                    return Promise.reject(errors[0]);
                }
                else if (errors.length > 0) {
                    // scene loaded, but some imports had errors
                    errors.forEach(error => {
                        let message = `Failed to import scene: ${error.url}`;
                        log('error', message, error);
                        this.trigger('error', { type: 'scene_import', message, error, url: error.url });
                    });
                }
                return { config, bundle };
            });
    },

    // Loads scene files from URL, recursively loading 'import' scenes
    // Optional *initial* path only (won't be passed to recursive 'import' calls)
    // Useful for loading resources in base scene file from a separate location
    // (e.g. in Tangram Play, when modified local scene should still refer to original resource URLs)
    loadSceneRecursive({ url, path, type }, parent, errors = []) {
        if (!url) {
            return Promise.resolve({});
        }

        let bundle = createSceneBundle(url, path, parent, type);

        return bundle.load().then(config => {
            this.normalize(config, bundle);
            if (config.import == null) {
                return { config, bundle };
            }

            // accept single entry or array
            if (!Array.isArray(config.import)) {
                config.import = [config.import]; // convert to array
            }

            // Collect URLs of scenes to import
            let imports = [];
            config.import.forEach(url => {
                // Convert scene objects to URLs
                if (typeof url === 'object') {
                    url = URLs.createObjectURL(new Blob([JSON.stringify(url)]));
                }

                imports.push(bundle.resourceFor(url));
            });
            delete config.import; // don't want to merge this property

            return Promise.
                all(imports.map(resource => this.loadSceneRecursive(resource, bundle, errors))).
                    then(results => {
                        let configs = results.map(r => r.config);
                        config = mergeObjects({}, ...configs, config);
                        return { config, bundle };
                    });
        }).catch(error => {
            // Collect scene load errors as we go
            error.url = url;
            errors.push(error);
            return {};
        });
    },

    // Normalize properties that should be adjust within each local scene file (usually by path)
    normalize(config, bundle) {
        this.normalizeDataSources(config, bundle);
        this.normalizeFonts(config, bundle);
        this.normalizeTextures(config, bundle);
        return { config, bundle };
    },

    // Expand paths for data source
    normalizeDataSources(config, bundle) {
        config.sources = config.sources || {};

        for (let sn in config.sources) {
            this.normalizeDataSource(config.sources[sn], bundle);
        }

        return config;
    },

    normalizeDataSource(source, bundle) {
        source.url = bundle.urlFor(source.url);

        if (Array.isArray(source.scripts)) {
            source.scripts = source.scripts.map(url => bundle.urlFor(url));
        }

        return source;
    },

    // Expand paths for fonts
    normalizeFonts(config, bundle) {
        config.fonts = config.fonts || {};

        for (let family in config.fonts) {
            if (Array.isArray(config.fonts[family])) {
                config.fonts[family].forEach(face => {
                    face.url = face.url && bundle.urlFor(face.url);
                });
            }
            else {
                let face = config.fonts[family];
                face.url = face.url && bundle.urlFor(face.url);
            }
        }

        return config;
    },

    // Expand paths and centralize texture definitions for a scene object
    normalizeTextures(config, bundle) {
        config.textures = config.textures || {};

        // Add current scene's base path to globally defined textures
        // Only adds path for textures with relative URLs, so textures in imported scenes get the base
        // path of their immediate scene file
        if (config.textures) {
            for (let tn in config.textures) {
                let texture = config.textures[tn];
                if (texture.url) {
                    texture.url = bundle.urlFor(texture.url);
                }
            }
        }

        // Resolve URLs for inline textures
        if (config.styles) {
            for (let sn in config.styles) {
                let style = config.styles[sn];

                // Style `texture`
                let tex = style.texture;
                if (typeof tex === 'string' && !config.textures[tex] && !isGlobal(tex)) {
                    style.texture = bundle.urlFor(tex);
                }

                // Material
                if (style.material) {
                    ['emission', 'ambient', 'diffuse', 'specular', 'normal'].forEach(prop => {
                        // Material property has a texture
                        let tex = style.material[prop] != null && style.material[prop].texture;
                        if (typeof tex === 'string' && !config.textures[tex] && !isGlobal(tex)) {
                            style.material[prop].texture = bundle.urlFor(tex);
                        }
                    });
                }

                // Shader uniforms
                if (style.shaders && style.shaders.uniforms) {
                    GLSL.parseUniforms(style.shaders.uniforms).forEach(({type, value, key, uniforms}) => {
                        // Texture by URL (string-named texture not referencing existing texture definition)
                        if (type === 'sampler2D' && typeof value === 'string' && !config.textures[value] && !isGlobal(value)) {
                            uniforms[key] = bundle.urlFor(value);
                        }
                    });
                }
            }
        }

        return config;
    },

    // Substitutes global scene properties (those defined in the `config.global` object) for any style values
    // of the form `global.`, for example `color: global.park_color` would be replaced with the value (if any)
    // defined for the `park_color` property in `config.global.park_color`.
    applyGlobalProperties(config, applied) {
        if (!config.global || Object.keys(config.global).length === 0) {
            return config; // no global properties to transform
        }

        // Parse properties from globals
        const separator = ':';
        const props = flattenProperties(config.global, separator);

        // Re-apply previously applied properties
        // NB: a current shortcoming here is that you cannot "un-link" a target property from a global
        // at run-time. Once a global property substitution has been recorderd, it will always be re-applied
        // on subsequent scene updates, even if the target property was updated to another literal value.
        // This is unlikely to be a common occurrence an acceptable limitation for now.
        applied.forEach(({ prop, target, key }) => {
            if (target) {
                target[key] = props[prop];
                // log('info', `Re-applying ${prop} with value ${props[prop]} to key ${key} in`, target);
            }
        });

        // Recursively look-up a global property name. Allows globals to refer to other globals, e.g.:
        // global:
        //    color: global.secret_color
        //    secret_color: red
        function lookupGlobalName (key, props, stack = []) {
            if (stack.indexOf(key) > -1) {
                log({ level: 'warn', once: true }, `Global properties: cyclical reference detected`, stack);
                return;
            }
            stack.push(key);

            const prop = (key.slice(0, 7) === 'global.') && (key.slice(7).replace(/\./g, separator));
            if (prop && props[prop] !== undefined) {
                if (typeof props[prop] === 'string' && props[prop].slice(0, 7) === 'global.') {
                    return lookupGlobalName(props[prop], props, stack);
                }
                return prop;
            }
        }

        // Find and apply new properties
        function applyGlobals (obj, target, key) {
            // Convert string
            if (typeof obj === 'string') {
                const prop = lookupGlobalName(obj, props);
                const val = props[prop];
                if (val !== undefined) {
                    // Save record of where property is applied
                    applied.push({ prop, target, key });

                    // Apply property
                    obj = val;
                }
            }
            // Loop through object keys or array indices
            else if (Array.isArray(obj)) {
                for (let p=0; p < obj.length; p++) {
                    obj[p] = applyGlobals(obj[p], obj, p);
                }
            }
            else if (typeof obj === 'object') {
                for (let p in obj) {
                    obj[p] = applyGlobals(obj[p], obj, p);
                }
            }
            return obj;
        }

        return applyGlobals(config);
    },

    // Move inline (URL string) textures to the scene's top-level set of textures (config.textures).
    // There are 3 such cases of textures:
    // - in a style's `texture` property
    // - in a style's `material` properties
    // - in a style's custom uniforms (`shaders.uniforms`)
    hoistTextures (config) {
        if (config.styles) {
            for (let sn in config.styles) {
                let style = config.styles[sn];

                // Style `texture`
                let tex = style.texture;
                if (typeof tex === 'string' && !config.textures[tex]) {
                    let url = tex;
                    let name = isGlobal(url) ? `texture-${url}` : url;
                    config.textures[name] = { url };
                    style.texture = name;
                }

                // Material
                if (style.material) {
                    ['emission', 'ambient', 'diffuse', 'specular', 'normal'].forEach(prop => {
                        // Material property has a texture
                        let tex = style.material[prop] != null && style.material[prop].texture;
                        if (typeof tex === 'string' && !config.textures[tex]) {
                            let url = tex;
                            let name = isGlobal(url) ? `texture-${url}` : url;
                            config.textures[name] = { url };
                            style.material[prop].texture = name;
                        }
                    });
                }

                // Shader uniforms
                if (style.shaders && style.shaders.uniforms) {
                    GLSL.parseUniforms(style.shaders.uniforms).forEach(({type, value, key, uniforms}) => {
                        // Texture by URL (string-named texture not referencing existing texture definition)
                        if (type === 'sampler2D' && typeof value === 'string' && !config.textures[value]) {
                            let url = value;
                            let name = isGlobal(url) ? `texture-${url}` : url;
                            config.textures[name] = { url };
                            uniforms[key] = name;
                        }
                    });
                }
            }
        }
    },

    // Normalize some scene-wide settings that apply to the final, merged scene
    finalize({ config, bundle }) {
        if (!config) {
            return {};
        }

        // Ensure top-level properties
        config.scene = config.scene || {};
        config.cameras = config.cameras || {};
        config.lights = config.lights || {};
        config.styles = config.styles || {};
        config.layers = config.layers || {};

        // If only one camera specified, set it as default
        if (config.camera) {
            config.cameras.default = config.camera;
        }

        // If no cameras specified, create one
        if (Object.keys(config.cameras).length === 0) {
            config.cameras.default = {};
        }

        // If no lights specified, create default
        if (Object.keys(config.lights).length === 0 ||
            Object.keys(config.lights).every(i => config.lights[i].visible === false)) {
            config.lights.default_light = {
                type: 'directional'
            };
        }

        return { config, bundle };
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

subscribeMixin(SceneLoader);
