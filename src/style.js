import Utils from './utils';
import {Geo} from './geo';

import parseCSSColor from 'csscolorparser';
import log from 'loglevel';

export var Style = {};

// Style macros

Style.color = {
    pseudoRandomGrayscale: function (f) { var c = Math.max((parseInt(f.id, 16) % 100) / 100, 0.4); return [0.7 * c, 0.7 * c, 0.7 * c]; }, // pseudo-random grayscale by geometry id
    pseudoRandomColor: function (f) { return [0.7 * (parseInt(f.id, 16) / 100 % 1), 0.7 * (parseInt(f.id, 16) / 10000 % 1), 0.7 * (parseInt(f.id, 16) / 1000000 % 1)]; }, // pseudo-random color by geometry id
    randomColor: function (f) { return [0.7 * Math.random(), 0.7 * Math.random(), 0.7 * Math.random()]; } // random color
};

// Returns a function (that can be used as a dynamic style) that converts pixels to meters for the current zoom level.
// The provided pixel value ('p') can itself be a function, in which case it is wrapped by this one.
Style.pixels = function (p) {
    var f;
    /* jshint ignore:start */
    eval('f = function() { return ' + (typeof p === 'function' ? '(' + (p.toString() + '())') : p) + ' * meters_per_pixel; }');
    /* jshint ignore:end */
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
                var zoom = context.zoom;
                var meters_per_pixel = context.meters_per_pixel;
                var properties = context.properties;
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


// Style defaults

// Determine final style properties (color, width, etc.)
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
        active: false,
        color: [0, 0, 0, 1]
    },
    mode: {
        name: 'polygons'
    }
};

// Style parsing

Style.interpolate = function(x, val) {
    if (Array.isArray(val) && val.every(v => { return Array.isArray(v); })) {
        return Utils.interpolate(x, val);
    }
    return val;
};

Style.convertUnits = function(val, context) {
    if (typeof val === 'string') {
        // Convert from pixels
        if (val.indexOf('px') === val.length - 2) {
            val = parseFloat(val.substr(0, val.length-2)) * Geo.metersPerPixel(context.zoom);
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
    val = Style.interpolate(context.zoom, val);
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

    val = Style.interpolate(context.zoom, val);
    return val;
};

Style.parseStyleForFeature = function (feature, layer_name, layer_style, tile)
{
    layer_style = layer_style || {};
    var style = {};

    var context = {
        feature: feature,
        properties: Object.assign({}, layer_style.properties||{}), // Object.assign polyfill fails on null object
        zoom: tile.coords.z,
        meters_per_pixel: Geo.metersPerPixel(tile.coords.z),
        units_per_meter: Geo.units_per_meter[tile.coords.z]
    };

    // Test whether features should be rendered at all
    if (typeof layer_style.filter === 'function') {
        if (layer_style.filter(context) === false) {
            return null;
        }
    }

    // Parse styles
    style.color = (layer_style.color && (layer_style.color[feature.properties.kind] || layer_style.color.default)) || Style.defaults.color;
    style.color = Style.parseColor(style.color, context);

    style.width = (layer_style.width && (layer_style.width[feature.properties.kind] || layer_style.width.default)) || Style.defaults.width;
    style.width = Style.parseDistance(style.width, context);

    style.size = (layer_style.size && (layer_style.size[feature.properties.kind] || layer_style.size.default)) || Style.defaults.size;
    style.size = Style.parseDistance(style.size, context);

    style.extrude = (layer_style.extrude && (layer_style.extrude[feature.properties.kind] || layer_style.extrude.default)) || Style.defaults.extrude;
    style.extrude = Style.parseDistance(style.extrude, context);

    style.height = (feature.properties && feature.properties.height) || Style.defaults.height;
    style.min_height = (feature.properties && feature.properties.min_height) || Style.defaults.min_height;

    // height defaults to feature height, but extrude style can dynamically adjust height by returning a number or array (instead of a boolean)
    if (style.extrude) {
        if (typeof style.extrude === 'number') {
            style.height = style.extrude;
        }
        else if (typeof style.extrude === 'object' && style.extrude.length >= 2) {
            style.min_height = style.extrude[0];
            style.height = style.extrude[1];
        }
    }

    style.z = (layer_style.z && (layer_style.z[feature.properties.kind] || layer_style.z.default)) || Style.defaults.z || 0;
    style.z = Style.parseDistance(style.z, context);

    // Adjusts feature render order *within* the overall layer
    // e.g. 'order' causes this feature to be drawn underneath or on top of other features in the same layer,
    // but all features on layers below this one will be drawn underneath, all features on layers above this one
    // will be drawn on top
    style.order = layer_style.order || Style.defaults.order;
    if (typeof style.order === 'function') {
        style.order = style.order(context);
    }
    style.order = Math.max(Math.min(style.order, 1), -1); // clamp to [-1, 1]

    style.outline = {};
    layer_style.outline = layer_style.outline || {};
    style.outline.color = (layer_style.outline.color && (layer_style.outline.color[feature.properties.kind] || layer_style.outline.color.default)) || Style.defaults.outline.color;
    style.outline.color = Style.parseColor(style.outline.color, context);

    style.outline.width = (layer_style.outline.width && (layer_style.outline.width[feature.properties.kind] || layer_style.outline.width.default)) || Style.defaults.outline.width;
    style.outline.width = Style.parseDistance(style.outline.width, context);

    // style.outline.dash = (layer_style.outline.dash && (layer_style.outline.dash[feature.properties.kind] || layer_style.outline.dash.default)) || Style.defaults.outline.dash;

    style.outline.tile_edges = (layer_style.outline.tile_edges === true) ? true : false;

    // Interactivity (selection map)
    var interactive = false;
    if (typeof layer_style.interactive === 'function') {
        interactive = layer_style.interactive(context);
    }
    else {
        interactive = layer_style.interactive;
    }

    if (interactive === true) {
        var selector = Style.generateSelection();

        selector.feature = {
            id: feature.id,
            properties: feature.properties
        };
        selector.feature.properties.layer = layer_name; // add layer name to properties

        style.selection = {
            active: true,
            color: selector.color
        };
    }
    else {
        style.selection = Style.defaults.selection;
    }

    // Render mode
    if (layer_style.mode != null && layer_style.mode.name != null) {
        style.mode = {};
        for (var m in layer_style.mode) {
            style.mode[m] = layer_style.mode[m];
        }
    }
    else {
        style.mode = Style.defaults.mode;
    }

    return style;
};

