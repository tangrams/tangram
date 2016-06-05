import {Styles} from './style_manager';
import {StyleParser} from './style_parser';
import Utils from '../utils/utils';
import log from '../utils/log';
import mergeObjects from '../utils/merge';
import {match} from 'match-feature';

export const whiteList = ['filter', 'draw', 'visible', 'data'];

export const layer_cache = {};

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

    let draw = {
        visible: true // visible by default
    };

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

    constructor({ layer, name, parent, draw, visible, filter }) {
        this.id = Layer.id++;
        this.config = layer;
        this.parent = parent;
        this.name = name;
        this.full_name = this.parent ? (this.parent.full_name + ':' + this.name) : this.name;
        this.draw = draw;
        this.filter = filter;
        this.is_built = false;
        this.visible = visible !== undefined ? visible : (this.parent && this.parent.visible);

        // Denormalize layer name to draw groups
        if (this.draw) {
            for (let group in this.draw) {
                this.draw[group] = this.draw[group] || {};
                this.draw[group].layer_name = this.full_name;
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
        this.filter = Utils.stringsToFunctions(this.filter, StyleParser.wrapFunction);

        let type = typeof this.filter;
        if (this.filter != null && type !== 'object' && type !== 'function') {
            // Invalid filter
            let msg = `Filter for layer ${this.full_name} is invalid, filter value must be an object or function, `;
            msg += `but was set to \`filter: ${this.filter}\` instead`;
            log('warn', msg);
            return;
        }

        try {
            this.buildZooms();
            this.buildPropMatches();
            if (this.filter != null && (typeof this.filter === 'function' || Object.keys(this.filter).length > 0)) {
                this.filter = match(this.filter);
            }
            else {
                this.filter = null;
            }
        }
        catch(e) {
            // Invalid filter
            let msg = `Filter for layer ${this.full_name} is invalid, \`filter: ${JSON.stringify(this.filter)}\` `;
            msg += `failed with error ${e.message}, ${e.stack}`;
            log('warn', msg);
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
                if (!val || match[1].indexOf(val) === -1) {
                    return false;
                }
            }
        }

        if (this.context_prop_matches) {
            for (let r=0; r < this.context_prop_matches.length; r++) {
                let match = this.context_prop_matches[r];
                let val = context[match[0]];
                if (!val || match[1].indexOf(val) === -1) {
                    return false;
                }
            }
        }

        return true;
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
                    let layer = draw_groups[r];
                    if (!layer) {
                        continue;
                    }
                    for (let g=0; g < layer.length; g++) {
                        let group = layer[g];
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

function isWhiteListed(key) {
    return whiteList.indexOf(key) > -1;
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

export function groupProps(obj) {
    let whiteListed = {}, nonWhiteListed = {};

    for (let key in obj) {
        if (isWhiteListed(key)) {
            whiteListed[key] = obj[key];
        } else {
            nonWhiteListed[key] = obj[key];
        }
    }
    return [whiteListed, nonWhiteListed];
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

export function parseLayerTree(name, layer, parent) {

    let properties = { name, layer, parent };
    let [whiteListed, nonWhiteListed] = groupProps(layer);
    let empty = isEmpty(nonWhiteListed);
    let Create;

    if (empty && parent != null) {
        Create = LayerLeaf;
    } else {
        Create = LayerTree;
    }

    let r = new Create(Object.assign(properties, whiteListed));

    if (parent) {
        parent.addLayer(r);
    }

    if (!empty) {
        for (let key in nonWhiteListed) {
            let property = nonWhiteListed[key];
            if (typeof property === 'object' && !Array.isArray(property)) {
                parseLayerTree(key, property, r);
            } else {
                // Invalid layer
                let msg = `Layer value must be an object: cannot create layer '${key}: ${JSON.stringify(property)}'`;
                msg += `, under parent layer '${r.full_name}'.`;

                // If the parent is a style name, this may be an incorrectly nested layer
                if (Styles[r.name]) {
                    msg += ` The parent '${r.name}' is also the name of a style, did you mean to create a 'draw' group`;
                    if (parent) {
                        msg += ` under '${parent.name}'`;
                    }
                    msg += ` instead?`;
                }
                log('warn', msg);
            }
        }

    }

    return r;
}


export function parseLayers (layers) {
    let layer_trees = {};

    for (let key in layers) {
        let layer = layers[key];
        if (layer) {
            layer_trees[key] = parseLayerTree(key, layer);
        }
    }

    return layer_trees;
}


function doesMatch(layer, context) {
    if (!layer.is_built) {
        layer.build();
    }

    // zoom pre-filter: skip rest of filter if out of layer zoom range
    if (layer.zooms != null && !layer.zooms[context.zoom]) {
        return false;
    }

    // direct feature property matches
    if (!layer.doPropMatches(context)) {
        return false;
    }

    // any remaining filter (more complex matches or dynamic function)
    return layer.filter == null || layer.filter(context);
}

export function matchFeature(context, layers, collected_layers, collected_layers_ids) {
    let matched = false;
    let childMatched = false;

    if (layers.length === 0) { return; }

    for (let r=0; r < layers.length; r++) {
        let current = layers[r];

        if (current.is_leaf) {
            if (doesMatch(current, context)) {
                matched = true;
                collected_layers.push(current);
                collected_layers_ids.push(current.id);
            }

        } else if (current.is_tree) {
            if (doesMatch(current, context)) {
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
