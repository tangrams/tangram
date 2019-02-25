import log from '../utils/log';
import GLSL from '../gl/glsl';
import * as URLs from '../utils/urls';
import mergeObjects from '../utils/merge';
import subscribeMixin from '../utils/subscribe';
import {createSceneBundle, isGlobal} from './scene_bundle';
import {isReserved} from '../styles/layer';

var SceneLoader;

export default SceneLoader = {

    // Load scenes definitions from URL & proprocess
    async loadScene(url, { path, type } = {}) {
        if (typeof url === 'undefined') {
            return Promise.reject(Error('No scene url found'));
        }
        let errors = [];
        const scene = await this.loadSceneRecursive({ url, path, type }, null, errors);
        const { config, bundle } = this.finalize(scene);
        if (!config) {
            // root scene failed to load, reject with first error
            throw errors[0];
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
    },

    // Loads scene files from URL, recursively loading 'import' scenes
    // Optional *initial* path only (won't be passed to recursive 'import' calls)
    // Useful for loading resources in base scene file from a separate location
    // (e.g. in Tangram Play, when modified local scene should still refer to original resource URLs)
    async loadSceneRecursive({ url, path, type }, parent, errors = []) {
        if (!url) {
            return {};
        }

        let bundle = createSceneBundle(url, path, parent, type);

        try {
            let config = await bundle.load();
            // debugger
            if (config.import == null) {
                this.normalize(config, bundle);
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

            // load and normalize imports
            const queue = imports.map(resource => this.loadSceneRecursive(resource, bundle, errors));
            const configs = (await Promise.all(queue))
                .map(r => this.normalize(r.config, r.bundle))
                .map(r => r.config);

            config = mergeObjects(...configs, config);
            this.normalize(config, bundle); // last normalize parent, after merge
            return { config, bundle };
        }
        catch (error) {
            // Collect scene load errors as we go
            error.url = url;
            errors.push(error);
            return {};
        }
    },

    // Normalize properties that should be adjust within each local scene file (usually by path)
    normalize(config, bundle) {
        this.normalizeDataSources(config, bundle);
        this.normalizeFonts(config, bundle);
        this.normalizeTextures(config, bundle);
        this.hoistTextures(config, bundle);
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

        // composite untiled raster sources
        if (Array.isArray(source.composite)) {
            source.composite.forEach(c => c.url = bundle.urlFor(c.url));
        }

        // custom scripts
        if (source.scripts) {
            // convert legacy array-style scripts to object format (script URL is used as both key and value)
            if (Array.isArray(source.scripts)) {
                source.scripts = source.scripts.reduce((val, cur) => { val[cur] = cur; return val; }, {});
            }

            // resolve URLs for external scripts
            for (let s in source.scripts) {
                source.scripts[s] = bundle.urlFor(source.scripts[s]);
            }
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
    },

    // Move inline (URL string) textures to the scene's top-level set of textures (config.textures).
    // There are 4 such cases of textures:
    // - in a style's `texture` property
    // - in a style's `material` properties
    // - in a style's custom uniforms (`shaders.uniforms`)
    // - in a draw groups `texture` property
    hoistTextures (config, bundle) {
        // Resolve URLs for inline textures
        if (config.styles) {
            for (let sn in config.styles) {
                let style = config.styles[sn];

                // Style `texture`
                let tex = style.texture;
                if (typeof tex === 'string' && !config.textures[tex]) {
                    style.texture = this.hoistTexture(tex, config, bundle);
                }

                // Material
                if (style.material) {
                    ['emission', 'ambient', 'diffuse', 'specular', 'normal'].forEach(prop => {
                        // Material property has a texture
                        let tex = style.material[prop] != null && style.material[prop].texture;
                        if (typeof tex === 'string' && !config.textures[tex]) {
                            style.material[prop].texture = this.hoistTexture(tex, config, bundle);
                        }
                    });
                }
            }
        }

        // Special handling for shader uniforms, exclude globals because they are ambiguous:
        // could later be resolved to a string value indicating a texture, but could also be a vector or other type
        this.hoistStyleShaderUniformTextures(config, bundle, { include_globals: false });

        // Resolve and hoist inline textures in draw blocks
        if (config.layers) {
            let stack = [config.layers];
            while (stack.length > 0) {
                let layer = stack.pop();

                // only recurse into objects
                if (typeof layer !== 'object' || Array.isArray(layer)) {
                    continue;
                }

                for (let prop in layer) {
                    if (prop === 'draw') { // process draw groups for current layer
                        let draws = layer[prop];
                        for (let group in draws) {
                            if (draws[group].texture) {
                                let tex = draws[group].texture;
                                if (typeof tex === 'string' && !config.textures[tex]) {
                                    draws[group].texture = this.hoistTexture(tex, config, bundle);
                                }
                            }

                            // special handling for outlines :(
                            if (draws[group].outline && draws[group].outline.texture) {
                                let tex = draws[group].outline.texture;
                                if (typeof tex === 'string' && !config.textures[tex]) {
                                    draws[group].outline.texture = this.hoistTexture(tex, config, bundle);
                                }
                            }
                        }

                    }
                    else if (isReserved(prop)) {
                        continue; // skip reserved keyword
                    }
                    else {
                        stack.push(layer[prop]); // traverse sublayer
                    }
                }
            }
        }
    },

    hoistStyleShaderUniformTextures (config, bundle, { include_globals }) {
        // Resolve URLs for inline textures
        if (config.styles) {
            for (let sn in config.styles) {
                let style = config.styles[sn];

                // Shader uniforms
                if (style.shaders && style.shaders.uniforms) {
                    GLSL.parseUniforms(style.shaders.uniforms).forEach(({type, value, key, uniforms}) => {
                        // Texture by URL (string-named texture not referencing existing texture definition)
                        if (type === 'sampler2D' && typeof value === 'string' && !config.textures[value] &&
                            (include_globals || !isGlobal(value))) {
                            uniforms[key] = this.hoistTexture(value, config, bundle);
                        }
                    });
                }
            }
        }
    },

    // Convert an inline URL texture to a global one, and return the texture's (possibly modified) name
    hoistTexture (tex, config, bundle) {
        let global = isGlobal(tex);
        let url = global ? tex : bundle.urlFor(tex);
        let name = global ? `texture-${url}` : url;
        config.textures[name] = { url };
        return name;
    },

    // Substitutes global scene properties (those defined in the `config.global` object) for any style values
    // of the form `global.`, for example `color: global.park_color` would be replaced with the value (if any)
    // defined for the `park_color` property in `config.global.park_color`.
    applyGlobalProperties(config) {
        if (!config.global || Object.keys(config.global).length === 0) {
            return config; // no global properties to transform
        }

        const globals = flattenProperties(config.global); // flatten nested globals for simpler string look-ups

        // Find and apply new global properties (and re-apply old ones)
        function applyGlobals (obj, target, key) {
            let prop;

            // Check for previously applied global substitution
            if (target != null && typeof target === 'object' && target._global_prop && target._global_prop[key]) {
                prop = target._global_prop[key];
            }
            // Check string for new global substitution
            else if (typeof obj === 'string' && obj.slice(0, 7) === 'global.') {
                prop = obj;
            }

            // Found global property to substitute
            if (prop) {
                // Mark property as global substitution
                if (target._global_prop == null) {
                    Object.defineProperty(target, '_global_prop', { value: {} });
                }
                target._global_prop[key] = prop;

                // Get current global value
                let val = globals[prop];
                let stack;
                while (typeof val === 'string' && val.slice(0, 7) === 'global.') {
                    // handle globals that refer to other globals, detecting any cyclical references
                    stack = stack || [prop];
                    if (stack.indexOf(val) > -1) {
                        log({ level: 'warn', once: true }, 'Global properties: cyclical reference detected', stack);
                        val = null;
                        break;
                    }
                    stack.push(val);
                    val = globals[val];
                }

                // Create getter/setter
                Object.defineProperty(target, key, {
                    enumerable: true,
                    get: function () {
                        return val; // return substituted value
                    },
                    set: function (v) {
                        // clear the global substitution and remove the getter/setter
                        delete target._global_prop[key];
                        delete target[key];
                        target[key] = v; // save the new value
                    }
                });
            }
            // Loop through object keys or array indices
            else if (Array.isArray(obj)) {
                for (let p=0; p < obj.length; p++) {
                    applyGlobals(obj[p], obj, p);
                }
            }
            else if (typeof obj === 'object') {
                for (let p in obj) {
                    applyGlobals(obj[p], obj, p);
                }
            }
            return obj;
        }

        return applyGlobals(config);
    },

    // Normalize some scene-wide settings that apply to the final, merged scene
    finalize({ config, bundle }) {
        if (!config) {
            return {};
        }

        // Ensure top-level properties
        config.global = config.global || {};
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
function flattenProperties (obj, prefix = null, globals = {}) {
    prefix = prefix ? (prefix + '.') : 'global.';

    for (const p in obj) {
        const key = prefix + p;
        const val = obj[p];
        globals[key] = val;

        if (typeof val === 'object' && !Array.isArray(val)) {
            flattenProperties(val, key, globals);
        }
    }
    return globals;
}

subscribeMixin(SceneLoader);
