import {match} from 'match-feature';
import log from 'loglevel';

export const whiteList = ['filter', 'draw', 'visible', 'data', 'properties'];

export let ruleCache = {};

function cacheKey (rules) {
    var k = rules[0].id;
    for (var i=1; i < rules.length; i++) {
        k += '/' + rules[i].id;
    }
    return k;
}

export function mergeTrees(matchingTrees, key, context) {
    var draw = {},
        draws,
        // order = [],
        // order_draws = [],
        treeDepth = 0,
        x, t;

    // Visible by default
    draw.visible = true;

    // Find deepest tree
    for (t = 0; t < matchingTrees.length; t++) {
        if (matchingTrees[t].length > treeDepth) {
            treeDepth = matchingTrees[t].length;
        }
    }

    // No rules to parse
    if (treeDepth === 0) {
        return null;
    }

    // Iterate trees in parallel
    for (x = 0; x < treeDepth; x++) {
        draws = matchingTrees.map(tree => tree[x] && tree[x][key]);
        if (draws.length === 0) {
            continue;
        }

        // Property-specific logic
        // for (i=0; i < draws.length; i++) {
        //     if (!draws[i]) {
        //         continue;
        //     }

        //     // Collect unique orders (don't add the order multiple times for the smae draw rule)
        //     if (draws[i].order !== undefined) {
        //         if (order_draws.indexOf(draws[i]) === -1) {
        //             order.push(draws[i].order);
        //             order_draws.push(draws[i]);
        //         }
        //     }
        // }

        // Merge remaining draw objects
        mergeObjects(draw, ...draws);
    }

    // Short-circuit if not visible
    if (draw.visible === false) {
        return null;
    }

    // Sum all orders
    // Note: temporarily commenting out, will revisit with new scene file syntax
    // if (order.length > 0) {
    //     // Order can be cached if it is all numeric
    //     if (order.length === 1 && typeof order[0] === 'number') {
    //         order = order[0];
    //     }
    //     else if (order.every(v => typeof v === 'number')) {
    //         order = calculateOrder(order, context); // TODO: use StyleParser.calculateOrder
    //     }
    //     draw.order = order;
    // }

    return draw;
}


class Rule {

    constructor({name, parent, draw, visible, filter, properties}) {
        this.id = Rule.id++;
        this.parent = parent;
        this.name = name;
        this.draw = draw;
        this.filter = filter;
        this.visible = visible !== undefined ? visible : (this.parent && this.parent.visible);
        this.properties = properties !== undefined ? properties : (this.parent && this.parent.properties);

        // Denormalize properties to draw groups
        if (this.draw) {
            for (let group in this.draw) {
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
        var type = typeof this.filter;
        if (type === 'object') {
            this.filter = match(this.filter);
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
        let rules  = [];
        //TODO, should this function take a RuleTree
        matchFeature(context, [this], rules);

        if (rules.length > 0) {
            let cache_key = cacheKey(rules);

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

                    for (let rule of draw_rules) {
                        if (!rule) {
                            continue;
                        }
                        for (let group of rule) {
                            for (let key in group) {
                                draw_keys[key] = true;
                            }
                        }
                    }

                    // Calculate each draw group
                    for (let draw_key in draw_keys) {
                        ruleCache[cache_key] = ruleCache[cache_key] || {};
                        ruleCache[cache_key][draw_key] = mergeTrees(draw_rules, draw_key, context);

                        // Only save the ones that weren't null
                        if (!ruleCache[cache_key][draw_key]) {
                            delete ruleCache[cache_key][draw_key];
                        }
                        else {
                            ruleCache[cache_key][draw_key].key = cache_key + '/' + draw_key;
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

export function mergeObjects(newObj, ...sources) {

    for (let source of sources) {
        if (!source) {
            continue;
        }
        for (let key in source) {
            let value = source[key];
            if (typeof value === 'object' && !Array.isArray(value)) {
                newObj[key] = mergeObjects(newObj[key] || {}, value);
            } else {
                newObj[key] = value;
            }
        }

    }
    return newObj;
}

export function calculateOrder(orders, context = null, defaultOrder = 0) {
    let sum = defaultOrder;

    for (let order of orders) {
        if (typeof order === 'function') {
            order = order(context);
        } else {
            order = parseFloat(order);
        }

        if (!order || isNaN(order)) {
            continue;
        }
        sum += order;
    }
    return sum;
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
            if (typeof property === 'object') {
                parseRuleTree(key, property, r);
            } else {
                log.warn('Rule property must be an object: ', name, rule, property);
            }
        }

    }

    return r;
}


export function parseRules(rules) {
    let ruleTrees = {};

    for (let key in rules) {
        let rule = rules[key];
        ruleTrees[key] = parseRuleTree(key, rule);
    }

    return ruleTrees;
}


function doesMatch(filter, context) {
    return ((typeof filter === 'function' && filter(context)) || (filter == null));
}

export function matchFeature(context, rules, collectedRules) {
    let matched = false;
    let childMatched = false;

    if (rules.length === 0) { return; }

    for (let r=0; r < rules.length; r++) {
        let current = rules[r];
        context.properties = current.properties;

        if (current instanceof RuleLeaf) {

            if (doesMatch(current.filter, context)) {
                matched = true;
                collectedRules.push(current);
            }

        } else if (current instanceof RuleTree) {
            if (doesMatch(current.filter, context)) {
                matched = true;

                childMatched = matchFeature(
                    context,
                    current.rules,
                    collectedRules
                );

                if (!childMatched) {
                    collectedRules.push(current);
                }
            }
        }

        context.properties = null;
    }

    return matched;
}
