import Utils from './utils';

export var whiteList = ['filter', 'order', 'style', 'color', 'width', 'visible', 'mode'];

function isWhiteListed(key) {
    return whiteList.indexOf(key) > -1;
}

export function wrapMacro(fn, context) {
    return function(...args) {
        return eval(fn).apply(context, args); // jshint ignore:line
    }.bind(context);
}

export var Macros = {
    is: function (property, value) {
        return function (obj) {
            return Object.is(Utils.getIn(obj, property.split('.')), value);
        };
    },
    returns: function (value) {
        return function () { return value; };
    }
};

export function findMacro(value) {
    for (var key in Macros) {
        if (value.match(key)) {
            return true;
        }
    }
    return false;
}


export function walkAllRules(rules, cb) {
    if (rules.length === 0) {
        return;
    }
    var first = rules[0];

    cb(first);

    if (first.rules && first.rules.length !== 0) {
        walkAllRules(first.rules, cb);
    }

    walkAllRules(rules.slice(1), cb);

}


export function matchFeature(feature, rules, collectedRules, stack = []) {
    var current, matched = false, childMatched;

    function mergeStyles(styles) {
        styles = styles.filter(x => { return x != null; });
        return Object.assign({}, ...styles);
    }

    if (rules.length === 0) {
        return;
    }

    for (var i = 0; i < rules.length; i += 1) {
        current = rules[i];

        if (current instanceof Rule) {

            if (current.style) {

                if ((typeof current.filter === 'function' && current.filter(feature)) || (current.filter === undefined)) {
                    matched = true;
                    stack.push(current.style);
                    collectedRules.push(mergeStyles(stack));
                    stack.pop();
                }

            } else {
                throw new Error('A rule must have a style object.');
            }
        }
        else if (current instanceof RuleGroup) {

            if ((typeof current.filter === 'function' && current.filter(feature)) || current.filter === undefined) {
                matched = true;
                stack.push(current.style);
                childMatched = matchFeature(feature, current.rules, collectedRules, stack);
                if (!childMatched && current.style) {
                    collectedRules.push(mergeStyles(stack));
                }
                stack.pop();
            }
        }
    }
    return matched;
}

export function buildFilterFunction(filter) {

    // allow users to not have to use `this` in their filters
    if (!filter.startsWith('this.')) {
        filter = 'this.' + filter;
    }

    var macroContext = findMacro(filter);
    if (macroContext) {
        return wrapMacro(filter, Macros);
    }
}

export function buildFilterObject(filter) {
    return false;
}

export function buildFilter(rule) {
    if (rule.filter) {
        if (typeof rule.filter === 'string') {
            return buildFilterFunction(rule.filter);
        }
        if (typeof rule.filter === 'object') {
            return buildFilterObject(rule.filter);
        }
    }
}

class RuleGroup {

    constructor(options) {
        Object.assign(this, options);
        this.rules = options.rules || [];
    }

    // TODO, fix me
    matchFeature(feature) {
        var rules = [];
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
            order:  this.order,
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

export function parseStyle(name, style, parent) {
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
    }
    else {
        filter = buildFilter(properties);
        group = new RuleGroup({name, filter});
        group.style = properties.style;
        parent.rules.push(group);
    }

    leftOvers.forEach((name) => {
        var property = style[name];
        if (typeof property === 'object') {
            parseStyle(name, property, group);
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
        c[name] = parseStyle(name, layer, parent);
        return c;
    }, {});
}
