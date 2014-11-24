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

export function matchFeature(feature, rules, depth = 0, collectedStyles = []) {

    if (rules.length === 0) {
        return;
    }
    var first = rules[0];

    if ((typeof first.filter === 'function') && (first.filter(feature))) {

        if (first instanceof Rule) {
            collectedStyles.push(first);
        } else if (first.rules.length !== 0) {
            matchFeature(feature, first.rules, depth += 1, collectedStyles);
        }
    }

    matchFeature(feature, rules.slice(1), depth, collectedStyles);
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

    matchFeature(feature) {
        return {};
    }
}

class Rule {

    constructor(options) {
        Object.assign(this, options);
    }

    calculateFullFilter() {
        var parentFilters = (root, filters) => {
            if (root.filter != null) {
                if (root.filter.size) {
                    root.filter.forEach((x) => {
                        filters.add(x);
                    });
                } else {
                    filters.add(root.filter);
                }
            }
            if (root.root != null) {
                return parentFilters(root.root, filters);
            }
            return filters;
        };
        return parentFilters(this.root, new Set()).add(this.filter);
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

export function parseStyle(name, style, root) {
    var properties = {name, root}, rule, leftOvers, group;

    Object.keys(style).filter(isWhiteListed).forEach((key) => {
        properties[key] = style[key];
    });

    leftOvers = Object.keys(style).filter((key) => {return !isWhiteListed(key);});

    // if we are a leaf
    if (leftOvers.length === 0) {
        rule = new Rule(properties);
    } else {
        group = new RuleGroup({name});
        rule = new Rule(properties);
        group.rules.push(rule);
    }

    // TODO, FIXME
    var originalFilter = rule.filter;
    rule.filter = buildFilter(rule);
    rule.originalFilter = originalFilter;


    root.rules.push(rule);

    leftOvers.forEach((name) => {
        var property = style[name];
        if (typeof property === 'object') {
            parseStyle(name, property, group);
        } else {
            throw new Error(`You provided an property that was not a object and was not expect; ${property}`);
        }
    });

    return root;
}


export function parseLayers(layers) {
    return Object.keys(layers).reduce((c, name) => {
        var layer = layers[name],
            root  = new RuleGroup({name});
        c[name] = parseStyle(name, layer, root);
        return c;
    }, {});

}
