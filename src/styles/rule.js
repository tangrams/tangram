import {StyleParser} from './style_parser';
import mf from 'match-feature';

export var whiteList = ['filter', 'style', 'geometry'];

function isWhiteListed(key) {
    return whiteList.indexOf(key) > -1;
}


// TODO Check for circular references
export function cloneStyle(target, source) {

    for (var arg of source) {
        for (var key in arg) {
            var value = arg[key];
            // In a style object, arrays are consider a scalar value so we don't want to clone them.
            if (typeof value === 'object' && !Array.isArray(value)) {
                target[key] = cloneStyle(target[key] || {}, [value]);
            } else {
                target[key] = arg[key];
            }
        }
    }
    return target;
}


// Merges a chain of parent-to-child styles into a single style object
function mergeStyles(styles) {
    // Merge styles, properties in children override the same property in parents
    // Remove rules without styles
    var style = cloneStyle({}, styles.filter(style => style));

    // Children of invisible parents are also invisible
    style.visible = !styles.some(style => style.visible === false);

    // The full original order chain is preserved
    // But, the order inheritance can be 'reset' at any point in the chain
    var order_start = 0;
    for (var i = styles.length-1; i >= 0; i--) {
        if (styles[i].orderReset) {
            order_start = i;
            break;
        }
    }
    style.order = styles.slice(order_start).filter(style => style.order).map(style => style.order);

    // Order can be cached if it is only a single value...
    if (style.order.length === 1 && typeof style.order[0] === 'number') {
        style.order = style.order[0];
    }
    // Or if there are no function dependencies
    else if (!style.order.some(style => typeof style === 'function')) {
        style.order = StyleParser.calculateOrder(style.order);
    }

    return style;
}

export function matchFeature(context, rules, collectedRules) {
    var current, matched = false, childMatched;

    if (rules.length === 0) {
        return;
    }

    for (var i = 0; i < rules.length; i += 1) {
        current = rules[i];

        if (current instanceof Rule) {

            if (current.calculatedStyle) {

                if ((typeof current.filter === 'function' && current.filter(context)) || (current.filter === undefined)) {
                    matched = true;
                    collectedRules.push(current.calculatedStyle);
                }

            } else {
                throw new Error('A rule must have a style object');
            }
        }
        else if (current instanceof RuleGroup) {

            if ((typeof current.filter === 'function' && current.filter(context)) || current.filter === undefined) {
                matched = true;
                childMatched = matchFeature(context, current.rules, collectedRules);
                if (!childMatched && current.calculatedStyle) {
                    collectedRules.push(current.calculatedStyle);
                }
            }
        }
    }
    return matched;
}


export function buildFilter(rule) {
    if (rule.filter) {
        if (typeof rule.filter === 'object') {
            return mf.match(rule.filter);
        } else  if (typeof rule.filter === 'function'){
            return rule.filter;
        }
    }
}

class RuleGroup {

    constructor(options) {
        Object.assign(this, options);
        this.rules = options.rules || [];
    }

    matchFeature(context, rules = []) {
        matchFeature(context, this.rules, rules);
        return rules;
    }

}

class Rule {

    constructor(options) {
        Object.assign(this, options);
    }

    toJSON() {
        return {
            name:   this.name,
            filter: this.filter,
            style:  this.style,
            rules:  this.rules
        };
    }
}

export function groupProperties(style) {
    var properties = {}, leftOvers = [];

    for (var key in style) {
        if (isWhiteListed(key)) {
            properties[key] = style[key];
        }
        else {
            leftOvers.push(key);
        }
    }
    return [properties, leftOvers];

}


export function calculateStyle(rule, styles = []) {
    if (rule.parent) {
        calculateStyle(rule.parent, styles);
    }
    if (rule.style) { styles.push(rule.style); }
    return styles;
}

export function parseRule(name, style, parent) {
    var properties = {name, parent},
        rule,
        group,
        filter, originalFilter;

    var [props, leftOvers] = groupProperties(style);

    Object.assign(properties, props);

    // if we are a leaf
    if (leftOvers.length === 0) {
        rule = new Rule(properties);
        originalFilter = rule.filter;
        rule.filter = buildFilter(rule);
        rule.originalFilter = originalFilter;
        parent.rules.push(rule);
        rule.calculatedStyle = mergeStyles(calculateStyle(rule));
    }
    else {
        filter = buildFilter(properties);
        group = new RuleGroup({name, filter, parent});
        group.style = properties.style;
        parent.rules.push(group);
        group.calculatedStyle = mergeStyles(calculateStyle(group));
    }

    for (var _name of leftOvers) {
        var property = style[_name];
        if (typeof property === 'object') {
            parseRule(_name, property, group);
        }
        else {
            throw new Error(
                `In rule ${name}, property is not a object and it not whitelisted: ${_name} => ${property}`
            );
        }
    }

    return parent;
}

export function parseRules(layers) {
    return Object.keys(layers).reduce((c, name) => {
        var layer = layers[name],
            parent  = new RuleGroup({name});
        c[name] = parseRule(name, layer, parent);
        return c;
    }, {});
}
