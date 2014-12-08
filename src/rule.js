import Utils from './utils';

export var whiteList = ['filter', 'order', 'style', 'visible', 'geometry'];

function isWhiteListed(key) {
    return whiteList.indexOf(key) > -1;
}

export function wrapMacro(fn, context) {
    return function(...args) {
        return eval(fn).apply(context, args); // jshint ignore:line
    }.bind(context);
}

export var Macros = {
    property: function (property, value) {
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

export function matchFeature(feature, rules, collectedStyles = []) {
    for (var r=0; r < rules.length; r++) {
        var first = rules[r];

        if (first instanceof Rule) {
            if (typeof first.filter === 'function') {
                if (first.filter(feature)) {
                    collectedStyles.push(first);
                }
            }
            else if (first.filter === undefined) {
                collectedStyles.push(first);
            }
        }
        else if (first instanceof RuleGroup) {
            if (typeof first.filter === 'function') {
                if (first.filter(feature)) {
                    matchFeature(feature, first.rules, collectedStyles);
                }
            }
            else if (first.filter === undefined) {
                matchFeature(feature, first.rules, collectedStyles);
            }
        }
    }
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
            order:  this.order,
            style:  this.style,
            rules:  this.rules
        };
    }
}

export function parseStyle(name, style, parent) {
    var properties = {name, parent}, rule, leftOvers, group, filter;

    Object.keys(style).filter(isWhiteListed).forEach((key) => {
        properties[key] = style[key];
    });

    leftOvers = Object.keys(style).filter(key => !isWhiteListed(key));

    // if we are a leaf
    if (leftOvers.length === 0) {
        rule = new Rule(properties);
        parent.rules.push(rule);
    }
    else {
        rule = new Rule(properties);
        filter = buildFilter(rule);
        group = new RuleGroup({name, filter});
        group.rules.push(rule);
        parent.rules.push(group);
    }

    // TODO, FIXME
    var originalFilter = rule.filter;
    rule.filter = buildFilter(rule);
    rule.originalFilter = originalFilter;

    leftOvers.forEach((name) => {
        var property = style[name];
        if (typeof property === 'object') {
            parseStyle(name, property, group);
        }
        else {
            throw new Error(`You provided a property that was not an object and was not expected: ${property}`);
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
