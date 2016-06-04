// Manage rendering styles

import Utils from '../utils/utils';
import ShaderProgram from '../gl/shader_program';
import {Style} from './style';
import mergeObjects from '../utils/merge';
import Geo from '../geo';
import log from '../utils/log';

let fs = require('fs');
const shaderSrc_accessors = fs.readFileSync(__dirname + '/../gl/shaders/accessors.glsl', 'utf8');
const shaderSrc_layerOrder = fs.readFileSync(__dirname + '/../gl/shaders/layer_order.glsl', 'utf8');
const shaderSrc_selectionGlobals = fs.readFileSync(__dirname + '/../gl/shaders/selection_globals.glsl', 'utf8');
const shaderSrc_selectionVertex = fs.readFileSync(__dirname + '/../gl/shaders/selection_vertex.glsl', 'utf8');

export var StyleManager = {};
export var Styles = {};
export var BaseStyles = {};

StyleManager.styles = Styles;

// Set the base object used to instantiate styles
StyleManager.baseStyle = Style;

// Global configuration for all styles
StyleManager.init = function () {
    ShaderProgram.removeBlock('global');
    ShaderProgram.removeBlock('setup');

    // Model and world position accessors
    ShaderProgram.addBlock('global', shaderSrc_accessors);

    // Layer re-ordering function
    ShaderProgram.addBlock('global', shaderSrc_layerOrder);

    // Feature selection global
    ShaderProgram.addBlock('global', shaderSrc_selectionGlobals);

    // Feature selection vertex shader support
    ShaderProgram.replaceBlock('setup', shaderSrc_selectionVertex);

    // Minimum value for float comparisons
    ShaderProgram.defines.TANGRAM_EPSILON = 0.00001;

    // Minimum depth buffer value separating each `order` unit
    // Assume min 16-bit depth buffer, in practice uses 14-bits, 1 extra bit to handle virtual half-layers
    // for outlines (inserted in between layers), another extra bit to prevent precision loss
    ShaderProgram.defines.TANGRAM_LAYER_DELTA = 1 / (1 << 14);

    // Internal tile scale
    ShaderProgram.defines.TANGRAM_TILE_SCALE =
        `vec3(${Geo.tile_scale}., ${Geo.tile_scale}., u_meters_per_pixel * ${Geo.tile_size}.)`;

    // Increases precision for height values
    ShaderProgram.defines.TANGRAM_HEIGHT_SCALE = Geo.height_scale;
};

// Destroy all styles for a given GL context
StyleManager.destroy = function (gl) {
    Object.keys(Styles).forEach((_name) => {
        var style = Styles[_name];
        if (style.gl === gl) {
            log('trace', `StyleManager.destroy: destroying render style ${style.name}`);

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

StyleManager.mix = function (style, styles) {
    // Exit early if we have already applied mixins to this style
    if (style.mixed) {
        return style;
    }
    style.mixed = {};

    // Mixin sources, in order
    let sources = [];
    if (style.mix) {
        if (Array.isArray(style.mix)) {
            sources.push(...style.mix);
        }
        else {
            sources.push(style.mix);
        }
        sources = sources.map(x => styles[x]).filter(x => x && x !== style); // TODO: warning on trying to mix into self

        // Track which styles were mixed into this one
        for (let s of sources) {
            style.mixed[s.name] = true;
        }
    }
    sources.push(style);

    // Flags - OR'd, true if any style has it set
    style.animated = sources.some(x => x && x.animated);
    style.texcoords = sources.some(x => x && x.texcoords);

    // Overwrites - last definition wins
    style.base = sources.map(x => x.base).filter(x => x).pop();
    style.lighting = sources.map(x => x.lighting).filter(x => x != null).pop();
    style.texture = sources.map(x => x.texture).filter(x => x).pop();
    style.raster = sources.map(x => x.raster).filter(x => x != null).pop();
    style.dash = sources.map(x => x.dash).filter(x => x != null).pop();
    style.dash_background_color = sources.map(x => x.dash_background_color).filter(x => x != null).pop();
    if (sources.some(x => x.hasOwnProperty('blend') && x.blend)) {
        // only mix blend if explicitly set, otherwise let base style choose blending mode
        // hasOwnProperty check gives preference to base style prototype
        style.blend = sources.map(x => x.hasOwnProperty('blend') && x.blend).filter(x => x).pop();
    }
    style.blend_order = sources.map(x => x.blend_order).filter(x => x != null).pop();

    // Merges - property-specific rules for merging values
    style.defines = Object.assign({}, ...sources.map(x => x.defines).filter(x => x)); // internal defines (not user-defined)
    style.material = Object.assign({}, ...sources.map(x => x.material).filter(x => x));

    // Mix shader properties
    StyleManager.mixShaders(style, styles, sources);
    return style;
};

// Mix the propertes in the "shaders" block
StyleManager.mixShaders = function (style, styles, sources) {
    let shaders = {}; // newly mixed shaders properties
    let shader_merges = sources.map(x => x.shaders).filter(x => x); // just the source styles with shader properties

    // Defines
    shaders.defines = Object.assign({}, ...shader_merges.map(x => x.defines).filter(x => x));

    // Uniforms
    shaders.uniforms = {};  // uniforms for this style, both explicitly defined, and mixed from other styles
    shaders._uniforms = (style.shaders && style.shaders.uniforms) || {}; // uniforms explicitly defined by *this* style
    shaders._uniform_scopes = {}; // tracks which style each uniform originated from (this one, or ancestor)

    // Mix in uniforms from ancestors, providing means to access
    sources
        .filter(x => x.shaders && x.shaders.uniforms)
        .forEach(x => {
            for (let u in x.shaders.uniforms) {
                shaders._uniform_scopes[u] = x.name;

                // Define getter and setter for this uniform
                // Getter returns value for this style if present, otherwise asks appropriate ancestor for it
                // Setter sets the value for this style (whether previously present in this style or not)
                // Mimics JS prototype/hasOwnProperty behavior, but with multiple ancestors (via mixins)
                Object.defineProperty(shaders.uniforms, u, {
                    enumerable: true,
                    configurable: true,
                    get: function () {
                        // Uniform is explicitly defined on this style
                        if (shaders._uniforms[u] !== undefined) {
                            return shaders._uniforms[u];
                        }
                        // Uniform was mixed from another style, forward request there
                        // Identify check is needed to prevent infinite recursion if a previously defined uniform
                        // is set to undefined
                        else if (styles[shaders._uniform_scopes[u]].shaders.uniforms !== shaders.uniforms) {
                            return styles[shaders._uniform_scopes[u]].shaders.uniforms[u];
                        }
                    },
                    set: function (v) {
                        shaders._uniforms[u] = v;
                    }
                });
            }
        });

    // Extensions: build a list of unique extensions
    shaders.extensions = Object.keys(shader_merges
        .map(x => x.extensions)
        .filter(x => x)
        .reduce((prev, cur) => {
            // single extension
            if (typeof cur === 'string') {
                prev[cur] = true;
            }
            // array of extensions
            else {
                cur.forEach(x => prev[x] = true);
            }
            return prev;
        }, {}) || {}
    );

    // Shader blocks
    // Mark all shader blocks for the target style as originating with its own name
    if (style.shaders && style.shaders.blocks) {
        style.shaders.block_scopes = style.shaders.block_scopes || {};
        for (let [k, block] of Utils.entries(style.shaders.blocks)) {
            style.shaders.block_scopes[k] = style.shaders.block_scopes[k] || [];
            if (Array.isArray(block)) {
                style.shaders.block_scopes[k].push(...block.map(() => style.name));
            }
            else {
                style.shaders.block_scopes[k].push(style.name);
            }
        }
    }

    // Merge shader blocks, keeping track of which style each block originated from
    let mixed = {}; // all scopes mixed so far
    for (let source of shader_merges) {
        if (!source.blocks) {
            continue;
        }

        shaders.blocks = shaders.blocks || {};
        shaders.block_scopes = shaders.block_scopes || {};
        let mixed_source = {}; // scopes mixed for this source style

        for (let [t, block] of Utils.entries(source.blocks)) {
            let block_scope = source.block_scopes[t];

            shaders.blocks[t] = shaders.blocks[t] || [];
            shaders.block_scopes[t] = shaders.block_scopes[t] || [];

            // standardize on arrays (block can be single or multi-value)
            block = Array.isArray(block) ? block : [block];
            block_scope = Array.isArray(block_scope) ? block_scope : [block_scope];

            for (let b=0; b < block.length; b++) {
                // Skip blocks we've already mixed in from the same scope
                // Repeating scope indicates a diamond pattern where a style is being mixed multiple times
                if (mixed[block_scope[b]]) {
                    continue;
                }
                mixed_source[block_scope[b]] = true;

                shaders.blocks[t].push(block[b]);
                shaders.block_scopes[t].push(block_scope[b]);
            }
        }

        // Add styles mixed in from this source - they could be multi-level ancestors,
        // beyond the first-level "parents" defined in this style's `mix` list
        Object.assign(mixed, mixed_source);
    }

    Object.assign(style.mixed, mixed); // add all newly mixed styles

    style.shaders = shaders; // assign back to style
    return style;
};

// Create a new style
// name: name of new style
// config: properties of new style
// styles: working set of styles being built (used for mixing in existing styles)
StyleManager.create = function (name, config, styles = {}) {
    let style = mergeObjects({}, config); // deep copy
    style.name = name;

    // Style mixins
    style = StyleManager.mix(style, styles);

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
        else {
            Styles[sname].reset();
        }
    }

    // Working set of styles being built
    let ws = {};
    for (let sname of style_deps) {
        ws[sname] = StyleManager.create(sname, styles[sname], ws);
    }

    StyleManager.initStyles(scene);
    return Styles;
};

// Initialize all styles
StyleManager.initStyles = function (scene) {
    // Initialize all
    for (let sname in Styles) {
        Styles[sname].init(scene);
    }
};

// Given a style key in a set of styles to add, count the length of the inheritance chain
StyleManager.inheritanceDepth = function (key, styles) {
    let parents = 0;

    while(true) {
        let style = styles[key];
        if (!style) {
            // this is a scene def error, trying to extend a style that doesn't exist
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
            parents += Math.max(...style.mix.map(s => {
                // Trying to mix into itself!
                if (key === s) {
                    return;
                }

                return StyleManager.inheritanceDepth(s, styles);
            }));
            break;
        }
        else {
            // Trying to mix into itself!
            if (key === style.mix) {
                break;
            }

            // If single mixin, continue loop up the tree
            key = style.mix;
        }
    }
    return parents;
};

// Compile all styles
StyleManager.compile = function (keys, scene) {
    keys = keys || Object.keys(Styles);
    for (let key of keys) {
        let style = Styles[key];
        try {
            style.compile();
            log('trace', `StyleManager.compile(): compiled style ${key}`);
        }
        catch(error) {
            log('error', `StyleManager.compile(): error compiling style ${key}:`, error);

            scene.trigger('warning', {
                type: 'styles',
                message: `Error compiling style ${key}`,
                style,
                shader_errors: style.program && style.program.shader_errors
            });
        }
    }

    log('debug', `StyleManager.compile(): compiled all styles`);
};

// Get all styles with mesh data for a given tile
StyleManager.stylesForTile = function (tile_key) {
    let styles = [];
    for (let s in Styles) {
        if (Styles[s].hasDataForTile(tile_key)) {
            styles.push(s);
        }
    }
    return styles;
};
