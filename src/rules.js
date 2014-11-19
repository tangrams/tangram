import Utils from './utils';

export var whiteList = ['filter', 'order', 'style', 'color', 'width'];

function isWhiteListed(key) {
    return whiteList.indexOf(key) > -1;
}

export function wrapMacro(fn) {
    return function(...args) {
        return eval(fn).apply(null, args); // jshint ignore:line
    };
}

export var Macros = {
    'property': function (property, value) {
        return function (obj) {
            return Object.is(Utils.getattr(obj, property), value);
        };
    },
    'returns': function (value) {
        return function () { return value; };
    }
};

export function walkRuleTree(rules, cb) {
    if (rules.length === 0) {
        return;
    }
    var first = rules[0];

    cb(first);

    if (first.rules && first.rules.length !== 0) {
        walkRuleTree(first.rules, cb);
    }

    walkRuleTree(rules.slice(1), cb);

}


class Style {
    constructor(name, rules = []) {
        this.name = name;
        this.rules = rules;
    }

    matchFeature(feature) {
        var matchedStyles = [];

        walkRuleTree(this.rules, (rule) => {
            if (typeof rule.filter === 'function' && rule.filter(feature) !== false) {
                matchedStyles.push(rule.style);
            }
        });

        return matchedStyles;
    }
}

class Rule {

    constructor(root, name, filter, order, style, rules = []) {
        this.root = root;
        this.name = name;
        this.filter = filter;
        this.order = order;
        this.style = style;
        this.rules = rules;
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

function parseStyle(name, style, root) {
    var rule = new Rule(root, name);

    Object.keys(style).filter(isWhiteListed).forEach((key) => {
        rule[key] = style[key];
        delete style[key];
    });

    root.rules.push(rule);

    Object.keys(style).forEach((name) => {
        var property = style[name];
        if (typeof property === 'object') {
            parseStyle(name, property, rule);
        } else {
            throw new Error(`You provided an property that was not a object and was not expect; ${property}`);
        }
    });

    return root;
}


export function parseLayers(layers) {
    var obj = {};

    Object.keys(layers).forEach((key) => {
        var layer = layers[key],
            root  = new Style(key);
        obj[key] = parseStyle(key, layer, root);
    });

    return obj;

}
