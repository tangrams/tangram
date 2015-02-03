// Manage rendering styles

import Utils from '../utils/utils';
import ShaderProgram from '../gl/shader_program';
import shaderSources from '../gl/shader_sources'; // built-in shaders

import {Style} from './style';
import {Polygons} from './polygons/polygons';
import {Points} from './points/points';

import log from 'loglevel';

export var StyleManager = {};
export var Styles = {};

// Set the base object used to instantiate styles
StyleManager.baseStyle = Style;

// Global configuration for all styles
StyleManager.init = function () {
    if (StyleManager.initialized) {
        return;
    }

    ShaderProgram.removeTransform('globals');

    // Layer re-ordering function
    ShaderProgram.addTransform('globals', shaderSources['gl/shaders/reorder_layers']);

    // Spherical environment map
    ShaderProgram.addTransform('globals', `
        #if defined(LIGHTING_ENVIRONMENT)
        ${shaderSources['gl/shaders/spherical_environment_map']}
        #endif
    `);

    StyleManager.initialized = true;
};

// Destroy all styles for a given GL context
StyleManager.destroy = function (gl) {
    Object.keys(Styles).forEach((_name) => {
        var style = Styles[_name];
        if (style.gl === gl) {
            log.trace(`StyleManager.destroy: destroying render style ${style.name}`);

            if (!style.isBuiltIn()) {
                StyleManager.remove(style.name);
            }
            style.destroy();
        }
    });
};

// Register a style
StyleManager.register = function (style) {
    Styles[style.name] = style;
};

// Remove a style
StyleManager.remove = function (name) {
    delete Styles[name];
};

// Preloads network resources in the stylesheet (shaders, textures, etc.)
StyleManager.preload = function (styles) {
    if (!styles) {
        return Promise.resolve();
    }

    // First load remote styles, then load shader blocks from remote URLs
    // TODO: also preload textures
    StyleManager.normalizeTextures(styles);
    return StyleManager.loadRemoteStyles(styles).then(StyleManager.loadRemoteShaderTransforms);
};

// Handle single or multi-texture syntax, for stylesheet convenience
StyleManager.normalizeTextures = function (styles) {
    for (var style of Utils.values(styles)) {
        style.textures = style.textures || {};

        // Support simpler single texture syntax
        if (style.texture) {
            style.textures.default = style.texture; // alias single texture to 'default'
        }
    }
    return styles;
};

// Load style definitions from external URLs
StyleManager.loadRemoteStyles = function (styles) {
    // Collect URLs and modes to import from them
    // This is done as a separate step becuase it is possible to import multiple modes from a single
    // URL, and we want to avoid duplicate calls for the same file.
    var urls = {};
    for (var name in styles) {
        var style = styles[name];
        if (style.url) {
            if (!urls[style.url]) {
                urls[style.url] = [];
            }

            // Make a list of the styles to import for this URL
            urls[style.url].push({
                target_name: name,
                source_name: style.name || name
            });
        }
    }

    // As each URL finishes loading, replace the target style(s)
    return Promise.all(Object.keys(urls).map(url => {
        return new Promise((resolve, reject) => {
            Utils.loadResource(url).then((data) => {
                for (var target of urls[url]) {
                    if (data && data[target.source_name]) {
                        styles[target.target_name] = data[target.source_name];
                    }
                    else {
                        delete styles[target.target_name];
                        return reject(new Error(`StyleManager.preload: error importing style ${target.target_name}, could not find source style ${target.source_name} in ${url}`));
                    }
                }
                resolve();
            }).catch((error) => {
                log.error(`StyleManager.preload: error importing style(s) ${JSON.stringify(urls[url])} from ${url}`, error);
            });
        });
    })).then(() => Promise.resolve(styles));
};

// Preload shader blocks from external URLs
StyleManager.loadRemoteShaderTransforms = function (styles) {
    var queue = [];
    for (var style of Utils.values(styles)) {
        if (style.shaders && style.shaders.transforms) {
            let _transforms = style.shaders.transforms;

            for (var [key, transform] of Utils.entries(style.shaders.transforms)) {
                let _key = key;

                // Array of transforms
                if (Array.isArray(transform)) {
                    for (let t=0; t < transform.length; t++) {
                        if (typeof transform[t] === 'object' && transform[t].url) {
                            let _index = t;
                            queue.push(Utils.io(Utils.cacheBusterForUrl(transform[t].url)).then((data) => {
                                _transforms[_key][_index] = data;
                            }).catch((error) => {
                                log.error(`StyleManager.loadRemoteShaderTransforms: error loading shader transform`, _transforms, _key, _index, error);
                            }));
                        }
                    }
                }
                // Single transform
                else if (typeof transform === 'object' && transform.url) {
                    queue.push(Utils.io(Utils.cacheBusterForUrl(transform.url)).then((data) => {
                        _transforms[_key] = data;
                    }).catch((error) => {
                        log.error(`StyleManager.loadRemoteShaderTransforms: error loading shader transform`, _transforms, _key, error);
                    }));
                }
            }
        }
    }
    return Promise.all(queue).then(() => Promise.resolve(styles)); // TODO: add error
};

// Update built-in style or create a new one
StyleManager.update = function (name, settings) {
    var base = Styles[settings.extends] || StyleManager.baseStyle;
    Styles[name] = Styles[name] || Object.create(base);
    if (Styles[settings.extends]) {
        Styles[name].super = Styles[settings.extends]; // explicit 'super' class access
    }

    for (var s in settings) {
        Styles[name][s] = settings[s];
    }

    // TODO: move these to a Style.clone method?
    Styles[name].initialized = false;
    Styles[name].defines = (base.define && Object.create(base.define)) || {};
    Styles[name].shaders = Styles[name].shaders || (base.shaders && Object.create(base.shaders)) || {};

    Styles[name].name = name;
    return Styles[name];
};

// Called to create or update styles from stylesheet
StyleManager.build = function (stylesheet_styles) {
    // Stylesheet-defined styles
    for (var name in stylesheet_styles) {
        Styles[name] = StyleManager.update(name, stylesheet_styles[name]);
    }

    // Initialize all
    for (name in Styles) {
        Styles[name].init();
    }

    return Styles;
};

// Compile all styles
StyleManager.compile = function () {
    for (var name in Styles) {
        try {
            Styles[name].compile();
            log.trace(`StyleManager.compile(): compiled style ${name}`);
        }
        catch(error) {
            log.error(`StyleManager.compile(): error compiling style ${name}:`, error);
        }
    }

    log.debug(`StyleManager.compile(): compiled all styles`);
};

// Add built-in rendering styles
StyleManager.register(Polygons);
StyleManager.register(Points);
