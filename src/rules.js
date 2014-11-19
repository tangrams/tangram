

//var whiteList = ['filter', 'order', 'style', 'color', 'width'];

export class Style {
    constructor({color, width}) {
        this.color = color;
        this.width = width;
    }
}

export class Rule {
    constructor({filter, order, style, rules}) {
        this.filter = filter;
        this.order  = order;
        this.style  = new Style(style);
        this.rules = rules;
    }

    addRule(rule) {
        this.rules.push(rule);
    }
}

// function makeRuleTree() {
//     return new Rule({});

// }

// function createRule(stylizers) {
//     var properties = {};

//     Object.keys(stylizers).forEach((property) => {
//         if (whiteList.contains(property)) {
//             properties[property] = stylizers[property];
//             delete stylizers[property];
//         }
//     });
//     return new Rule(properties);
// }


// function isWhiteListed(key) {
//     return whiteList.indexOf(key) === 1;
// }

function parseStyle(style, rules) {
    return {};
}

export function parseStylizers(stylizers) {
    var rules = [];

    Object.keys(stylizers).forEach((_name) => {
        var style = stylizers[_name];
        return parseStyle(style, rules);
    });

    return rules;
}

