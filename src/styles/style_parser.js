import Utils from '../utils/utils';
import {compileFunctionString} from '../utils/functions';
import Geo from '../geo';
import log from '../utils/log';

import parseCSSColor from 'csscolorparser';

const StyleParser = {};
export default StyleParser;

// Helpers for string converstion / NaN handling
const clampPositive = v => Math.max(v, 0);
const noNaN = v => isNaN(v) ? 0 : v;
const parseNumber = v => Array.isArray(v) ? v.map(parseFloat).map(noNaN) : noNaN(parseFloat(v));
const parsePositiveNumber = v => Array.isArray(v) ? v.map(parseNumber).map(clampPositive) : clampPositive(parseNumber(v));

Object.assign(StyleParser, {clampPositive, noNaN, parseNumber, parsePositiveNumber});

// Wraps style functions and provides a scope of commonly accessible data:
// - feature: the 'properties' of the feature, e.g. accessed as 'feature.name'
// - global: user-defined properties on the `global` object in the scene file
// - $zoom: the current map zoom level
// - $geometry: the type of geometry, 'point', 'line', or 'polygon'
// - $meters_per_pixel: conversion for meters/pixels at current map zoom
StyleParser.wrapFunction = function (func) {
    var f = `
        var feature = context.feature.properties;
        var global = context.global;
        var $zoom = context.zoom;
        var $layer = context.layer;
        var $source = context.source;
        var $geometry = context.geometry;
        var $meters_per_pixel = context.meters_per_pixel;

        var val = (function(){ ${func} }());

        if (typeof val === 'number' && isNaN(val)) {
            val = null; // convert NaNs to nulls
        }

        return val;
    `;
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
    outline: {
        color: [0, 0, 0, 0],
        width: 0
    },
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
            0.7 * (parseInt(feature.id, 16) / 100 % 1),     // eslint-disable-line no-undef
            0.7 * (parseInt(feature.id, 16) / 10000 % 1),   // eslint-disable-line no-undef
            0.7 * (parseInt(feature.id, 16) / 1000000 % 1), // eslint-disable-line no-undef
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
        meters_per_pixel_sq: tile.meters_per_pixel_sq,
        units_per_meter_overzoom: tile.units_per_meter_overzoom
    };
};

// Build a style param cache object
// `value` is raw value, cache methods will add other properties as needed
// `transform` is optional transform function to run on values (except function values)
const CACHE_TYPE = {
    STATIC: 0,
    DYNAMIC: 1,
    ZOOM: 2
};
StyleParser.CACHE_TYPE = CACHE_TYPE;

StyleParser.createPropertyCache = function (obj, transform = null) {
    if (obj == null) {
        return;
    }

    if (obj.value) {
        return { value: obj.value, zoom: (obj.zoom ? {} : null), type: obj.type }; // clone existing cache object
    }

    let c = { value: obj, type: CACHE_TYPE.STATIC };

    // does value contain zoom stops to be interpolated?
    if (Array.isArray(c.value) && Array.isArray(c.value[0])) {
        c.zoom = {}; // will hold values interpolated by zoom
        c.type = CACHE_TYPE.ZOOM;
    }
    else if (typeof c.value === 'function') {
        c.type = CACHE_TYPE.DYNAMIC;
    }

    // apply optional transform function - usually a parsing function
    if (typeof transform === 'function') {
        if (c.zoom) { // apply to each zoom stop value
            c.value = c.value.map((v, i) => [v[0], transform(v[1], i)]);
        }
        else if (typeof c.value !== 'function') { // don't transform functions
            c.value = transform(c.value, 0); // single value, 0 = the first and only item in the array
        }
    }

    return c;
};

// Convert old-style color macro into a function
// TODO: deprecate this macro syntax
StyleParser.createColorPropertyCache = function (obj) {
    return StyleParser.createPropertyCache(obj, v => {
        if (v === 'Style.color.pseudoRandomColor') {
            return compileFunctionString(StyleParser.wrapFunction(StyleParser.macros['Style.color.pseudoRandomColor']));
        }
        else if (v === 'Style.color.randomColor') {
            return StyleParser.macros['Style.color.randomColor'];
        }

        return v;
    });
};

// Parse point sizes, which include optional %-based or aspect-ratio-constrained scaling from sprite size
// Returns a cache object if successful, otherwise throws error message
const isPercent = v => typeof v === 'string' && v[v.length-1] === '%'; // size computed by %
const isRatio = v => v === 'auto'; // size derived from aspect ratio of one dimension
const isComputed = v => isPercent(v) || isRatio(v);
const dualRatioError = '\'size\' can specify either width or height as derived from aspect ratio, but not both';
StyleParser.createPointSizePropertyCache = function (obj) {
    // obj is the value to be parsed eg "64px" "100%" "auto"
    // mimics the structure of the size value (at each zoom stop if applicable),
    // stores flags indicating if each element is a %-based size or not, or derived from aspect
    let has_pct = null;
    let has_ratio = null;
    if (isPercent(obj)) { // 1D size
        has_pct = [true];
    }
    else if (Array.isArray(obj)) {
        // track which fields are % vals
        if (Array.isArray(obj[0])) { // zoom stops
            // could be a 1D value (that could be a %), or a 2D value (either width or height or both could be a %)
            if (obj.some(v => Array.isArray(v[1]) ? v[1].some(w => isComputed(w)) : isPercent(v[1]))) {
                has_pct = obj.map(v => Array.isArray(v[1]) ? v[1].map(w => isPercent(w)) : isPercent(v[1]));
                has_ratio = obj.map(v => Array.isArray(v[1]) && v[1].map(w => isRatio(w)));
                if (has_ratio.some(v => Array.isArray(v) && v.every(c => c))) {
                    throw dualRatioError; // invalid case where both dims are ratios
                }
            }
        }
        else if (obj.some(isComputed)) { // 2D size
            has_pct = [obj.map(isPercent)];
            has_ratio = [obj.map(isRatio)];
            if (has_ratio[0].every(c => c)) {
                throw dualRatioError; // invalid case where both dims are ratios
            }
        }
    }

    if (!has_pct) { // no percentage-based calculation, one cache for all sprites
        if (obj === 'auto') { throw 'this value only allowed as half of an array, eg [16px, auto]:'; }
        obj = StyleParser.createPropertyCache(obj, parsePositiveNumber);
    }
    else { // per-sprite based evaluation
        obj = { value: obj };
        obj.has_pct = has_pct;
        obj.has_ratio = has_ratio;
        obj.sprites = {}; // cache by sprite
    }

    return obj;
};

StyleParser.evalCachedPointSizeProperty = function (val, sprite_info, texture_info, context) {
    // no percentage-based calculation, one cache for all sprites
    if (!val.has_pct && !val.has_ratio) {
        return StyleParser.evalCachedProperty(val, context);
    }

    let the_image = sprite_info ? sprite_info : texture_info;

    // this function is passed to createPropertyCache as the transform function -
    // when val.value is an array, it is used inside a map(), which is where i is used
    function evalValue(v, i) {
        if (Array.isArray(v)) { // 2D size
            // either width or height or both could be a %
            v = v.
                map((c, j) => val.has_ratio[i][j] ? c : parsePositiveNumber(c)). // convert non-ratio values to px
                map((c, j) => val.has_pct[i][j] ? the_image.css_size[j] * c / 100 : c); // apply % scaling as needed

            // either width or height could be a ratio
            if (val.has_ratio[i][0]) {
                v[0] = v[1] * the_image.aspect;
            }
            else if (val.has_ratio[i][1]) {
                v[1] = v[0] / the_image.aspect;
            }
        }
        else { // 1D size
            v = parsePositiveNumber(v);
            if (val.has_pct[i]) {
                v = the_image.css_size.map(c => c * v / 100); // set size as % of image
            }
            else {
                v = [v, v]; // expand 1D size to 2D
            }
        }
        return v;
    }
    // texture-based evaluation
    if (!sprite_info) {
        // apply percentage or ratio sizing to a texture
        let textureSizeCache = StyleParser.createPropertyCache(val.value, evalValue);

        return StyleParser.evalCachedProperty(textureSizeCache, context);

    } else {
    // per-sprite based evaluation
        // cache sizes per sprite
        if (!val.sprites[sprite_info.sprite]) {
            val.sprites[sprite_info.sprite] = StyleParser.createPropertyCache(val.value, evalValue);
        }
        return StyleParser.evalCachedProperty(val.sprites[sprite_info.sprite], context);
    }
};

// Interpolation and caching for a generic property (not a color or distance)
// { value: original, static: val, zoom: { 1: val1, 2: val2, ... }, dynamic: function(){...} }
StyleParser.evalCachedProperty = function(val, context) {
    if (val == null) {
        return;
    }
    else if (val.dynamic) { // function, compute each time (no caching)
        return tryEval(val.dynamic, context);
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
            return tryEval(val.dynamic, context);
        }
        // Array of zoom-interpolated stops, e.g. [zoom, value] pairs
        else if (Array.isArray(val.value) && Array.isArray(val.value[0])) {
            // Calculate value for current zoom
            val.zoom = val.zoom || {};
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
        if (val.trim().slice(-2) === 'px') {
            val = parseNumber(val);
            val *= Geo.metersPerPixel(context.zoom); // convert from pixels
        }
        else {
            val = parseNumber(val);
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
StyleParser.parseUnits = function (val) {
    var obj = { val: parseNumber(val) };
    if (obj.val !== 0 && typeof val === 'string' && val.trim().slice(-2) === 'px') {
        obj.units = 'px';
    }
    return obj;
};

// Takes a distance cache object and returns a distance value for this zoom
// (caching the result for future use)
// { value: original, zoom: { z: meters }, dynamic: function(){...} }
StyleParser.evalCachedDistanceProperty = function(val, context) {
    if (val.dynamic) {
        return tryEval(val.dynamic, context);
    }
    else if (val.zoom && val.zoom[context.zoom]) {
        return val.zoom[context.zoom];
    }
    else {
        // Dynamic function-based
        if (typeof val.value === 'function') {
            val.dynamic = val.value;
            return tryEval(val.dynamic, context);
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
StyleParser.evalCachedColorProperty = function(val, context = {}) {
    if (val.dynamic) {
        let v = tryEval(val.dynamic, context);

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
            let v = tryEval(val.dynamic, context);

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
            val.static = val.value.map(x => x); // copy to avoid modifying
            if (val.static && val.static[3] == null) {
                val.static[3] = 1; // default alpha
            }
            return val.static;
        }
    }
};

StyleParser.parseColor = function(val, context = {}) {
    if (typeof val === 'function') {
        val = tryEval(val, context);
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
    if (Array.isArray(val)) {
        val = val.map(x => x); // copy to avoid modifying
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
        order = tryEval(order, context);
    }
    else if (typeof order === 'string') {
        // Order tied to feature property
        if (context.feature.properties[order]) {
            order = context.feature.properties[order];
        }
        // Explicit order value
        else {
            order = parsePositiveNumber(order);
        }
    }

    return order;
};

// Evaluate a function-based property, or pass-through static value
StyleParser.evalProperty = function(prop, context) {
    if (typeof prop === 'function') {
        return tryEval(prop, context);
    }
    return prop;
};

// eval property function with try/catch
function tryEval (func, context) {
    try {
        return func(context);
    } catch(e) {
        log('warn',
            `Property function in layer '${context.layers[context.layers.length-1]}' failed with\n`,
            `error ${e.stack}\n`,
            `function '${func.source}'\n`,
            context.feature, context);
    }
}
