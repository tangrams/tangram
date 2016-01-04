import {Styles} from './style_manager';
import mergeObjects from '../utils/merge';
import {match} from 'match-feature';
import log from 'loglevel';

export const whiteList = ['filter', 'draw', 'visible', 'data', 'properties'];

export let ruleCache = {};

function cacheKey (rules) {
    if (rules.length > 1) {
        var k = rules[0];
        for (var i=1; i < rules.length; i++) {
            k += '/' + rules[i];
        }

        return k;
    }
    return rules[0];
}

// Merge matching layer rule trees into a final draw group
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

    // No rules to parse
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

        // Sort by layer name before merging, so rules are applied deterministically
        // when multiple rules modify the same properties
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


class Rule {

    constructor({name, parent, draw, visible, filter, properties}) {
        this.id = Rule.id++;
        this.parent = parent;
        this.name = name;
        this.full_name = this.parent ? (this.parent.full_name + ':' + this.name) : this.name;
        this.draw = draw;
        this.filter = filter;
        this.visible = visible !== undefined ? visible : (this.parent && this.parent.visible);
        this.properties = properties !== undefined ? properties : (this.parent && this.parent.properties);

        // Denormalize layer name & properties to draw groups
        if (this.draw) {
            for (let group in this.draw) {
                this.draw[group].layer_name = this.full_name;

                if (this.properties !== undefined) {
                    this.draw[group].properties = this.properties;
                }
            }
        }

        this.buildFilter();
        this.buildDraw();
    }

    buildDraw() {
        this.calculatedDraw = calculateDraw(this);
    }

    buildFilter() {
        let type = typeof this.filter;
        if (this.filter != null && type !== 'object' && type !== 'function') {
            // Invalid filter
            let msg = `Filter for layer ${this.full_name} is invalid, filter value must be an object or function, `;
            msg += `but was set to \`filter: ${this.filter}\` instead`;
            log.warn(msg);
            return;
        }

        try {
            this.buildZooms();
            this.filter = match(this.filter);
        }
        catch(e) {
            // Invalid filter
            let msg = `Filter for layer ${this.full_name} is invalid, \`filter: ${JSON.stringify(this.filter)}\` `;
            msg += `failed with error ${e.message}, ${e.stack}`;
            log.warn(msg);
        }
    }

    // Zooms often cull large swaths of the layer rule tree, so they get special treatment and are checked first
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

    toJSON() {
        return {
            name: this.name,
            draw: this.draw
        };
    }

}

Rule.id = 0;


export class RuleLeaf extends Rule {
    constructor({name, parent, draw, visible, filter, properties}) {
        super({name, parent, draw, visible, filter, properties});
    }

}

export class RuleTree extends Rule {
    constructor({name, parent, draw, visible, rules, filter, properties}) {
        super({name, parent, draw, visible, filter, properties});
        this.rules = rules || [];
    }

    addRule(rule) {
        this.rules.push(rule);
    }

    buildDrawGroups(context) {
        let rules = [], rule_ids = [];
        //TODO, should this function take a RuleTree
        matchFeature(context, [this], rules, rule_ids);

        if (rules.length > 0) {
            let cache_key = cacheKey(rule_ids);

            // Only evaluate each rule combination once (undefined means not yet evaluated,
            // null means evaluated with no draw object)
            if (ruleCache[cache_key] === undefined) {
                // Visible?
                if (rules.some(x => x.visible === false)) {
                    ruleCache[cache_key] = null;
                }
                else {
                    // Find all the unique draw blocks for this rule tree
                    let draw_rules = rules.map(x => x && x.calculatedDraw);
                    let draw_keys = {};

                    for (let r=0; r < draw_rules.length; r++) {
                        let rule = draw_rules[r];
                        if (!rule) {
                            continue;
                        }
                        for (let g=0; g < rule.length; g++) {
                            let group = rule[g];
                            for (let key in group) {
                                draw_keys[key] = true;
                            }
                        }
                    }

                    // Calculate each draw group
                    for (let draw_key in draw_keys) {
                        ruleCache[cache_key] = ruleCache[cache_key] || {};
                        ruleCache[cache_key][draw_key] = mergeTrees(draw_rules, draw_key);

                        // Only save the ones that weren't null
                        if (!ruleCache[cache_key][draw_key]) {
                            delete ruleCache[cache_key][draw_key];
                        }
                        else {
                            ruleCache[cache_key][draw_key].key = cache_key + '/' + draw_key;
                            ruleCache[cache_key][draw_key].layers = rules.map(x => x && x.full_name);
                        }
                    }

                    // No rules evaluated
                    if (ruleCache[cache_key] && Object.keys(ruleCache[cache_key]).length === 0) {
                        ruleCache[cache_key] = null;
                    }
                }
            }
            return ruleCache[cache_key];
        }
    }

}

function isWhiteListed(key) {
    return whiteList.indexOf(key) > -1;
}

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

export function walkUp(rule, cb) {

    if (rule.parent) {
        walkUp(rule.parent, cb);
    }

    cb(rule);
}

export function walkDown(rule, cb) {

    if (rule.rules) {
        rule.rules.forEach((r) => {
            walkDown(r, cb);
        });
    }

    cb(rule);
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

export function calculateDraw(rule) {

    let draw  = [];

    if (rule.parent) {
        let cs = rule.parent.calculatedDraw || [];
        draw.push(...cs);
    }

    draw.push(rule.draw);
    return draw;
}

export function parseRuleTree(name, rule, parent) {

    let properties = {name, parent};
    let [whiteListed, nonWhiteListed] = groupProps(rule);
    let empty = isEmpty(nonWhiteListed);
    let Create;

    if (empty && parent != null) {
        Create = RuleLeaf;
    } else {
        Create = RuleTree;
    }

    let r = new Create(Object.assign(properties, whiteListed));

    if (parent) {
        parent.addRule(r);
    }

    if (!empty) {
        for (let key in nonWhiteListed) {
            let property = nonWhiteListed[key];
            if (typeof property === 'object' && !Array.isArray(property)) {
                parseRuleTree(key, property, r);
            } else {
                // Invalid layer
                let msg = `Layer value must be an object: can't create layer '${key}: ${JSON.stringify(property)}'`;
                msg += `, under parent layer '${r.full_name}'.`;

                // If the parent is a style name, this may be an incorrectly nested layer
                if (Styles[r.name]) {
                    msg += ` The parent '${r.name}' is also the name of a style, did you mean to create a 'draw' group`;
                    if (parent) {
                        msg += ` under '${parent.name}'`;
                    }
                    msg += ` instead?`;
                }
                log.warn(msg);
            }
        }

    }

    return r;
}


export function parseRules(rules) {
    let ruleTrees = {};

    for (let key in rules) {
        let rule = rules[key];
        if (rule) {
            ruleTrees[key] = parseRuleTree(key, rule);
        }
    }

    return ruleTrees;
}


function doesMatch(rule, context) {
    // zoom pre-filter: skip rest of filter if out of rule zoom range
    if (rule.zooms != null && !rule.zooms[context.zoom]) {
        return false;
    }

    return ((typeof rule.filter === 'function' && rule.filter(context)) || (rule.filter == null));
}

export function matchFeature(context, rules, collectedRules, collectedRulesIds) {
    let matched = false;
    let childMatched = false;

    if (rules.length === 0) { return; }

    for (let r=0; r < rules.length; r++) {
        let current = rules[r];
        context.properties = current.properties;

        if (current instanceof RuleLeaf) {

            if (doesMatch(current, context)) {
                matched = true;
                collectedRules.push(current);
                collectedRulesIds.push(current.id);
            }

        } else if (current instanceof RuleTree) {
            if (doesMatch(current, context)) {
                matched = true;

                childMatched = matchFeature(
                    context,
                    current.rules,
                    collectedRules,
                    collectedRulesIds
                );

                if (!childMatched) {
                    collectedRules.push(current);
                    collectedRulesIds.push(current.id);
                }
            }
        }

        context.properties = null;
    }

    return matched;
}
