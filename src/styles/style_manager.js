// Manage rendering styles

import Utils from '../utils/utils';
import ShaderProgram from '../gl/shader_program';
import shaderSources from '../gl/shader_sources'; // built-in shaders
import {Style} from './style';

import log from 'loglevel';

export var StyleManager = {};
export var Styles = {};
export var BaseStyles = {};

StyleManager.styles = Styles;

// Set the base object used to instantiate styles
StyleManager.baseStyle = Style;

// Global configuration for all styles
StyleManager.init = function () {
    if (StyleManager.initialized) {
        return;
    }

    ShaderProgram.removeBlock('global');

    // Layer re-ordering function
    ShaderProgram.addBlock('global', shaderSources['gl/shaders/layer_order']);

    // Feature selection global
    ShaderProgram.addBlock('global', shaderSources['gl/shaders/selection_globals']);

    // World position wrapping
    ShaderProgram.addBlock('global', shaderSources['gl/shaders/world_position_wrap']);

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
    BaseStyles[style.name] = style;
};

// Remove a style
StyleManager.remove = function (name) {
    delete Styles[name];
};

// Preloads network resources in the stylesheet (shaders, textures, etc.)
StyleManager.preload = function (styles, base) {
    // First load remote styles, then load shader blocks from remote URLs
    return StyleManager.loadRemoteStyles(styles, base).then(styles => StyleManager.loadShaderBlocks(styles, base));
};

// Load style definitions from external URLs
StyleManager.loadRemoteStyles = function (styles, base) {
    // Collect URLs and modes to import from them
    // This is done as a separate step becuase it is possible to import multiple modes from a single
    // URL, and we want to avoid duplicate calls for the same file.
    var urls = {};
    for (var name in styles) {
        var style = styles[name];
        if (style.url) {
            let url = style.url;
            if (base) {
                url = Utils.addBaseURL(url, base);
            }

            if (!urls[url]) {
                urls[url] = [];
            }

            // Make a list of the styles to import for this URL
            urls[url].push({
                target_name: name,
                source_name: style.name || name
            });
        }
    }

    // As each URL finishes loading, replace the target style(s)
    return Promise.all(Object.keys(urls).map(url => {
        return new Promise((resolve, reject) => {
            Utils.loadResource(url).then((data) => {
                // Mixin remote styles, within each remote file
                for (var source_style in data) {
                    StyleManager.mix(data[source_style], data);
                }

                // Add remote styles to local styles
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
StyleManager.loadShaderBlocks = function (styles, base) {
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
                            let url = block[b].url;
                            if (base) {
                                url = Utils.addBaseURL(url, base);
                            }

                            queue.push(Utils.io(Utils.cacheBusterForUrl(url)).then((data) => {
                                _blocks[_key][_index] = data;
                            }).catch((error) => {
                                log.error(`StyleManager.loadShaderBlocks: error loading shader block`, _blocks, _key, _index, error);
                            }));
                        }
                    }
                }
                // Single block
                else if (typeof block === 'object' && block.url) {
                    let url = block.url;
                    if (base) {
                        url = Utils.addBaseURL(url, base);
                    }

                    queue.push(Utils.io(Utils.cacheBusterForUrl(url)).then((data) => {
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

StyleManager.mix = function (style, styles) {
    // Exit early if we have already applied mixins to this style
    if (style.mixed) {
        return style;
    }

    // Mixin sources, in order
    let sources = [];
    if (style.mix) {
        if (Array.isArray(style.mix)) {
            sources.push(...style.mix);
        }
        else {
            sources.push(style.mix);
        }
        sources = sources.map(x => styles[x]).filter(x => x);
    }
    sources.push(style);

    // Flags - OR'd, true if any style has it set
    style.animated = sources.some(x => x && x.animated);
    style.texcoords = sources.some(x => x && x.texcoords);

    // Overwrites - last definition wins
    style.base = sources.map(x => x.base).filter(x => x).pop();
    style.texture = sources.map(x => x.texture).filter(x => x).pop();

    // Merges - property-specific rules for merging values
    style.defines = Object.assign({}, ...sources.map(x => x.defines).filter(x => x));
    style.material = Object.assign({}, ...sources.map(x => x.material).filter(x => x));

    let merge = sources.map(x => x.shaders).filter(x => x);
    let shaders = {};
    shaders.defines = Object.assign({}, ...merge.map(x => x.defines).filter(x => x));
    shaders.uniforms = Object.assign({}, ...merge.map(x => x.uniforms).filter(x => x));

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

    style.shaders = shaders;
    style.mixed = true; // track that we already applied mixins (avoid dupe work later)

    return style;
};

// Create a new style
// name: name of new style
// config: properties of new style
// styles: working set of styles being built (used for mixing in existing styles)
StyleManager.create = function (name, config, styles = {}) {
    let style = Object.assign({}, config); // shallow copy
    style.name = name;

    // Style mixins
    StyleManager.mix(style, styles);

    // Has base style?
    // Only renderable (instantiated) styles should be included for run-time use
    // Others are intermediary/abstract, used during style composition but not execution
    if (style.base && BaseStyles[style.base]) {
        Styles[name] = style = Object.assign(Object.create(BaseStyles[style.base]), style);
    }

    return style;
};

// Called to create and initialize styles
StyleManager.build = function (styles, scene = {}) {
    // Sort styles by dependency, then build them
    let style_deps = Object.keys(styles).sort(
        (a, b) => StyleManager.inheritanceDepth(a, styles) - StyleManager.inheritanceDepth(b, styles)
    );

    // Only keep built-in base styles
    for (let sname in Styles) {
        if (!BaseStyles[sname]) {
            delete Styles[sname];
        }
    }

    // Working set of styles being built
    let ws = {};
    for (let sname of style_deps) {
        ws[sname] = StyleManager.create(sname, styles[sname], ws);
    }

    StyleManager.initStyles();
    return Styles;
};

// Initialize all styles
StyleManager.initStyles = function () {
    // Initialize all
    for (let sname in Styles) {
        Styles[sname].init();
    }
};

// Given a style key in a set of styles to add, count the length of the inheritance chain
// TODO: remove current (Styles) and future (styles) duplication, confusing
StyleManager.inheritanceDepth = function (key, styles) {
    let parents = 0;

    while(true) {
        let style = styles[key];
        if (!style) {
            // this is a scene def error, trying to extend a style that doesn't exist
            // TODO: warn/throw?
            break;
        }

        // Dependency chain ends when this style isn't mixing in any others
        if (!style.mix) {
            break;
        }

        // Traverse next parent style
        parents++;

        if (Array.isArray(style.mix)) {
            // If multiple mixins, find the deepest one
            parents += Math.max(...style.mix.map(s => StyleManager.inheritanceDepth(s, styles)));
            break;
        }
        else {
            // If single mixin, continue loop up the tree
            key = style.mix;
        }
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

// Get all styles with mesh data for a given tile
StyleManager.stylesForTile = function (tile) {
    let styles = [];
    for (let s in Styles) {
        if (Styles[s].hasDataForTile(tile)) {
            styles.push(s);
        }
    }
    return styles;
};
