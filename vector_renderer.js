VectorRenderer.tile_scale = 4096; // coordinates are locally scaled to the range [0, tile_scale]
VectorRenderer.units_per_meter = [];
VectorRenderer.units_per_pixel = [];
for (var z=0; z <= Geo.max_zoom; z++) {
    VectorRenderer.units_per_meter[z] = VectorRenderer.tile_scale / (Geo.tile_size * Geo.meters_per_pixel[z]);
    VectorRenderer.units_per_pixel[z] = VectorRenderer.tile_scale / Geo.tile_size;
}

VectorRenderer.types = {};

// Layers: pass an object directly, or a URL as string to load remotely
function VectorRenderer (url_template, layers, styles)
{
    this.url_template = url_template;
    this.tiles = {};

    if (typeof(layers) == 'string') {
        this.layers = VectorRenderer.loadLayers(layers);
    }
    else {
        this.layers = layers;
    }

    if (typeof(styles) == 'string') {
        this.styles = VectorRenderer.loadStyles(styles);
    }
    else {
        this.styles = styles;
    }

    this.zoom = null;
    this.max_zoom = Geo.max_zoom; // overzoom will apply for zooms higher than this
    this.center = null;
    this.device_pixel_ratio = window.devicePixelRatio || 1;
    this.initialized = false;
}

VectorRenderer.prototype.init = function ()
{
    // Child class-specific initialization (e.g. GL context creation)
    if (typeof(this._init) == 'function') {
        this._init.apply(this, arguments);
    }
    this.initialized = true;
};

VectorRenderer.loadLayers = function (url)
{
    var layers;
    var req = new XMLHttpRequest();
    req.onload = function () { eval('layers = ' + req.response); }; // TODO: security!
    req.open('GET', url, false /* async flag */);
    req.send();
    return layers;
};

VectorRenderer.loadStyles = function (url)
{
    var styles;
    var req = new XMLHttpRequest();
    req.onload = function () { eval('styles = ' + req.response); }; // TODO: security!
    req.open('GET', url, false /* async flag */);
    req.send();
    return styles;
};

VectorRenderer.prototype.setCenter = function (lng, lat)
{
    this.center = { lng: lng, lat: lat };
};

VectorRenderer.prototype.setZoom = function (zoom)
{
    this.map_last_zoom = this.zoom;
    this.zoom = zoom;
    this.map_zooming = false;
};

VectorRenderer.prototype.startZoom = function ()
{
    this.map_last_zoom = this.zoom;
    this.map_zooming = true;
};

VectorRenderer.prototype.resizeMap = function (width, height)
{
    // no op, can be overriden by child classes (e.g. used by GL renderer to adjust canvas and viewport)
};

VectorRenderer.prototype.render = function ()
{
    // TODO: perhaps add some 'dirty' tile support to enable things like animation or style changes
    if (this.initialized == false) {
        return false;
    }

    // Child class-specific rendering (e.g. GL draw calls)
    if (typeof(this._render) == 'function') {
        this._render.apply(this, arguments);
    }

    return true;
};

VectorRenderer.prototype.loadTile = function (coords, div, callback)
{
    if (coords.z > this.max_zoom) {
        var zgap = coords.z - this.max_zoom;
        var original_tile = [coords.x, coords.y, coords.z].join('/');
        coords.x = ~~(coords.x / Math.pow(2, zgap));
        coords.y = ~~(coords.y / Math.pow(2, zgap));
        coords.display_z = z; // z without overzoom
        coords.z -= zgap;
        console.log("adjusted for overzoom, tile " + original_tile + " -> " + [coords.x, coords.y, coords.z].join('/'));
    }

    var key = [coords.x, coords.y, coords.z].join('/');
    var tile_url = this.url_template.replace('{x}', coords.x).replace('{y}', coords.y).replace('{z}', coords.z);
    var req = new XMLHttpRequest();
    var renderer = this;

    // Already loading/loaded?
    if (this.tiles[key]) {
        if (this.tiles[key].loaded == true) {
            console.log("use loaded tile " + key + " from cache");
        }
        if (this.tiles[key].loading == true) {
            console.log("already loading tile " + key + ", skip");
        }

        if (callback) {
            callback(null, div);
        }
        return;
    }

    var tile = this.tiles[key] = {};
    tile.key = key;
    tile.coords = coords;
    tile.xhr = req;
    tile.debug = {};
    tile.debug.network = +new Date();
    tile.loading = true;
    tile.loaded = false;

    req.onload = function () {
        var tile = renderer.tiles[key]; // = {};
        if (tile == null) {
            return;
        }

        tile.layers = JSON.parse(req.response);
        tile.debug.network = +new Date() - tile.debug.network; // network/JSON parsing

        div.setAttribute('data-tile-key', tile.key); // tile info for debugging
        div.style.width = '256px';
        div.style.height = '256px';

        // var debug_overlay = document.createElement('div');
        // debug_overlay.textContent = tile.key;
        // debug_overlay.style.position = 'absolute';
        // debug_overlay.style.left = 0;
        // debug_overlay.style.top = 0;
        // debug_overlay.style.color = 'white';
        // div.appendChild(debug_overlay);

        // Extract desired layers from full GeoJSON response
        renderer.processLayersForTile(tile);

        // Mercator projection for geometry and bounds
        tile.min = Geo.metersForTile(tile.coords);
        tile.max = Geo.metersForTile({ x: tile.coords.x + 1, y: tile.coords.y + 1, z: tile.coords.z });
        renderer.projectTile(tile);

        // Re-scale from meters to local tile coords
        renderer.scaleTile(tile);

        tile.xhr = null;
        tile.loading = false;
        tile.loaded = true;

        // Render
        var timer = +new Date();
        renderer.addTile(tile, div);
        tile.debug.rendering = +new Date() - timer; // rendering/geometry prep

        delete tile.layers; // delete the source data in the tile to save memory

        renderer.printDebugForTile(tile);
        if (callback) {
            callback(null, div);
        }
    };
    // TODO: add XHR error handling
    req.open('GET', tile_url, true /* async flag */);
    req.send();
};

VectorRenderer.prototype.removeTile = function (key)
{
    console.log("tile unload for " + key);
    var tile = this.tiles[key];
    if (tile != null && tile.loading == true) {
        console.log("cancel tile load for " + key);
        tile.loaded = false;
        tile.xhr.abort();
        tile.xhr = null;
        tile.loading = false;
    }

    delete this.tiles[key];
};

// Processes the tile response to create layers as defined by this renderer
// Can include post-processing to partially filter or re-arrange data, e.g. only including POIs that have names
VectorRenderer.prototype.processLayersForTile = function (tile)
{
    var layers = {};
    for (var t=0; t < this.layers.length; t++) {
        this.layers[t].number = t;
        layers[this.layers[t].name] = this.layers[t].data(tile.layers) || { type: 'FeatureCollection', features: [] };
    }
    tile.layers = layers;
    return tile;
};

VectorRenderer.prototype.projectTile = function (tile)
{
    var timer = +new Date();
    for (var t in tile.layers) {
        var num_features = tile.layers[t].features.length;
        for (var f=0; f < num_features; f++) {
            var feature = tile.layers[t].features[f];
            feature.geometry.coordinates = Geo.transformGeometry(feature.geometry, function (coordinates) {
                var m = Geo.latLngToMeters(Point(coordinates[0], coordinates[1]));
                return [m.x, m.y];
            });
        };
    }
    tile.debug.projection = +new Date() - timer;
    return tile;
};

// Re-scale geometries within each tile to the range [0, scale]
// TODO: clip vertices at edges? right now vertices can have values outside [0, scale] (over or under bounds); this would pose a problem if we wanted to binary encode the vertices in fewer bits (e.g. 12 bits each for scale of 4096)
VectorRenderer.prototype.scaleTile = function (tile)
{
    for (var t in tile.layers) {
        var num_features = tile.layers[t].features.length;
        for (var f=0; f < num_features; f++) {
            var feature = tile.layers[t].features[f];
            feature.geometry.coordinates = Geo.transformGeometry(feature.geometry, function (coordinates) {
                coordinates[0] = (coordinates[0] - tile.min.x) * VectorRenderer.units_per_meter[tile.coords.z];
                coordinates[1] = (coordinates[1] - tile.min.y) * VectorRenderer.units_per_meter[tile.coords.z]; // TODO: this will create negative y-coords, force positive as below instead? or, if later storing positive coords in bit-packed values, flip to negative in post-processing?
                // coordinates[1] = (coordinates[1] - tile.max.y) * VectorRenderer.units_per_meter[tile.coords.z]; // alternate to force y-coords to be positive, subtract tile max instead of min
                return coordinates;
            });
        };
    }
    return tile;
};

// Determine final style properties (color, width, etc.)
VectorRenderer.prototype.style_defaults = {
    color: [1.0, 0, 0],
    width: 1,
    size: 1,
    extrude: false,
    height: 20,
    min_height: 0,
    outline: {
        // color: [1.0, 0, 0],
        // width: 1,
        // dash: null
    }
};

VectorRenderer.prototype.parseStyleForFeature = function (feature, layer, tile)
{
    var layer_style = this.styles[layer.name] || {};
    var style = {};

    style.color = (layer_style.color && (layer_style.color[feature.properties.kind] || layer_style.color.default)) || this.style_defaults.color;
    if (typeof style.color == 'function') {
        style.color = style.color(feature, tile);
    }

    style.width = (layer_style.width && (layer_style.width[feature.properties.kind] || layer_style.width.default)) || this.style_defaults.width;
    if (typeof style.width == 'function') {
        style.width = style.width(feature, tile);
    }

    style.size = (layer_style.size && (layer_style.size[feature.properties.kind] || layer_style.size.default)) || this.style_defaults.size;
    if (typeof style.size == 'function') {
        style.size = style.size(feature, tile);
    }

    style.extrude = (layer_style.extrude && (layer_style.extrude[feature.properties.kind] || layer_style.extrude.default)) || this.style_defaults.extrude;
    if (typeof style.extrude == 'function') {
        style.extrude = style.extrude(feature, tile); // returning a boolean will extrude with the feature's height, a number will override the feature height (see below)
    }

    style.height = (feature.properties && feature.properties.height) || this.style_defaults.height;
    style.min_height = (feature.properties && feature.properties.min_height) || this.style_defaults.min_height;

    // height defaults to feature height, but extrude style can dynamically adjust height by returning a number or array (instead of a boolean)
    if (style.extrude) {
        if (typeof style.extrude == 'number') {
            style.height = style.extrude;
        }
        else if (typeof style.extrude == 'object' && style.extrude.length >= 2) {
            style.min_height = style.extrude[0];
            style.height = style.extrude[1];
        }
    }

    style.outline = {};
    layer_style.outline = layer_style.outline || {};
    style.outline.color = (layer_style.outline.color && (layer_style.outline.color[feature.properties.kind] || layer_style.outline.color.default)) || this.style_defaults.outline.color;
    if (typeof style.outline.color == 'function') {
        style.outline.color = style.outline.color(feature, tile);
    }

    style.outline.width = (layer_style.outline.width && (layer_style.outline.width[feature.properties.kind] || layer_style.outline.width.default)) || this.style_defaults.outline.width;
    if (typeof style.outline.width == 'function') {
        style.outline.width = style.outline.width(feature, tile);
    }

    style.outline.dash = (layer_style.outline.dash && (layer_style.outline.dash[feature.properties.kind] || layer_style.outline.dash.default)) || this.style_defaults.outline.dash;
    if (typeof style.outline.dash == 'function') {
        style.outline.dash = style.outline.dash(feature, tile);
    }

    return style;
};

VectorRenderer.prototype.printDebugForTile = function (tile)
{
    console.log(
        "debug for " + tile.key + ': [ ' +
        Object.keys(tile.debug).map(function (t) { return t + ': ' + tile.debug[t]; }).join(', ') + ' ]'
    );
};

// Style helpers
var Style = {};

Style.color = {
    pseudoRandomGrayscale: function (f) { var c = Math.max((parseInt(f.id, 16) % 100) / 100, 0.4); return [0.7 * c, 0.7 * c, 0.7 * c]; }, // pseudo-random grayscale by geometry id
    pseudoRandomColor: function (f) { return [0.7 * (parseInt(f.id, 16) / 100 % 1), 0.7 * (parseInt(f.id, 16) / 10000 % 1), 0.7 * (parseInt(f.id, 16) / 1000000 % 1)]; }, // pseudo-random color by geometry id
    randomColor: function (f) { return [0.7 * Math.random(), 0.7 * Math.random(), 0.7 * Math.random()]; } // random color
};

Style.width = {
    pixels: function (p, t) { return p * VectorRenderer.units_per_pixel[t.coords.z]; }, // local tile units for a given pixel width
    meters: function (p, t) { return p * VectorRenderer.units_per_meter[t.coords.z]; }  // local tile units for a given meter width
};
