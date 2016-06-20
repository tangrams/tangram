import Utils from '../utils/utils';
import Geo from '../geo';

import parseCSSColor from 'csscolorparser';

export var StyleParser = {};

// Wraps style functions and provides a scope of commonly accessible data:
// - feature: the 'properties' of the feature, e.g. accessed as 'feature.name'
// - global: user-defined properties on the `global` object in the scene file
// - $zoom: the current map zoom level
// - $geometry: the type of geometry, 'point', 'line', or 'polygon'
// - $meters_per_pixel: conversion for meters/pixels at current map zoom
StyleParser.wrapFunction = function (func) {
    var f = `function(context) {
                var feature = context.feature.properties;
                var global = context.global;
                var $zoom = context.zoom;
                var $layer = context.layer;
                var $geometry = context.geometry;
                var $meters_per_pixel = context.meters_per_pixel;

                var val = (${func}());

                if (typeof val === 'number' && isNaN(val)) {
                    val = null; // convert NaNs to nulls
                }

                return val;
            }`;
    return f;
};


// Style parsing

StyleParser.zeroPair = Object.freeze([0, 0]); // single allocation for zero values that won't be modified

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

// Style macros
StyleParser.macros = {
    // pseudo-random color by geometry id
    'Style.color.pseudoRandomColor': function() {
        return [
            0.7 * (parseInt(feature.id, 16) / 100 % 1),     // jshint ignore:line
            0.7 * (parseInt(feature.id, 16) / 10000 % 1),   // jshint ignore:line
            0.7 * (parseInt(feature.id, 16) / 1000000 % 1), // jshint ignore:line
            1
        ];
    },

    // random color
    'Style.color.randomColor': function() {
        return [0.7 * Math.random(), 0.7 * Math.random(), 0.7 * Math.random(), 1];
    }
};

// A context object that is passed to style parsing functions to provide a scope of commonly used values
StyleParser.getFeatureParseContext = function (feature, tile, global) {
    return {
        feature,
        tile,
        global,
        zoom: tile.style_zoom,
        geometry: Geo.geometryType(feature.geometry.type),
        meters_per_pixel: tile.meters_per_pixel,
        units_per_meter_overzoom: tile.units_per_meter_overzoom
    };
};

// Build a style param cache object
// `value` is raw value, cache methods will add other properties as needed
// `transform` is optional transform function to run on values (except function values)
StyleParser.cacheObject = function (obj, transform = null) {
    if (obj == null) {
        return;
    }

    if (obj.value) {
        return { value: obj.value, zoom: (obj.zoom ? {} : null) }; // clone existing cache object
    }

    let c = { value: obj };

    if (typeof transform === 'function') {
        if (Array.isArray(c.value) && Array.isArray(c.value[0])) { // zoom stops
            c.value = c.value.map(v => [v[0], transform(v[1])]);
            c.zoom = {}; // will hold values interpolated by zoom
        }
        else if (typeof c.value !== 'function') { // don't transform functions
            c.value = transform(c.value); // single value
        }
    }

    return c;
};

// Convert old-style color macro into a function
// TODO: deprecate this macro syntax
StyleParser.colorCacheObject = function (obj) {
    return StyleParser.cacheObject(obj, v => {
        if (v === 'Style.color.pseudoRandomColor') {
            return Utils.stringToFunction(StyleParser.wrapFunction(StyleParser.macros['Style.color.pseudoRandomColor']));
        }
        else if (v === 'Style.color.randomColor') {
            return StyleParser.macros['Style.color.randomColor'];
        }

        return v;
    });
};

// Interpolation and caching for a generic property (not a color or distance)
// { value: original, static: val, zoom: { 1: val1, 2: val2, ... }, dynamic: function(){...} }
StyleParser.cacheProperty = function(val, context) {
    if (val == null) {
        return;
    }
    else if (val.dynamic) { // function, compute each time (no caching)
        let v = val.dynamic(context);
        return v;
    }
    else if (val.static) { // single static value
        return val.static;
    }
    else if (val.zoom && val.zoom[context.zoom]) { // interpolated, cached
        return val.zoom[context.zoom];
    }
    else { // not yet evaulated for cache
        // Dynamic function-based
        if (typeof val.value === 'function') {
            val.dynamic = val.value;
            let v = val.dynamic(context);
            return v;
        }
        // Array of zoom-interpolated stops, e.g. [zoom, value] pairs
        else if (Array.isArray(val.value) && Array.isArray(val.value[0])) {
            // Calculate value for current zoom
            val.zoom = val.zoom || {};
            val.zoom = {};
            val.zoom[context.zoom] = Utils.interpolate(context.zoom, val.value);
            return val.zoom[context.zoom];
        }
        // Single static value
        else {
            val.static = val.value;
            return val.static;
        }
    }
};

StyleParser.convertUnits = function(val, context) {
    // pre-parsed units
    if (val.val != null) {
        if (val.units === 'px') { // convert from pixels
            return val.val * Geo.metersPerPixel(context.zoom);
        }
        return val.val;
    }
    // un-parsed unit string
    else if (typeof val === 'string') {
        var units = val.match(/([0-9.-]+)([a-z]+)/);
        if (units && units.length === 3) {
            val = parseFloat(units[1]);
            units = units[2];
        }

        if (units === 'px') { // convert from pixels
            val *= Geo.metersPerPixel(context.zoom);
        }
    }
    // multiple values or stops
    else if (Array.isArray(val)) {
        // Array of arrays, e.g. zoom-interpolated stops
        if (Array.isArray(val[0])) {
            return val.map(v => [v[0], StyleParser.convertUnits(v[1], context)]);
        }
        // Array of values
        else {
            return val.map(v => StyleParser.convertUnits(v, context));
        }
    }
    return val;
};

// Pre-parse units from string values
StyleParser.cacheUnits = function (val) {
    var obj = { val: parseFloat(val) };
    if (obj.val !== 0 && typeof val === 'string' && val.trim().slice(-2) === 'px') {
        obj.units = 'px';
    }
    return obj;
};

// Takes a distance cache object and returns a distance value for this zoom
// (caching the result for future use)
// { value: original, zoom: { z: meters }, dynamic: function(){...} }
StyleParser.cacheDistance = function(val, context) {
    if (val.dynamic) {
        let v = val.dynamic(context);
        return v;
    }
    else if (val.zoom && val.zoom[context.zoom]) {
        return val.zoom[context.zoom];
    }
    else {
        // Dynamic function-based
        if (typeof val.value === 'function') {
            val.dynamic = val.value;
            let v = val.dynamic(context);
            return v;
        }
        // Array of zoom-interpolated stops, e.g. [zoom, value] pairs
        else if (val.zoom) {
            // Calculate value for current zoom
            // Do final unit conversion as late as possible, when interpolation values have been determined
            val.zoom[context.zoom] = Utils.interpolate(context.zoom, val.value,
                v => StyleParser.convertUnits(v, context));

            return val.zoom[context.zoom];
        }
        else {
            return StyleParser.convertUnits(val.value, context);
        }
    }
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
        color = StyleParser.defaults.color;
    }
    StyleParser.string_colors[string] = color;
    return color;
};

// Takes a color cache object and returns a color value for this zoom
// (caching the result for future use)
// { value: original, static: [r,g,b,a], zoom: { z: [r,g,b,a] }, dynamic: function(){...} }
StyleParser.cacheColor = function(val, context = {}) {
    if (val.dynamic) {
        let v = val.dynamic(context);

        if (typeof v === 'string') {
            v = StyleParser.colorForString(v);
        }

        if (v && v[3] == null) {
            v[3] = 1; // default alpha
        }
        return v;
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
            let v = val.dynamic(context);

            if (typeof v === 'string') {
                v = StyleParser.colorForString(v);
            }

            if (v && v[3] == null) {
                v[3] = 1; // default alpha
            }
            return v;
        }
        // Single string color
        else if (typeof val.value === 'string') {
            val.static = StyleParser.colorForString(val.value);
            return val.static;
        }
        // Array of zoom-interpolated stops, e.g. [zoom, color] pairs
        else if (val.zoom) {
            // Parse any string colors inside stops, the first time we encounter this property
            if (!val.zoom_preprocessed) {
                for (let i=0; i < val.value.length; i++) {
                    let v = val.value[i];
                    if (v && typeof v[1] === 'string') {
                        v[1] = StyleParser.colorForString(v[1]);
                    }
                }
                val.zoom_preprocessed = true;
            }

            // Calculate color for current zoom
            val.zoom[context.zoom] = Utils.interpolate(context.zoom, val.value);
            val.zoom[context.zoom][3] = val.zoom[context.zoom][3] || 1; // default alpha
            return val.zoom[context.zoom];
        }
        // Single array color
        else {
            val.static = val.value;
            if (val.static && val.static[3] == null) {
                val.static[3] = 1; // default alpha
            }
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
        val = StyleParser.colorForString(val);
    }
    else if (Array.isArray(val) && Array.isArray(val[0])) {
        // Array of zoom-interpolated stops, e.g. [zoom, color] pairs
        for (let i=0; i < val.length; i++) {
            let v = val[i];
            if (typeof v[1] === 'string') {
                v[1] = StyleParser.colorForString(v[1]);
            }
        }

        if (context.zoom) {
            val = Utils.interpolate(context.zoom, val);
        }
    }

    // Defaults
    if (val) {
        // alpha
        if (val[3] == null) {
            val[3] = 1;
        }
    }
    else {
        val = [0, 0, 0, 1];
    }

    return val;
};

StyleParser.calculateOrder = function(order, context) {
    // Computed order
    if (typeof order === 'function') {
        order = order(context);
    }
    else if (typeof order === 'string') {
        // Order tied to feature property
        if (context.feature.properties[order]) {
            order = context.feature.properties[order];
        }
        // Explicit order value
        else {
            order = parseFloat(order);
        }
    }

    return order;
};

// Evaluate a function-based property, or pass-through static value
StyleParser.evalProp = function(prop, context) {
    if (typeof prop === 'function') {
        return prop(context);
    }
    return prop;
};
