import {StyleParser} from './style_parser';

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
    style.visible = !styles.some(style => !style.visible);

    // The full original order chain is preserved, final order is computed when styles are evaluated
    style.order = styles.filter(style => style.order).map(style => style.order);

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

export function matchAllObjectProperties(filter, {feature, zoom}) {
    for (var key in filter) {
        var type = typeof filter[key];

        // Zoom-specific handling
        // The following syntax forms are accepted:
        //    filter: { scene.zoom: 14 }                  # zoom >= 14
        //    filter: { scene.zoom: { max: 18 }           # zoom <= 18
        //    filter: { scene.zoom: { min: 14, max: 18 }  # 14 <= zoom <= 18
        //    filter: { scene.zoom: [14, 18] }            # 14 <= zoom <= 18
        //
        if (key === 'scene.zoom') {
            // If a single value is provided, treat it as a zoom minimum
            if (type === 'number') {
                if (zoom < filter[key]) {
                    return false;
                }
            }
            // If an array is provided, treat it as a zoom min and max pair
            else if (Array.isArray(filter[key])) {
                if (zoom < filter[key][0]) {
                    return false;
                }
                if (zoom > filter[key][1]) {
                    return false;
                }
            }
            // If an object is specified, look for min and max properties
            else if (type === 'object') {
                if (filter[key].min && zoom < filter[key].min) {
                    return false;
                }
                if (filter[key].max && zoom > filter[key].max) {
                    return false;
                }
            }
            continue;
        }

        // Assume filter keys refer to feature properties by default

        // If the filter key has a single value, the feature property must match that value
        if (type === 'string' || type === 'number') {
            if (feature.properties[key] !== filter[key]) {
                return false;
            }
        }
        // If filter key is a boolean, feature property must match the truthiness of the filter
        else if (type === 'boolean') {
            if ((filter[key] && !feature.properties[key]) || (!filter[key] && feature.properties[key])) {
                return false;
            }
        }
        // If filter key has multiple values, this is an OR: the feature property must match one of the values
        else if (Array.isArray(filter[key])) {
            if (filter[key].indexOf(feature.properties[key]) === -1) {
                return false;
            }
        }
        // Unrecognized filter type
        else {
            return false;
        }
    }
    return true;
}

export function buildFilterObject(filter) {
    // Match on one or more object properties
    return matchAllObjectProperties.bind(null, filter);
}

export function buildFilter(rule) {
    if (rule.filter) {
        if (typeof rule.filter === 'object') {
            return buildFilterObject(rule.filter);
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
