export var whiteList = ['filter', 'style', 'geometry'];

function isWhiteListed(key) {
    return whiteList.indexOf(key) > -1;
}

// Merges a chain of parent-to-child styles into a single style object
function mergeStyles(styles) {
    // Merge styles, properties in children override the same property in parents
    // Remove rules without styles
    var style = Object.assign({}, ...styles.filter(style => style));

    // Children of invisible parents are also invisible
    style.visible = !styles.some(style => !style.visible);

    // The full original order chain is preserved, final order is computed when styles are evaluated
    style.order = styles.map(style => style.order);

    return style;
}

export function matchFeature(feature, rules, collectedRules) {
    var current, matched = false, childMatched;

    if (rules.length === 0) {
        return;
    }

    for (var i = 0; i < rules.length; i += 1) {
        current = rules[i];

        if (current instanceof Rule) {

            if (current.calculatedStyle) {

                if ((typeof current.filter === 'function' && current.filter({feature})) || (current.filter === undefined)) {
                    matched = true;
                    collectedRules.push(current.calculatedStyle);
                }

            } else {
                throw new Error('A rule must have a style object');
            }
        }
        else if (current instanceof RuleGroup) {

            if ((typeof current.filter === 'function' && current.filter({feature})) || current.filter === undefined) {
                matched = true;
                childMatched = matchFeature(feature, current.rules, collectedRules);
                if (!childMatched && current.calculatedStyle) {
                    collectedRules.push(current.calculatedStyle);
                }
            }
        }
    }
    return matched;
}

export function matchAllObjectProperties(filter, {feature}) {
    for (var key in filter) {
        // If filter key is a boolean, feature property must match the truthiness of the filter
        if (typeof filter[key] === 'boolean') {
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
        // If the filter key has a single value, the feature property must match that value
        else {
            if (feature.properties[key] !== filter[key]) {
                return false;
            }
        }
        return true;
    }
    
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

    matchFeature(feature, rules = []) {
        matchFeature(feature, this.rules, rules);
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
    if (rule.style) { styles.push(rule.style); }

    if (rule.parent) {
        return calculateStyle(rule.parent, styles);
    }

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
        rule.calculatedStyle = mergeStyles(calculateStyle(rule).reverse());
    }
    else {
        filter = buildFilter(properties);
        group = new RuleGroup({name, filter});
        group.style = properties.style;
        parent.rules.push(group);
        group.calculatedStyle = mergeStyles(calculateStyle(group).reverse());
    }

    leftOvers.forEach((name) => {
        var property = style[name];
        if (typeof property === 'object') {
            parseRule(name, property, group);
        }
        else {
            throw new Error(`You provided an property that was not a object and was not expect; ${property}`);
        }
    });

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
