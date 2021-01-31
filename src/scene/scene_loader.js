import log from '../utils/log';
import GLSL from '../gl/glsl';
import * as URLs from '../utils/urls';
import mergeObjects from '../utils/merge';
import subscribeMixin from '../utils/subscribe';
import { getPropertyPath, setPropertyPath } from '../utils/props';
import { flattenGlobalProperties, applyGlobalProperties, isGlobalSubstitution } from './globals';
import { createSceneBundle } from './scene_bundle';
import { isReserved } from '../styles/layer';

const SceneLoader = {

    // Load scenes definitions from URL & proprocess
    async loadScene(url, { path, type } = {}) {
        const errors = [];
        const texture_nodes = {};
        const scene = await this.loadSceneRecursive({ url, path, type }, null, texture_nodes, errors);
        const { config, bundle } = this.finalize(scene);
        if (!config) {
            // root scene failed to load, reject with first error
            throw errors[0];
        }
        else if (errors.length > 0) {
            // scene loaded, but some imports had errors
            errors.forEach(error => {
                const message = `Failed to import scene: ${error.url}`;
                log('error', message, error);
                this.trigger('error', { type: 'scene_import', message, error, url: error.url });
            });
        }
        return { config, bundle, texture_nodes };
    },

    // Loads scene files from URL, recursively loading 'import' scenes
    // Optional *initial* path only (won't be passed to recursive 'import' calls)
    // Useful for loading resources in base scene file from a separate location
    // (e.g. in Tangram Play, when modified local scene should still refer to original resource URLs)
    async loadSceneRecursive({ url, path, type }, parent, texture_nodes = {}, errors = []) {
        if (!url) {
            return {};
        }

        const bundle = createSceneBundle(url, path, parent, type);

        try {
            let config = await bundle.load();
            if (config.import == null) {
                this.normalize(config, bundle, texture_nodes);
                return { config, bundle };
            }

            // accept single entry or array
            if (!Array.isArray(config.import)) {
                config.import = [config.import]; // convert to array
            }

            // Collect URLs of scenes to import
            const imports = [];
            config.import.forEach(url => {
                // Convert scene objects to URLs
                if (typeof url === 'object') {
                    url = URLs.createObjectURL(new Blob([JSON.stringify(url)]));
                }
                imports.push(bundle.resourceFor(url));
            });
            delete config.import; // don't want to merge this property

            // load and normalize imports
            const queue = imports.map(resource => this.loadSceneRecursive(resource, bundle, texture_nodes, errors));
            const configs = (await Promise.all(queue))
                .map(r => this.normalize(r.config, r.bundle, texture_nodes))
                .map(r => r.config);

            this.normalize(config, bundle, texture_nodes); // last normalize parent
            config = mergeObjects(...configs, config);
            return { config, bundle, texture_nodes };
        }
        catch (error) {
            // Collect scene load errors as we go
            error.url = url;
            errors.push(error);
            return {};
        }
    },

    // Normalize properties that should be adjust within each local scene file (usually by path)
    normalize(config, bundle, texture_nodes = {}) {
        this.normalizeDataSources(config, bundle);
        this.normalizeFonts(config, bundle);
        this.normalizeTextures(config, bundle);
        this.collectTextures(config, bundle, texture_nodes);
        return { config, bundle, texture_nodes };
    },

    // Expand paths for data source
    normalizeDataSources(config, bundle) {
        config.sources = config.sources || {};

        for (const sn in config.sources) {
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
            for (const s in source.scripts) {
                source.scripts[s] = bundle.urlFor(source.scripts[s]);
            }
        }

        return source;
    },

    // Expand paths for fonts
    normalizeFonts(config, bundle) {
        config.fonts = config.fonts || {};

        // Add scene base path for URL-based fonts (skip "external" fonts referencing CSS-loaded resources)
        const fonts = Object.values(config.fonts).filter(face => face !== 'external');
        for (const face of fonts) {
            const faces = (Array.isArray(face) ? face : [face]); // can be single value or array
            faces.forEach(face => face.url = bundle.urlFor(face.url));
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
            for (const tn in config.textures) {
                const texture = config.textures[tn];
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
    collectTextures(config, bundle, texture_nodes) {
        // Inline textures in styles
        if (config.styles) {
            for (const sn in config.styles) {
                const style = config.styles[sn];

                // Style `texture`
                const tex = style.texture;
                if (typeof tex === 'string' && !config.textures[tex]) {
                    const path = ['styles', sn, 'texture'];
                    this.addTextureNode(path, bundle, texture_nodes);
                }

                // Material
                if (style.material) {
                    ['emission', 'ambient', 'diffuse', 'specular', 'normal'].forEach(prop => {
                        // Material property has a texture
                        const tex = style.material[prop] != null && style.material[prop].texture;
                        if (typeof tex === 'string' && !config.textures[tex]) {
                            const path = ['styles', sn, 'material', prop, 'texture'];
                            this.addTextureNode(path, bundle, texture_nodes);
                        }
                    });
                }
            }
        }

        // Inline textures in shader uniforms
        if (config.styles) {
            for (const sn in config.styles) {
                const style = config.styles[sn];

                if (style.shaders && style.shaders.uniforms) {
                    GLSL.parseUniforms(style.shaders.uniforms).forEach(({ type, value, path }) => {
                        // Texture by URL (string-named texture not referencing existing texture definition)
                        if (type === 'sampler2D' && typeof value === 'string' && !config.textures[value]) {
                            const texture_path = ['styles', sn, 'shaders', 'uniforms', ...path];
                            this.addTextureNode(texture_path, bundle, texture_nodes);
                        }
                    });
                }
            }
        }

        // Inline textures in draw blocks
        if (config.layers) {
            const stack = [config.layers];
            const path_stack = [['layers']];
            while (stack.length > 0) {
                const layer = stack.pop();
                const layer_path = path_stack.pop();

                // only recurse into objects
                if (typeof layer !== 'object' || Array.isArray(layer)) {
                    continue;
                }

                for (const prop in layer) {
                    if (prop === 'draw') { // process draw groups for current layer
                        const draws = layer[prop];
                        for (const group in draws) {
                            if (draws[group].texture) {
                                const tex = draws[group].texture;
                                if (typeof tex === 'string' && !config.textures[tex]) {
                                    const path = [...layer_path, prop, 'draw', group, 'texture'];
                                    this.addTextureNode(path, bundle, texture_nodes);
                                }
                            }

                            // special handling for outlines :(
                            if (draws[group].outline && draws[group].outline.texture) {
                                const tex = draws[group].outline.texture;
                                if (typeof tex === 'string' && !config.textures[tex]) {
                                    const path = [...layer_path, prop, 'draw', group, 'outline', 'texture'];
                                    this.addTextureNode(path, bundle, texture_nodes);
                                }
                            }
                        }

                    }
                    else if (isReserved(prop)) {
                        continue; // skip reserved keyword
                    }
                    else {
                        stack.push(layer[prop]); // traverse sublayer
                        path_stack.push([...layer_path, prop]);
                    }
                }
            }
        }
    },

    addTextureNode (path, bundle, texture_nodes) {
        const pathKey = JSON.stringify(path);
        texture_nodes[pathKey] = {
            path,
            bundle
        };
    },

    // Hoist any remaining inline texture nodes that don't have a corresponding named texture
    // base_bundle is the bundle for the root scene, for resolving textures from global properties
    hoistTextureNodes (config, base_bundle, texture_nodes = {}) {
        for(const { path, bundle } of Object.values(texture_nodes)) {
            const curValue = getPropertyPath(config, path);

            // Make sure current property values is a string to account for global property substitutions
            // e.g. shader uniforms are ambiguous, could be replaced with string value indicating texture,
            // but could also be a float, an array indicating vector, etc.
            if (typeof curValue === 'string' && config.textures[curValue] == null) {
                if (isGlobalSubstitution(config, path)) {
                    // global substituions are resolved against the base scene path, not the import they came from
                    const url = base_bundle.urlFor(curValue);
                    config.textures[curValue] = { url };
                }
                else {
                    // non-global textures are resolved against the import they came from
                    const url = bundle.urlFor(curValue);
                    config.textures[url] = { url };
                    setPropertyPath(config, path, url);
                }
            }
        }
    },

    // Substitutes global scene properties (those defined in the `config.global` object) for any style values
    // of the form `global.`, for example `color: global.park_color` would be replaced with the value (if any)
    // defined for the `park_color` property in `config.global.park_color`.
    applyGlobalProperties(config) {
        if (!config.global || Object.keys(config.global).length === 0) {
            return config; // no global properties to transform
        }

        const globals = flattenGlobalProperties(config.global); // flatten nested globals for simpler string look-ups
        return applyGlobalProperties(globals, config);
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

subscribeMixin(SceneLoader);

export default SceneLoader;
