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
    'Style.pixels'
];



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
    f = 'function() { return ' + (typeof p === 'function' ? '(' + (p.toString() + '())') : p) + ' * $meters_per_pixel; }';
    return f;
};

// Wraps style functions and provides a scope of commonly accessible data:
// - feature: the 'properties' of the feature, e.g. accessed as 'feature.name'
// - $zoom: the current map zoom level
// - $geometry: the type of geometry, 'point', 'line', or 'polygon'
// - $meters_per_pixel: conversion for meters/pixels at current map zoom
// - properties: user-defined properties on the style-rule object in the stylesheet
StyleParser.wrapFunction = function (func) {
    var f = `function(context) {
                var feature = context.feature.properties;
                var $zoom = context.zoom;
                var $geometry = context.geometry;
                var $meters_per_pixel = context.meters_per_pixel;
                var properties = context.properties;
                return (${func}());
            }`;
    return f;
};


// Style parsing

// Style defaults
StyleParser.defaults = {
    color: [1, 1, 1, 1],
    width: 1,
    size: 1,
    extrude: false,
    height: 20,
    min_height: 0,
    order: 0,
    z: 0,
    material: {
        ambient: 1,
        diffuse: 1
    }
};


// A context object that is passed to style parsing functions to provide a scope of commonly used values
StyleParser.getFeatureParseContext = function (feature, tile) {
    return {
        feature,
        tile,
        zoom: tile.style_zoom || tile.coords.z,
        geometry: Geo.geometryType(feature.geometry.type),
        meters_per_pixel: Geo.metersPerPixel(tile.coords.z),
        units_per_meter: Geo.units_per_meter[tile.coords.z]
    };
};

StyleParser.convertUnits = function(val, context, convert = 'meters') {
    if (typeof val === 'string') {
        var units = val.match(/([0-9.-]+)([a-z]+)/);
        if (units && units.length === 3) {
            val = parseFloat(units[1]);
            units = units[2];
        }

        // Convert to meters
        if (convert === 'meters') {
            // Convert from pixels
            if (units === 'px') {
                val *= Geo.metersPerPixel(context.zoom);
            }
            // Convert from kilometers
            else if (units === 'km') {
                val *= 1000;
            }
        }
    }
    else if (Array.isArray(val)) {
        // Array of arrays, e.g. zoom-interpolated stops
        if (Array.isArray(val[0])) {
            return val.map(v => { return [v[0], StyleParser.convertUnits(v[1], context, convert)]; });
        }
        // Array of values
        else {
            return val.map(v => { return StyleParser.convertUnits(v, context, convert); });
        }
    }
    return val;
};

// Takes a distance cache object and returns a distance value for this zoom
// (caching the result for future use)
// { value: original, zoom: { z: meters }, dynamic: function(){...} }
StyleParser.cacheDistance = function(val, context, convert = 'units') {
    if (val.dynamic) {
        let v = val.dynamic(context);
        if (convert === 'units') {
            v *= context.units_per_meter;
        }
        return v;
    }
    else if (val.zoom && val.zoom[convert] && val.zoom[convert][context.zoom]) {
        return val.zoom[convert][context.zoom];
    }
    else {
        // Dynamic function-based
        if (typeof val.value === 'function') {
            val.dynamic = val.value;
            let v = val.dynamic(context);
            if (convert === 'units') {
                v *= context.units_per_meter;
            }
            return v;
        }
        // Array of zoom-interpolated stops, e.g. [zoom, color] pairs
        else {
            // Calculate color for current zoom
            val.zoom = val.zoom || {};
            let zunits = val.zoom[convert] = val.zoom[convert] || {};

            zunits[context.zoom] = StyleParser.convertUnits(val.value, context,
                (convert === 'units' || convert === 'meters') && 'meters'); // convert to meters
            zunits[context.zoom] = Utils.interpolate(context.zoom, zunits[context.zoom]);

            // Convert to tile units
            if (convert === 'units') {
                zunits[context.zoom] *= context.units_per_meter;
            }
            return zunits[context.zoom];
        }
    }
};

StyleParser.parseDistance = function(val, context, convert = 'units') {
    if (typeof val === 'function') {
        val = val(context);
    }
    val = StyleParser.convertUnits(val, context,
        (convert === 'units' || convert === 'meters') && 'meters'); // convert to meters
    val = Utils.interpolate(context.zoom, val);

    // Convert to tile units
    if (convert === 'units') {
        if (typeof val === 'number') {
            val *= context.units_per_meter;
        }
        else if (Array.isArray(val)) {
            val.forEach((v, i) => val[i] *= context.units_per_meter);
        }
    }
    return val;
};

// Cache previously parsed color strings
StyleParser.string_colors = {};
StyleParser.colorForString = function(string) {
    // Cached
    if (StyleParser.string_colors[string]) {
        return StyleParser.string_colors[string];
    }

    // Calculate and cache
    let color = parseCSSColor.parseCSSColor(string);
    if (color && color.length === 4) {
        color[0] /= 255;
        color[1] /= 255;
        color[2] /= 255;
    }
    else {
        color = [0, 0, 0, 1];
    }
    StyleParser.string_colors[string] = color;
    return color;
};

// Takes a color cache object and returns a color value for this zoom
// (caching the result for future use)
// { value: original, static: [r,g,b,a], zoom: { z: [r,g,b,a] }, dynamic: function(){...} }
StyleParser.cacheColor = function(val, context = {}) {
    if (val.dynamic) {
        return val.dynamic(context);
    }
    else if (val.static) {
        return val.static;
    }
    else if (val.zoom && val.zoom[context.zoom]) {
        return val.zoom[context.zoom];
    }
    else {
        // Dynamic function-based color
        if (typeof val.value === 'function') {
            val.dynamic = val.value;
            return val.dynamic(context);
        }
        // Single string color
        else if (typeof val.value === 'string') {
            val.static = StyleParser.colorForString(val.value);
            return val.static;
        }
        // Array of zoom-interpolated stops, e.g. [zoom, color] pairs
        else if (Array.isArray(val.value) && Array.isArray(val.value[0])) {
            if (!val.zoom) {
                val.zoom = {};
                // Parse any string colors inside stops
                for (let i=0; i < val.value.length; i++) {
                    let v = val.value[i];
                    if (typeof v[1] === 'string') {
                        v[1] = StyleParser.colorForString(v[1]);
                    }
                }
            }

            // Calculate color for current zoom
            val.zoom[context.zoom] = Utils.interpolate(context.zoom, val.value);
            val.zoom[context.zoom][3] = val.zoom[context.zoom][3] || 1; // default alpha
            return val.zoom[context.zoom];
        }
        // Single array color
        else {
            val.static = val.value;
            val.static[3] = val.static[3] || 1; // default alpha
            return val.static;
        }
    }
};

StyleParser.parseColor = function(val, context = {}) {
    if (typeof val === 'function') {
        val = val(context);
    }

    // Parse CSS-style colors
    // TODO: change all colors to use 0-255 range internally to avoid dividing and then re-multiplying in geom builder
    if (typeof val === 'string') {
        val = parseCSSColor.parseCSSColor(val);
        if (val && val.length === 4) {
            val[0] /= 255;
            val[1] /= 255;
            val[2] /= 255;
        }
        else {
            val = null;
        }
    }
    else if (Array.isArray(val) && Array.isArray(val[0])) {
        // Array of zoom-interpolated stops, e.g. [zoom, color] pairs
        for (let i=0; i < val.length; i++) {
            let v = val[i];
            if (typeof v[1] === 'string') {
                var vc = parseCSSColor.parseCSSColor(v[1]);
                if (vc && vc.length === 4) {
                    vc[0] /= 255;
                    vc[1] /= 255;
                    vc[2] /= 255;
                    v[1] = vc;
                }
            }
        }
    }

    if (context.zoom) {
        val = Utils.interpolate(context.zoom, val);
    }

    // Defaults
    if (val) {
        // alpha
        if (!val[3]) {
            val[3] = 1;
        }
    }
    else {
        val = [0, 0, 0, 1];
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
            else if (typeof order === 'string') {
                order = context.feature.properties[order];
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
    else if (typeof order === 'string') {
        if (context.feature.properties[order]) {
            order = context.feature.properties[order];
        }
        else {
            order = parseFloat(order);
        }
    }

    return order;
};
