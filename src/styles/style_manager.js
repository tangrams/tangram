// Manage rendering styles

import Utils from '../utils/utils';
import ShaderProgram from '../gl/shader_program';
import shaderSources from '../gl/shader_sources'; // built-in shaders

import {Style} from './style';
import {Polygons} from './polygons/polygons';
import {Points} from './points/points';
import {Sprites} from './sprites/sprites';
import {TextStyle} from './text/text';

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

    ShaderProgram.removeBlock('globals');

    // Layer re-ordering function
    ShaderProgram.addBlock('globals', shaderSources['gl/shaders/layer_order']);

    // Feature selection globals
    ShaderProgram.addBlock('globals', shaderSources['gl/shaders/selection_globals']);

    // Feature selection vertex shader support
    ShaderProgram.replaceBlock('feature-selection-vertex', shaderSources['gl/shaders/selection_vertex']);

    // assume min 16-bit depth buffer, in practice uses 14-bits, 1 extra bit to handle virtual half-layers
    // for outlines (inserted in between layers), another extra bit to prevent precision loss
    ShaderProgram.defines.TANGRAM_LAYER_DELTA = 1 / (1 << 14);

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
    // First load remote styles, then load shader blocks from remote URLs
    return StyleManager.loadRemoteStyles(styles).then(StyleManager.loadShaderBlocks);
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

                this.selection = false;
            }).catch((error) => {
                log.error(`StyleManager.preload: error importing style(s) ${JSON.stringify(urls[url])} from ${url}`, error);
            });
        });
    })).then(() => Promise.resolve(styles));
};

// Preload shader blocks from external URLs
StyleManager.loadShaderBlocks = function (styles) {
    var queue = [];
    for (var style of Utils.values(styles)) {
        if (style.shaders && style.shaders.blocks) {
            let _blocks = style.shaders.blocks;

            for (let [key, block] of Utils.entries(style.shaders.blocks)) {
                let _key = key;

                // Array of blocks
                if (Array.isArray(block)) {
                    for (let b=0; b < block.length; b++) {
                        if (typeof block[b] === 'object' && block[b].url) {
                            let _index = b;
                            queue.push(Utils.io(Utils.cacheBusterForUrl(block[b].url)).then((data) => {
                                _blocks[_key][_index] = data;
                            }).catch((error) => {
                                log.error(`StyleManager.loadShaderBlocks: error loading shader block`, _blocks, _key, _index, error);
                            }));
                        }
                    }
                }
                // Single block
                else if (typeof block === 'object' && block.url) {
                    queue.push(Utils.io(Utils.cacheBusterForUrl(block.url)).then((data) => {
                        _blocks[_key] = data;
                    }).catch((error) => {
                        log.error(`StyleManager.loadShaderBlocks: error loading shader block`, _blocks, _key, error);
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

    Styles[name].name = name;
    Styles[name].initialized = false;
    Styles[name].defines = Object.assign({}, base.defines||{}, settings.defines||{});

    // Merge shaders: defines, uniforms, blocks
    let shaders = {};
    let merge = [base.shaders, settings.shaders]; // first merge base (inherited) style shaders
    merge = merge.filter(x => x); // remove null objects

    shaders.defines = Object.assign({}, ...merge.map(x => x.defines).filter(x => x));
    shaders.uniforms = Object.assign({}, ...merge.map(x => x.uniforms).filter(x => x));

    // Merge blocks
    merge.map(x => x.blocks).filter(x => x).forEach(blocks => {
        shaders.blocks = shaders.blocks || {};

        for (let [t, block] of Utils.entries(blocks)) {
            shaders.blocks[t] = shaders.blocks[t] || [];

            if (Array.isArray(block)) {
                shaders.blocks[t].push(...block);
            }
            else {
                shaders.blocks[t].push(block);
            }
        }
    });

    Styles[name].shaders = shaders;

    return Styles[name];
};

// Called to create or update styles from stylesheet

StyleManager.build = function (styles, scene = {}) {
    // Sort styles by dependency, then build them
    let style_deps = Object.keys(styles).sort(
        (a, b) => StyleManager.inheritanceDepth(a, styles) - StyleManager.inheritanceDepth(b, styles)
    );

    for (let sname of style_deps) {
        Styles[sname] = StyleManager.update(sname, styles[sname]);
    }

    StyleManager.initStyles(scene);
    return Styles;
};

// Initialize all styles
StyleManager.initStyles = function (scene) {
    // Initialize all
    for (let sname in Styles) {
        Styles[sname].init({ device_pixel_ratio: scene.device_pixel_ratio });
    }
};

// Given a style key in a set of styles to add, count the length of the inheritance chain
// TODO: remove current (Styles) and future (styles) duplication, confusing
StyleManager.inheritanceDepth = function (key, styles) {
    let parents = 0;

    while(true) {
        // Find style either in existing instances, or stylesheet
        let style = Styles[key] || styles[key];
        if (!style) {
            // this is a scene def error, trying to extend a style that doesn't exist
            // TODO: warn/throw?
            break;
        }

        // The end of the inheritance chain:
        // a built-in style that doesn't extend another built-in style
        if (!style.extends && typeof style.isBuiltIn === 'function' && style.isBuiltIn()) {
            break;
        }

        // Traverse next parent style
        parents++;
        key = style.extends;
    }
    return parents;
};

// Compile all styles
StyleManager.compile = function (keys) {
    keys = keys || Object.keys(Styles);
    for (let key of keys) {
        try {
            Styles[key].compile();
            log.trace(`StyleManager.compile(): compiled style ${key}`);
        }
        catch(error) {
            log.error(`StyleManager.compile(): error compiling style ${key}:`, error);
        }
    }

    log.debug(`StyleManager.compile(): compiled all styles`);
};

// Add built-in rendering styles
StyleManager.register(Polygons);
StyleManager.register(Points);
StyleManager.register(Sprites);
StyleManager.register(TextStyle);
