function notNull(x)  { return x != null; }
function wrap(x)     { return '(' + x + ')';}

function maybeQuote(value) {
    if (typeof value === 'string') {
        return '"' + value + '"';
    }
    return value;
}

function lookUp(key) {
    if (key[0] === '$') {
        // keys prefixed with $ are special properties in the context object (not feature properties)
        return 'context[\'' + key.substring(1) + '\']';
    }
    else if (key.indexOf('.') > -1) {
        if (key.indexOf('\\.') === -1) { // no escaped dot notation
            // un-escaped dot notation indicates a nested feature property
            return `context.feature.properties${key.split('.').map(k => '[\'' + k + '\']').join('')}`;
        }
        else { // mixed escaped/unescaped dot notation
            // escaped dot notation will be interpreted as a single-level feature property with dots in the name
            // this splits on unescaped dots, which requires a temporary swap of escaped and unescaped dots
            let keys = key
                .replace(/\\\./g, '__TANGRAM_SEPARATOR__')
                .split('.')
                .map(s => s.replace(/__TANGRAM_SEPARATOR__/g, '.'));
            return `context.feature.properties${keys.map(k => '[\'' + k + '\']').join('')}`;
        }
    }
    // single-level feature property
    return 'context.feature.properties[\'' + key + '\']';
}

function nullValue(/*key, value*/) {
    return ' true ';
}

function propertyEqual(key, value) {
    return wrap(maybeQuote(value) + ' === ' + lookUp(key));
}

function propertyOr(key, values) {
    return wrap(values.map(function (x) { return propertyEqual(key, x); }).join(' || '));
}

function printNested(values, joiner) {
    return wrap(values.filter(notNull).map(function (x) {
        return wrap(x.join(' && '));
    }).join(' ' + joiner + ' '));
}

function any(_, values, options) {
    return (values && values.length > 0) ? printNested(values.map(function(v) { return parseFilter(v, options); }), '||') : 'true';
}

function all(_, values, options) {
    return (values && values.length > 0) ? printNested(values.map(function(v) { return parseFilter(v, options); }), '&&') : 'true';
}

function not(key, value, options) {
    return '!' + wrap(parseFilter(value, options).join(' && '));
}

function none(key, values, options) {
    return '!' + wrap(any(null, values, options));
}

function propertyMatchesBoolean(key, value) {
    return wrap(lookUp(key) + (value ? ' != ' : ' == ')  + 'null');
}

function rangeMatch(key, values, options) {
    var expressions = [];
    var transform = options && (typeof options.rangeTransform === 'function') && options.rangeTransform;

    if (values.max) {
        var max = transform ? transform(values.max) : values.max;
        expressions.push('' + lookUp(key) + ' < ' + max);
    }

    if (values.min) {
        var min = transform ? min = transform(values.min) : values.min;
        expressions.push('' + lookUp(key) + ' >= ' + min);
    }

    return wrap(expressions.join(' && '));
}

function parseFilter(filter, options) {
    var filterAST = [];

    // Function filter
    if (typeof filter === 'function') {
        return [wrap(filter.toString() + '(context)')];
    }
    // Array filter, implicit 'any'
    else if (Array.isArray(filter)) {
        return [any(null, filter, options)];
    }
    // Null filter object
    else if (filter == null) {
        return ['true'];
    }

    // Object filter, e.g. implicit 'all'
    var keys = Object.keys(filter);
    for (var k=0; k < keys.length; k++) {
        var key = keys[k];

        var value = filter[key],
            type  = typeof value;
        if (type === 'string' || type === 'number') {
            filterAST.push(propertyEqual(key, value));
        } else if (type === 'boolean') {
            filterAST.push(propertyMatchesBoolean(key, value));
        } else if (key === 'not') {
            filterAST.push(not(key, value, options));
        } else if (key === 'any') {
            filterAST.push(any(key, value, options));
        } else if (key === 'all') {
            filterAST.push(all(key, value, options));
        } else if (key === 'none') {
            filterAST.push(none(key, value, options));
        } else if (Array.isArray(value)) {
            filterAST.push(propertyOr(key, value));
        } else if (type === 'object' && value != null) {
            if (value.max || value.min) {
                filterAST.push(rangeMatch(key, value, options));
            }
        } else if (value == null) {
            filterAST.push(nullValue(key, value));
        } else {
            throw new Error('Unknown Query syntax: ' + value);
        }
    }

    return keys.length === 0 ? ['true'] : filterAST;
}

function filterToString(filterAST) {
    return wrap(filterAST.join(' && '));
}

export function buildFilter(filter, options) {
    if (filter == null) { return function () { return true; }; }
    // jshint evil: true
    return new Function('context', 'return ' + filterToString(parseFilter(filter, options)) + ';');
}
