import Utils from './utils';
import {Geo} from './geo';

import parseCSSColor from 'csscolorparser';
import log from 'loglevel';

export var Style = {};

// Style macros

Style.color = {
    // pseudo-random grayscale by geometry id
    pseudoRandomGrayscale() {
        return `function() {
            var c = Math.max((parseInt(feature.id, 16) % 100) / 100, 0.4);
            return [0.7 * c, 0.7 * c, 0.7 * c];
        }`;
    },

    // pseudo-random color by geometry id
    pseudoRandomColor() {
        return `function() {
            return [
                0.7 * (parseInt(feature.id, 16) / 100 % 1),
                0.7 * (parseInt(feature.id, 16) / 10000 % 1),
                0.7 * (parseInt(feature.id, 16) / 1000000 % 1)
            ];
        }`;
        // return `function() { return [0.7 * (parseInt(feature.id, 16) / 100 % 1), 0.7 * (parseInt(feature.id, 16) / 10000 % 1), 0.7 * (parseInt(feature.id, 16) / 1000000 % 1)]; }`;
    },

    // random color
    randomColor() {
        return [0.7 * Math.random(), 0.7 * Math.random(), 0.7 * Math.random()];
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

// Create a unique 32-bit color to identify a feature
// Workers independently create/modify selection colors in their own threads, but we also
// need the main thread to know where each feature color originated. To accomplish this,
// we partition the map by setting the 4th component (alpha channel) to the worker's id.
Style.selection_map = {}; // this will be unique per module instance (so unique per worker)
Style.selection_map_size = 1; // start at 1 since 1 will be divided by this
Style.selection_map_prefix = 0; // set by worker to worker id #
Style.generateSelection = function ()
{
    // 32-bit color key
    Style.selection_map_size++;
    var ir = Style.selection_map_size & 255;
    var ig = (Style.selection_map_size >> 8) & 255;
    var ib = (Style.selection_map_size >> 16) & 255;
    var ia = Style.selection_map_prefix;
    var r = ir / 255;
    var g = ig / 255;
    var b = ib / 255;
    var a = ia / 255;
    var key = (ir + (ig << 8) + (ib << 16) + (ia << 24)) >>> 0; // need unsigned right shift to convert to positive #

    Style.selection_map[key] = {
        color: [r, g, b, a],
    };

    return Style.selection_map[key];
};

Style.resetSelectionMap = function ()
{
    Style.selection_map = {};
    Style.selection_map_size = 1;
};

// Find and expand style macros
Style.macros = [
    'Style.color.pseudoRandomColor',
    'Style.color.randomColor',
    'Style.pixels'
];

// Wraps style functions and provides a scope of commonly accessible data:
// - feature: the 'properties' of the feature, e.g. accessed as 'feature.name'
// - zoom: the current map zoom level
// - meters_per_pixel: conversion for meters/pixels at current map zoom
// - properties: user-defined properties on the style-rule object in the stylesheet
Style.wrapFunction = function (func) {
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

Style.expandMacros = function expandMacros (obj) {
    for (var p in obj) {
        var val = obj[p];

        // Loop through object properties
        if (typeof val === 'object') {
            obj[p] = expandMacros(val);
        }
        // Convert strings back into functions
        else if (typeof val === 'string') {
            for (var m in Style.macros) {
                if (val.match(Style.macros[m])) {
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


// Style parsing

// Style defaults
Style.defaults = {
    color: [1.0, 0, 0],
    width: 1,
    size: 1,
    extrude: false,
    height: 20,
    min_height: 0,
    order: 0,
    outline: {
        // color: [1.0, 0, 0],
        // width: 1,
        // dash: null
    },
    selection: {
        color: [0, 0, 0, 1]
    },
    mode: {
        name: 'polygons'
    }
};


// A context object that is passed to style parsing functions to provide a scope of commonly used values
Style.getFeatureParseContext = function (feature, feature_style, tile) {
    return {
        feature: feature,
        properties: Object.assign({}, feature_style.properties||{}), // Object.assign polyfill fails on null object
        zoom: tile.coords.z,
        meters_per_pixel: Geo.metersPerPixel(tile.coords.z),
        units_per_meter: Geo.units_per_meter[tile.coords.z]
    };
};

Style.convertUnits = function(val, context) {
    if (typeof val === 'string') {
        var units = val.match(/(\d+)([a-zA-z]+)/);
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
            return val.map(v => { return [v[0], Style.convertUnits(v[1], context)]; });
        }
        // Array of values
        else {
            return val.map(v => { return Style.convertUnits(v, context); });
        }
    }
    return val;
};

Style.parseDistance = function(val, context) {
    if (typeof val === 'function') {
        val = val(context);
    }
    val = Style.convertUnits(val, context);
    val = Utils.interpolate(context.zoom, val);
    if (typeof val === 'number') {
        val *= context.units_per_meter;
    }
    return val;
};

Style.parseColor = function(val, context) {
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
    return val;
};
