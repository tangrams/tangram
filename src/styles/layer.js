import {StyleParser} from './style_parser';
import Utils from '../utils/utils';
import log from '../utils/log';
import mergeObjects from '../utils/merge';
import {buildFilter} from './filter';

// N.B.: 'visible' is legacy compatibility for 'enabled'
const reserved = ['filter', 'draw', 'visible', 'enabled', 'data'];

let layer_cache = {};
export function layerCache () {
    return layer_cache;
}

function cacheKey (layers) {
    if (layers.length > 1) {
        var k = layers[0];
        for (var i=1; i < layers.length; i++) {
            k += '/' + layers[i];
        }

        return k;
    }
    return layers[0];
}

// Merge matching layer trees into a final draw group
export function mergeTrees(matchingTrees, group) {
    let draws, treeDepth = 0;

    // Find deepest tree
    for (let t=0; t < matchingTrees.length; t++) {
        if (matchingTrees[t].length > treeDepth) {
            treeDepth = matchingTrees[t].length;
        }
    }

    // No layers to parse
    if (treeDepth === 0) {
        return null;
    }

    // Merged draw group object
    let draw = {
        visible: true, // visible by default
    };

    // Iterate trees in parallel
    for (let x=0; x < treeDepth; x++) {
        // Pull out the requested draw group, for each tree, at this depth
        draws = matchingTrees.map(tree => tree[x] && tree[x][group]);
        if (draws.length === 0) {
            continue;
        }

        // Sort by layer name before merging, so layers are applied deterministically
        // when multiple layers modify the same properties
        draws.sort((a, b) => (a && a.layer_name) > (b && b.layer_name) ? 1 : -1);

        // Merge draw objects
        mergeObjects(draw, ...draws);

        // Remove layer names, they were only used transiently to sort and calculate final layer
        // (final merged names will not be accurate since only one tree can win)
        delete draw.layer_name;
    }

    // Short-circuit if not visible
    if (draw.visible === false) {
        return null;
    }

    return draw;
}

const blacklist = ['any', 'all', 'not', 'none'];

class Layer {

    constructor({ layer, name, parent, draw, visible, enabled, filter, styles }) {
        this.id = Layer.id++;
        this.config_data = layer.data;
        this.parent = parent;
        this.name = name;
        this.full_name = this.parent ? (this.parent.full_name + ':' + this.name) : this.name;
        this.draw = draw;
        this.filter = filter;
        this.styles = styles;
        this.is_built = false;

        enabled = (enabled === undefined) ? visible : enabled; // `visible` property is backwards compatible for `enabled`
        if (this.parent && this.parent.visible === false) {
            this.enabled = false; // all descendants of disabled layer are also disabled
        }
        else {
            this.enabled = (enabled !== false); // layer is enabled unless explicitly set to disabled
        }

        // Denormalize layer name to draw groups
        if (this.draw) {
            for (let group in this.draw) {
                this.draw[group] = (this.draw[group] == null) ? {} : this.draw[group];
                if (typeof this.draw[group] !== 'object') {
                    // Invalid draw group
                    let msg = `Draw group '${group}' for layer ${this.full_name} is invalid, must be an object, `;
                    msg += `but was set to \`${group}: ${this.draw[group]}\` instead`;
                    log('warn', msg); // TODO: fire external event that clients to subscribe to

                    delete this.draw[group];
                }
                else {
                    this.draw[group].layer_name = this.full_name;
                }
            }
        }
    }

    build () {
        log('trace', `Building layer '${this.full_name}'`);
        this.buildFilter();
        this.buildDraw();
        this.is_built = true;
    }

    buildDraw() {
        this.draw = Utils.stringsToFunctions(this.draw, StyleParser.wrapFunction);
        this.calculatedDraw = calculateDraw(this);
    }

    buildFilter() {
        this.filter_original = this.filter;
        this.filter = Utils.stringsToFunctions(this.filter, StyleParser.wrapFunction);

        let type = typeof this.filter;
        if (this.filter != null && type !== 'object' && type !== 'function') {
            // Invalid filter
            let msg = `Filter for layer ${this.full_name} is invalid, filter value must be an object or function, `;
            msg += `but was set to \`filter: ${this.filter}\` instead`;
            log('warn', msg); // TODO: fire external event that clients to subscribe to
            return;
        }

        try {
            this.buildZooms();
            this.buildPropMatches();
            if (this.filter != null && (typeof this.filter === 'function' || Object.keys(this.filter).length > 0)) {
                this.filter = buildFilter(this.filter, FilterOptions);
            }
            else {
                this.filter = null;
            }
        }
        catch(e) {
            // Invalid filter
            let msg = `Filter for layer ${this.full_name} is invalid, \`filter: ${JSON.stringify(this.filter)}\` `;
            msg += `failed with error '${e.message}', stack trace: ${e.stack}`;
            log('warn', msg); // TODO: fire external event that clients to subscribe to
        }
    }

    // Zooms often cull large swaths of the layer tree, so they get special treatment and are checked first
    buildZooms() {
        let zoom = this.filter && this.filter.$zoom;
        let ztype = typeof zoom;
        if (zoom != null && ztype !== 'function') { // don't accelerate function-based filters
            this.zooms = {};

            if (ztype === 'number') {
                this.zooms[zoom] = true;
            }
            else if (Array.isArray(zoom)) {
                for (let z=0; z < zoom.length; z++) {
                    this.zooms[zoom[z]] = true;
                }
            }
            else if (ztype === 'object' && (zoom.min != null || zoom.max != null)) {
                let zmin = zoom.min || 0;
                let zmax = zoom.max || 25; // TODO: replace constant for max possible zoom
                for (let z=zmin; z < zmax; z++) {
                    this.zooms[z] = true;
                }
            }

            delete this.filter.$zoom; // don't process zoom through usual generic filter logic
        }
    }

    buildPropMatches() {
        if (!this.filter || Array.isArray(this.filter) || typeof this.filter === 'function') {
            return;
        }

        Object.keys(this.filter).forEach(key => {
            if (blacklist.indexOf(key) === -1) {
                let val = this.filter[key];
                let type = typeof val;
                let array = Array.isArray(val);

                if (!(array || type === 'string' || type === 'number')) {
                    return;
                }

                if (key[0] === '$') {
                    // Context property
                    this.context_prop_matches = this.context_prop_matches || [];
                    this.context_prop_matches.push([key.substring(1), array ? val : [val]]);
                }
                else {
                    // Feature property
                    this.feature_prop_matches = this.feature_prop_matches || [];
                    this.feature_prop_matches.push([key, array ? val : [val]]);
                }

                delete this.filter[key];
            }
        });
    }

    doPropMatches (context) {
        if (this.feature_prop_matches) {
            for (let r=0; r < this.feature_prop_matches.length; r++) {
                let match = this.feature_prop_matches[r];
                let val = context.feature.properties[match[0]];
                if (val == null || match[1].indexOf(val) === -1) {
                    return false;
                }
            }
        }

        if (this.context_prop_matches) {
            for (let r=0; r < this.context_prop_matches.length; r++) {
                let match = this.context_prop_matches[r];
                let val = context[match[0]];
                if (val == null || match[1].indexOf(val) === -1) {
                    return false;
                }
            }
        }

        return true;
    }

    doesMatch (context) {
        if (!this.enabled) {
            return false;
        }

        if (!this.is_built) {
            this.build();
        }

        // zoom pre-filter: skip rest of filter if out of layer zoom range
        if (this.zooms != null && !this.zooms[context.zoom]) {
            return false;
        }

        // direct feature property matches
        if (!this.doPropMatches(context)) {
            return false;
        }

        // any remaining filter (more complex matches or dynamic function)
        let match;
        if (this.filter instanceof Function){
            try {
                match = this.filter(context);
            }
            catch (error) {
                // Filter function error
                let msg = `Filter for this ${this.full_name}: \`filter: ${this.filter_original}\` `;
                msg += `failed with error '${error.message}', stack trace: ${error.stack}`;
                log('error', msg, context.feature);
            }
        }
        else {
            match = this.filter == null;
        }

        if (match) {
            if (this.children_to_parse) {
                parseLayerChildren(this, this.children_to_parse, this.styles);
                delete this.children_to_parse;
            }

            return true;
        }
        return false;
    }

}

Layer.id = 0;


export class LayerLeaf extends Layer {
    constructor (config) {
        super(config);
        this.is_leaf = true;
    }

}

export class LayerTree extends Layer {
    constructor (config) {
        super(config);
        this.is_tree = true;
        this.layers = config.layers || [];
    }

    addLayer (layer) {
        this.layers.push(layer);
    }

    buildDrawGroups (context) {
        let layers = [], layer_ids = [];
        matchFeature(context, [this], layers, layer_ids);

        if (layers.length > 0) {
            let cache_key = cacheKey(layer_ids);

            // Only evaluate each layer combination once (undefined means not yet evaluated,
            // null means evaluated with no draw object)
            if (layer_cache[cache_key] === undefined) {
                // Find all the unique visible draw blocks for this layer tree
                let draw_groups = layers.map(x => x && x.visible !== false && x.calculatedDraw);
                let draw_keys = {};

                for (let r=0; r < draw_groups.length; r++) {
                    let stack = draw_groups[r];
                    if (!stack) {
                        continue;
                    }
                    for (let g=0; g < stack.length; g++) {
                        let group = stack[g];
                        for (let key in group) {
                            draw_keys[key] = true;
                        }
                    }
                }

                // Calculate each draw group
                for (let draw_key in draw_keys) {
                    layer_cache[cache_key] = layer_cache[cache_key] || {};
                    layer_cache[cache_key][draw_key] = mergeTrees(draw_groups, draw_key);

                    // Only save the ones that weren't null
                    if (!layer_cache[cache_key][draw_key]) {
                        delete layer_cache[cache_key][draw_key];
                    }
                    else {
                        layer_cache[cache_key][draw_key].key = cache_key + '/' + draw_key;
                        layer_cache[cache_key][draw_key].layers = layers.map(x => x && x.full_name);
                        layer_cache[cache_key][draw_key].group = draw_key;
                    }
                }

                // No layers evaluated
                if (layer_cache[cache_key] && Object.keys(layer_cache[cache_key]).length === 0) {
                    layer_cache[cache_key] = null;
                }
            }
            return layer_cache[cache_key];
        }
    }

}

export const FilterOptions = {
    // Handle unit conversions on filter ranges
    rangeTransform(val) {
        if (typeof val === 'string' && val.trim().slice(-3) === 'px2') {
            return `${parseFloat(val)} * context.meters_per_pixel_sq`;
        }
        return val;
    }
};

export function isReserved(key) {
    return reserved.indexOf(key) > -1;
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

export function groupProps(obj) {
    let reserved = {}, children = {};

    for (let key in obj) {
        if (isReserved(key)) {
            reserved[key] = obj[key];
        } else {
            children[key] = obj[key];
        }
    }
    return [reserved, children];
}

export function calculateDraw(layer) {

    let draw  = [];

    if (layer.parent) {
        let cs = layer.parent.calculatedDraw || [];
        draw.push(...cs);
    }

    draw.push(layer.draw);
    return draw;
}

export function parseLayerNode(name, layer, parent, styles) {

    layer = (layer == null) ? {} : layer;

    let properties = { name, layer, parent, styles };
    let [reserved, children] = groupProps(layer);
    let empty = isEmpty(children);
    let Create;

    if (empty && parent != null) {
        Create = LayerLeaf;
    } else {
        Create = LayerTree;
    }

    let r = new Create(Object.assign(properties, reserved));

    // only process child layers if this layer is enabled
    if (r.enabled) {
        if (parent) {
            parent.addLayer(r);
        }
        r.children_to_parse = empty ? null : children;
    }

    return r;
}

function parseLayerChildren (parent, children, styles) {
    for (let key in children) {
        let child = children[key];
        if (typeof child === 'object' && !Array.isArray(child)) {
            parseLayerNode(key, child, parent, styles);
        } else {
            // Invalid layer
            let msg = `Layer value must be an object: cannot create layer '${key}: ${JSON.stringify(child)}'`;
            msg += `, under parent layer '${parent.full_name}'.`;

            // If the parent is a style name, this may be an incorrectly nested layer
            if (styles[parent.name]) {
                msg += ` The parent name '${parent.name}' is also the name of a style, did you mean to create a 'draw' group`;
                if (parent.parent) {
                    msg += ` under '${parent.parent.name}'`;
                }
                msg += ` instead?`;
            }
            log('warn', msg); // TODO: fire external event that clients to subscribe to
        }
    }
}


export function parseLayers (layers, styles) {
    layer_cache = {}; // clear layer cache
    let layer_trees = {};

    for (let key in layers) {
        let layer = layers[key];
        if (layer) {
            layer_trees[key] = parseLayerNode(key, layer, null, styles);
        }
    }

    return layer_trees;
}

export function matchFeature(context, layers, collected_layers, collected_layers_ids) {
    let matched = false;
    let childMatched = false;

    if (layers.length === 0) { return; }

    for (let r=0; r < layers.length; r++) {
        let current = layers[r];

        if (current.is_leaf) {
            if (current.doesMatch(context)) {
                matched = true;
                collected_layers.push(current);
                collected_layers_ids.push(current.id);
            }

        } else if (current.is_tree) {
            if (current.doesMatch(context)) {
                matched = true;

                childMatched = matchFeature(
                    context,
                    current.layers,
                    collected_layers,
                    collected_layers_ids
                );

                if (!childMatched) {
                    collected_layers.push(current);
                    collected_layers_ids.push(current.id);
                }
            }
        }
    }

    return matched;
}
