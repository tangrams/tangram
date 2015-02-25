import Utils from '../utils/utils';
import Geo from '../geo';

import parseCSSColor from 'csscolorparser';
import log from 'loglevel';

export var StyleParser = {};

// Style macros

StyleParser.expandMacros = function expandMacros (obj) {
    for (var p in obj) {
        var val = obj[p];

        // Loop through object properties
        if (typeof val === 'object') {
            obj[p] = expandMacros(val);
        }
        // Convert strings back into functions
        else if (typeof val === 'string') {
            for (var m in StyleParser.macros) {
                if (val.match(StyleParser.macros[m])) {
                    var f;
                    try {
                        /*jshint ignore:start */
                        eval('f = ' + val);
                        /*jshint ignore:end */
                        obj[p] = f;
                        log.trace(`expanded macro ${val} to ${f}`);
                        break;
                    }
                    catch (e) {
                        // fall-back to original value if parsing failed
                        obj[p] = val;
                        log.trace(`failed to expand macro ${val}`);
                    }
                }
            }
        }
    }

    return obj;
};

// List of macros
StyleParser.macros = [
    'Style.color.pseudoRandomColor',
    'Style.color.randomColor',
    'Style.pixels',
    'Q.is'
];


export var Q = {
    is: function (property, value) {
        var fun = `function (obj) {
            return Object.is(Utils.getIn(feature, "${property}".split('.')), "${value}");
        }`;
        return fun;
    }
};


var Style = {};

Style.color = {
    // pseudo-random grayscale by geometry id
    pseudoRandomGrayscale() {
        var func = `function() {
            var c = Math.max((parseInt(feature.id, 16) % 100) / 100, 0.4);
            return [0.7 * c, 0.7 * c, 0.7 * c];
        }`;
        return func;
    },

    // pseudo-random color by geometry id
    pseudoRandomColor() {
        var func = `function() {
            return [
                0.7 * (parseInt(feature.id, 16) / 100 % 1),
                0.7 * (parseInt(feature.id, 16) / 10000 % 1),
                0.7 * (parseInt(feature.id, 16) / 1000000 % 1)
            ];
        }`;
        return func;
        // return `function() { return [0.7 * (parseInt(feature.id, 16) / 100 % 1), 0.7 * (parseInt(feature.id, 16) / 10000 % 1), 0.7 * (parseInt(feature.id, 16) / 1000000 % 1)]; }`;
    },

    // random color
    randomColor() {
        var func = `function() {
            return [0.7 * Math.random(), 0.7 * Math.random(), 0.7 * Math.random()];
        }`;
        return func;
    }
};

// Returns a function (that can be used as a dynamic style) that converts pixels to meters for the current zoom level.
// The provided pixel value ('p') can itself be a function, in which case it is wrapped by this one.
Style.pixels = function (p) {
    var f;
    /* jshint ignore:start */
    // eval('f = function() { return ' + (typeof p === 'function' ? '(' + (p.toString() + '())') : p) + ' * meters_per_pixel; }');
    /* jshint ignore:end */
    f = 'function() { return ' + (typeof p === 'function' ? '(' + (p.toString() + '())') : p) + ' * meters_per_pixel; }';
    return f;
};

// Wraps style functions and provides a scope of commonly accessible data:
// - feature: the 'properties' of the feature, e.g. accessed as 'feature.name'
// - zoom: the current map zoom level
// - meters_per_pixel: conversion for meters/pixels at current map zoom
// - properties: user-defined properties on the style-rule object in the stylesheet
StyleParser.wrapFunction = function (func) {
    var f = `function(context) {
                var feature = context.feature.properties;
                feature.id = context.feature.id;
                var zoom = context.zoom;
                var meters_per_pixel = context.meters_per_pixel;
                var properties = context.style_properties;
                return (${func}());
            }`;
    return f;
};


// Style parsing

// Style defaults
StyleParser.defaults = {
    color: [1.0, 0, 0],
    width: 1,
    size: 1,
    extrude: false,
    height: 20,
    min_height: 0,
    order: 0,
    z: 0,
    style: {
        name: 'polygons'
    }
};


// A context object that is passed to style parsing functions to provide a scope of commonly used values
StyleParser.getFeatureParseContext = function (feature, tile) {
    return {
        feature: feature,
        zoom: tile.coords.z,
        meters_per_pixel: Geo.metersPerPixel(tile.coords.z),
        units_per_meter: Geo.units_per_meter[tile.coords.z]
    };
};

StyleParser.convertUnits = function(val, context) {
    if (typeof val === 'string') {
        var units = val.match(/([0-9.]+)([a-z]+)/);
        if (units && units.length === 3) {
            val = units[1];
            units = units[2];
        }

        // Convert from pixels
        if (units === 'px') {
            val *= Geo.metersPerPixel(context.zoom);
        }
        // Convert from kilometers
        else if (units === 'km') {
            val *= 1000;
        }
        // Convert from string
        else {
            val = parseFloat(val);
        }
    }
    else if (Array.isArray(val)) {
        // Array of arrays, e.g. zoom-interpolated stops
        if (val.every(v => { return Array.isArray(v); })) {
            return val.map(v => { return [v[0], StyleParser.convertUnits(v[1], context)]; });
        }
        // Array of values
        else {
            return val.map(v => { return StyleParser.convertUnits(v, context); });
        }
    }
    return val;
};

StyleParser.parseDistance = function(val, context) {
    if (typeof val === 'function') {
        val = val(context);
    }
    val = StyleParser.convertUnits(val, context);
    val = Utils.interpolate(context.zoom, val);
    if (typeof val === 'number') {
        val *= context.units_per_meter;
    }
    else if (Array.isArray(val)) {
        val.forEach((v, i) => val[i] *= context.units_per_meter);
    }
    return val;
};

StyleParser.parseColor = function(val, context) {
    if (typeof val === 'function') {
        val = val(context);
    }

    // Parse CSS-style colors
    // TODO: change all colors to use 0-255 range internally to avoid dividing and then re-multiplying in geom builder
    if (typeof val === 'string') {
        val = parseCSSColor.parseCSSColor(val);
        if (val && val.length === 4) {
            val = val.slice(0, 3).map(c => { return c / 255; });
        }
        else {
            val = null;
        }
    }
    else if (Array.isArray(val) && val.every(v => { return Array.isArray(v); })) {
        // Array of zoom-interpolated stops, e.g. [zoom, color] pairs
        val = val.map(v => {
            if (typeof v[1] === 'string') {
                var vc = parseCSSColor.parseCSSColor(v[1]);
                if (vc && vc.length === 4) {
                    vc = vc.slice(0, 3).map(c => { return c / 255; });
                }
                return [v[0], vc];
            }
            return v;
        });
    }

    val = Utils.interpolate(context.zoom, val);

    // Default alpha
    if (!val[3]) {
        val[3] = 1;
    }

    return val;
};

// Order is summed from top to bottom in the style hierarchy:
// each child order value is added to the parent order value
StyleParser.calculateOrder = function(order, context) {
    if (typeof order === 'function') {
        order = order(context);
    }
    else if (Array.isArray(order)) {
        order = order.reduce((sum, order) => {
            order = order || StyleParser.defaults.order;
            if (typeof order === 'function') {
                order = order(context);
            }
            else {
                order = parseFloat(order);
            }

            if (!order || isNaN(order)) {
                return sum;
            }
            return sum + order;
        }, 0);
    }
    else {
        order = parseFloat(order);
    }

    return order;
};
