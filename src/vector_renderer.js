var Point = require('./point.js');
var Geo = require('./geo.js');
var Style = require('./style.js');
var ModeManager = require('./gl/gl_modes').ModeManager;
var Utils = require('./utils.js');

// Setup that happens on main thread only (skip in web worker)
var yaml;
Utils.runIfInMainThread(function() {
    try {
        yaml = require('js-yaml');
    }
    catch (e) {
        console.log("no YAML support, js-yaml module not found");
    }

    findBaseLibraryURL();
});

// Global setup
VectorRenderer.tile_scale = 4096; // coordinates are locally scaled to the range [0, tile_scale]
Geo.setTileScale(VectorRenderer.tile_scale);

// Layers & styles: pass an object directly, or a URL as string to load remotely
function VectorRenderer (type, tile_source, layers, styles, options)
{
    var options = options || {};
    this.type = type;
    this.tile_source = tile_source;
    this.tiles = {};
    this.num_workers = options.num_workers || 1;

    if (typeof(layers) == 'string') {
        this.layer_source = Utils.urlForPath(layers);
        this.layers = VectorRenderer.loadLayers(this.layer_source);
    }
    else {
        this.layers = layers;
    }
    this.layers_serialized = Utils.serializeWithFunctions(this.layers);

    if (typeof(styles) == 'string') {
        this.style_source = Utils.urlForPath(styles);
        this.styles = VectorRenderer.loadStyles(this.style_source);
    }
    else {
        this.styles = styles;
    }
    this.styles_serialized = Utils.serializeWithFunctions(this.styles);

    this.dirty = true; // request a redraw
    this.animated = false; // request redraw every frame
    this.initialized = false;

    this.modes = VectorRenderer.createModes({}, this.styles);
    this.updateActiveModes();
    this.createWorkers();

    this.zoom = null;
    this.center = null;
    this.device_pixel_ratio = window.devicePixelRatio || 1;

    this.zooming = false;
    this.panning = false;

    this.resetTime();
}

VectorRenderer.create = function (type, tile_source, layers, styles, options)
{
    return new VectorRenderer[type](tile_source, layers, styles, options);
};

VectorRenderer.prototype.init = function ()
{
    // Child class-specific initialization (e.g. GL context creation)
    if (typeof(this._init) == 'function') {
        this._init.apply(this, arguments);
    }

    var renderer = this;
    this.workers.forEach(function(worker) {
        worker.addEventListener('message', renderer.workerBuildTileCompleted.bind(renderer));
    });

    this.initialized = true;
};

// Web workers handle heavy duty geometry processing
VectorRenderer.prototype.createWorkers = function ()
{
    var renderer = this;
    var url = VectorRenderer.library_base_url + 'vector-map-worker.min.js' + '?' + (+new Date());

    // To allow workers to be loaded cross-domain, first load worker source via XHR, then create a local URL via a blob
    var req = new XMLHttpRequest();
    req.onload = function () {
        var worker_local_url = window.URL.createObjectURL(new Blob([req.response], { type: 'application/javascript' }));

        renderer.workers = [];
        for (var w=0; w < renderer.num_workers; w++) {
            renderer.workers.push(new Worker(worker_local_url));
            renderer.workers[w].postMessage({
                type: 'init',
                id: w
            })
        }
    };
    req.open('GET', url, false /* async flag */);
    req.send();

    // Alternate for debugging - tradtional method of loading from remote URL instead of XHR-to-local-blob
    // renderer.workers = [];
    // for (var w=0; w < renderer.num_workers; w++) {
    //     renderer.workers.push(new Worker(url));
    // }

    this.next_worker = 0;
};

// Post a message about a tile to the next worker (round robbin)
VectorRenderer.prototype.workerPostMessageForTile = function (tile, message)
{
    if (tile.worker == null) {
        tile.worker = this.next_worker;
        this.next_worker = (tile.worker + 1) % this.workers.length;
    }
    this.workers[tile.worker].postMessage(message);
};

VectorRenderer.prototype.setCenter = function (lng, lat)
{
    this.center = { lng: lng, lat: lat };
    this.dirty = true;
};

VectorRenderer.prototype.setZoom = function (zoom)
{
    // console.log("setZoom " + zoom);
    this.last_zoom = this.zoom;
    this.zoom = zoom;
    this.capped_zoom = Math.min(~~this.zoom, this.tile_source.max_zoom || ~~this.zoom);
    this.zooming = false;
    this.dirty = true;
};

VectorRenderer.prototype.startZoom = function ()
{
    this.last_zoom = this.zoom;
    this.zooming = true;
};

VectorRenderer.prototype.setBounds = function (sw, ne)
{
    this.bounds = {
        sw: { lng: sw.lng, lat: sw.lat },
        ne: { lng: ne.lng, lat: ne.lat }
    };

    var buffer = 200 * Geo.meters_per_pixel[~~this.zoom]; // pixels -> meters
    this.buffered_meter_bounds = {
        sw: Geo.latLngToMeters(Point(this.bounds.sw.lng, this.bounds.sw.lat)),
        ne: Geo.latLngToMeters(Point(this.bounds.ne.lng, this.bounds.ne.lat))
    };
    this.buffered_meter_bounds.sw.x -= buffer;
    this.buffered_meter_bounds.sw.y -= buffer;
    this.buffered_meter_bounds.ne.x += buffer;
    this.buffered_meter_bounds.ne.y += buffer;

    this.center_meters = Point(
        (this.buffered_meter_bounds.sw.x + this.buffered_meter_bounds.ne.x) / 2,
        (this.buffered_meter_bounds.sw.y + this.buffered_meter_bounds.ne.y) / 2
    );

    // console.log("set renderer bounds to " + JSON.stringify(this.bounds));

    // Mark tiles as visible/invisible
    for (var t in this.tiles) {
        this.updateVisibilityForTile(this.tiles[t]);
    }

    this.dirty = true;
};

VectorRenderer.prototype.isTileInZoom = function (tile)
{
    return (Math.min(tile.coords.z, this.tile_source.max_zoom || tile.coords.z) == this.capped_zoom);
};

// Update visibility and return true if changed
VectorRenderer.prototype.updateVisibilityForTile = function (tile)
{
    var visible = tile.visible;
    tile.visible = this.isTileInZoom(tile) && Geo.boxIntersect(tile.bounds, this.buffered_meter_bounds);
    tile.center_dist = Math.abs(this.center_meters.x - tile.min.x) + Math.abs(this.center_meters.y - tile.min.y);
    return (visible != tile.visible);
};

VectorRenderer.prototype.resizeMap = function (width, height)
{
    this.dirty = true;
};

VectorRenderer.prototype.requestRedraw = function ()
{
    this.dirty = true;
};

VectorRenderer.prototype.render = function ()
{
    // Render on demand
    if (this.dirty == false || this.initialized == false) {
        return false;
    }
    this.dirty = false; // subclasses can set this back to true when animation is needed

    // Child class-specific rendering (e.g. GL draw calls)
    if (typeof(this._render) == 'function') {
        this._render.apply(this, arguments);
    }

    // Redraw every frame if animating
    if (this.animated == true) {
        this.dirty = true;
    }

    // console.log("render map");
    return true;
};

// Load a single tile
VectorRenderer.prototype.loadTile = function (coords, div, callback)
{
    // Overzoom?
    if (coords.z > this.tile_source.max_zoom) {
        var zgap = coords.z - this.tile_source.max_zoom;
        // var original_tile = [coords.x, coords.y, coords.z].join('/');
        coords.x = ~~(coords.x / Math.pow(2, zgap));
        coords.y = ~~(coords.y / Math.pow(2, zgap));
        coords.display_z = coords.z; // z without overzoom
        coords.z -= zgap;
        // console.log("adjusted for overzoom, tile " + original_tile + " -> " + [coords.x, coords.y, coords.z].join('/'));
    }

    this.trackTileSetLoadStart();

    var key = [coords.x, coords.y, coords.z].join('/');

    // Already loading/loaded?
    if (this.tiles[key]) {
        // if (this.tiles[key].loaded == true) {
        //     console.log("use loaded tile " + key + " from cache");
        // }
        // if (this.tiles[key].loading == true) {
        //     console.log("already loading tile " + key + ", skip");
        // }

        if (callback) {
            callback(null, div);
        }
        return;
    }

    var tile = this.tiles[key] = {};
    tile.key = key;
    tile.coords = coords;
    tile.min = Geo.metersForTile(tile.coords);
    tile.max = Geo.metersForTile({ x: tile.coords.x + 1, y: tile.coords.y + 1, z: tile.coords.z });
    tile.bounds = { sw: { x: tile.min.x, y: tile.max.y }, ne: { x: tile.max.x, y: tile.min.y } };
    tile.debug = {};
    tile.loading = true;
    tile.loaded = false;

    this.buildTile(tile.key);
    this.updateTileElement(tile, div);
    this.updateVisibilityForTile(tile);

    if (callback) {
        callback(null, div);
    }
};

// Rebuild all tiles
// TODO: also rebuild modes? (detect if changed)
VectorRenderer.prototype.rebuildTiles = function ()
{
    // Update layers & styles
    this.layers_serialized = Utils.serializeWithFunctions(this.layers);
    this.styles_serialized = Utils.serializeWithFunctions(this.styles);

    // Tell workers we're about to rebuild (so they can refresh styles, etc.)
    this.workers.forEach(function(worker) {
        worker.postMessage({
            type: 'prepareForRebuild',
            layers: this.layers_serialized,
            styles: this.styles_serialized
        });
    }.bind(this));

    // Rebuild visible tiles first, from center out
    // console.log("find visible");
    var visible = [], invisible = [];
    for (var t in this.tiles) {
        if (this.tiles[t].visible == true) {
            visible.push(t);
        }
        else {
            invisible.push(t);
        }
    }

    // console.log("sort visible distance");
    visible.sort(function(a, b) {
        // var ad = Math.abs(this.center_meters.x - this.tiles[b].min.x) + Math.abs(this.center_meters.y - this.tiles[b].min.y);
        // var bd = Math.abs(this.center_meters.x - this.tiles[a].min.x) + Math.abs(this.center_meters.y - this.tiles[a].min.y);
        var ad = this.tiles[a].center_dist;
        var bd = this.tiles[b].center_dist;
        return (bd > ad ? -1 : (bd == ad ? 0 : 1));
    }.bind(this));

    // console.log("build visible");
    for (var t in visible) {
        this.buildTile(visible[t]);
    }

    // console.log("build invisible");
    for (var t in invisible) {
        // Keep tiles in current zoom but out of visible range, but rebuild as lower priority
        if (this.isTileInZoom(this.tiles[invisible[t]]) == true) {
            this.buildTile(invisible[t]);
        }
        // Drop tiles outside current zoom
        else {
            this.removeTile(invisible[t]);
        }
    }

    this.updateActiveModes();
    this.resetTime();
};

VectorRenderer.prototype.buildTile = function(key)
{
    var tile = this.tiles[key];

    this.workerPostMessageForTile(tile, {
        type: 'buildTile',
        tile: {
            key: tile.key,
            coords: tile.coords, // used by style helpers
            min: tile.min, // used by TileSource to scale tile to local extents
            max: tile.max, // used by TileSource to scale tile to local extents
            debug: tile.debug
        },
        renderer_type: this.type,
        tile_source: this.tile_source,
        layers: this.layers_serialized,
        styles: this.styles_serialized//,
        // mode_states: VectorRenderer.getModeStates(this.modes)
    });
    // console.log(this.modes);
    // console.log(JSON.stringify(VectorRenderer.getModeStates(this.modes)));
};

// Called on main thread when a web worker completes processing for a single tile (initial load, or rebuild)
VectorRenderer.prototype.workerBuildTileCompleted = function (event)
{
    if (event.data.type != 'buildTileCompleted') {
        return;
    }

    var tile = event.data.tile;

    // Sync modes
    // VectorRenderer.refreshModeStates(this.modes, event.data.mode_states);
    // console.log(JSON.stringify(VectorRenderer.getModeStates(this.modes)));

    // Removed this tile during load?
    if (this.tiles[tile.key] == null) {
        console.log("discarded tile " + tile.key + " in VectorRenderer.tileWorkerCompleted because previously removed");
        return;
    }

    // Update tile with properties from worker
    tile = this.mergeTile(tile.key, tile);

    // Child class-specific tile processing
    if (typeof(this._tileWorkerCompleted) == 'function') {
        this._tileWorkerCompleted(tile);
    }

    // NOTE: was previously deleting source data to save memory, but now need to save for re-building geometry
    // delete tile.layers;

    this.dirty = true;
    this.trackTileSetLoadEnd();
    this.printDebugForTile(tile);
};

VectorRenderer.prototype.removeTile = function (key)
{
    console.log("tile unload for " + key);
    var tile = this.tiles[key];
    if (tile != null) {
        // Web worker will cancel XHR requests
        this.workerPostMessageForTile(tile, {
            type: 'removeTile',
            key: tile.key
        });
    }

    delete this.tiles[key];
    this.dirty = true;
};

// Attaches tracking and debug into to the provided tile DOM element
VectorRenderer.prototype.updateTileElement = function (tile, div)
{
    // Debug info
    div.setAttribute('data-tile-key', tile.key);
    div.style.width = '256px';
    div.style.height = '256px';

    if (this.debug) {
        var debug_overlay = document.createElement('div');
        debug_overlay.textContent = tile.key;
        debug_overlay.style.position = 'absolute';
        debug_overlay.style.left = 0;
        debug_overlay.style.top = 0;
        debug_overlay.style.color = 'white';
        debug_overlay.style.fontSize = '16px';
        // debug_overlay.style.textOutline = '1px #000000';
        div.appendChild(debug_overlay);

        div.style.borderStyle = 'solid';
        div.style.borderColor = 'white';
        div.style.borderWidth = '1px';
    }
};

// Merge properties from a provided tile object into the main tile store. Shallow merge (just copies top-level properties)!
// Used for selectively updating properties of tiles passed between main thread and worker
// (so we don't have to pass the whole tile, including some properties which cannot be cloned for a worker).
VectorRenderer.prototype.mergeTile = function (key, source_tile)
{
    var tile = this.tiles[key];

    if (tile == null) {
        this.tiles[key] = source_tile;
        return this.tiles[key];
    }

    for (var p in source_tile) {
        // console.log("merging " + p + ": " + source_tile[p]);
        tile[p] = source_tile[p];
    }

    return tile;
};

// Reload layers and styles (only if they were originally loaded by URL). Mostly useful for testing.
VectorRenderer.prototype.reloadConfig = function ()
{
    if (this.layer_source != null) {
        this.layers = VectorRenderer.loadLayers(this.layer_source);
        this.layers_serialized = Utils.serializeWithFunctions(this.layers);
    }

    if (this.style_source != null) {
        this.styles = VectorRenderer.loadStyles(this.style_source);
        this.styles_serialized = Utils.serializeWithFunctions(this.styles);
    }

    if (this.layer_source != null || this.style_source != null) {
        this.rebuildTiles();
    }
};

// Called (currently manually) after modes are updated in stylesheet
VectorRenderer.prototype.refreshModes = function ()
{
    this.modes = VectorRenderer.refreshModes(this.modes, this.styles);
};

VectorRenderer.prototype.updateActiveModes = function ()
{
    // Make a set of currently active modes (used in a layer)
    this.active_modes = {};
    var animated = false; // is any active mode animated?
    for (var l in this.styles.layers) {
        var mode = this.styles.layers[l].mode.name;
        if (this.styles.layers[l].visible !== false) {
            this.active_modes[mode] = true;

            // Check if this mode is animated
            if (animated == false && this.modes[mode].animated == true) {
                animated = true;
            }
        }
    }
    this.animated = animated;
};

// Reset internal clock, mostly useful for consistent experience when changing modes/debugging
VectorRenderer.prototype.resetTime = function ()
{
    this.start_time = +new Date();
};

// Profiling methods used to track when sets of tiles start/stop loading together
// e.g. initial page load is one set of tiles, new sets of tile loads are then initiated by a map pan or zoom
VectorRenderer.prototype.trackTileSetLoadStart = function ()
{
    // Start tracking new tile set if no other tiles already loading
    if (this.tile_set_loading == null) {
        this.tile_set_loading = +new Date();
        console.log("tile set load START");
    }
};

VectorRenderer.prototype.trackTileSetLoadEnd = function ()
{
    // No more tiles actively loading?
    if (this.tile_set_loading != null) {
        var end_tile_set = true;
        for (var t in this.tiles) {
            if (this.tiles[t].loading == true) {
                end_tile_set = false;
                break;
            }
        }

        if (end_tile_set == true) {
            this.last_tile_set_load = (+new Date()) - this.tile_set_loading;
            this.tile_set_loading = null;
            console.log("tile set load FINISHED in: " + this.last_tile_set_load);
        }
    }
};

VectorRenderer.prototype.printDebugForTile = function (tile)
{
    console.log(
        "debug for " + tile.key + ': [ ' +
        Object.keys(tile.debug).map(function (t) { return t + ': ' + tile.debug[t]; }).join(', ') + ' ]'
    );
};


/*** Class methods (stateless) ***/

VectorRenderer.loadLayers = function (url)
{
    var layers;
    var req = new XMLHttpRequest();
    req.onload = function () { eval('layers = ' + req.response); }; // TODO: security!
    req.open('GET', url + '?' + (+new Date()), false /* async flag */);
    req.send();
    return layers;
};

VectorRenderer.loadStyles = function (url)
{
    var styles;
    var req = new XMLHttpRequest();
    req.onload = function () { styles = req.response; }
    req.open('GET', url + '?' + (+new Date()), false /* async flag */);
    req.send();

    // Try JSON first, then YAML (if available)
    try {
        eval('styles = ' + req.response);
    }
    catch (e) {
        try {
            styles = yaml.safeLoad(req.response);
        }
        catch (e) {
            console.log("failed to parse styles!");
            styles = null;
        }
    }

    // Find generic functions & style macros
    Utils.stringsToFunctions(styles);
    Style.expandMacros(styles);

    // Post-process styles
    for (var m in styles.layers) {
        if (styles.layers[m].visible !== false) {
            styles.layers[m].visible = true;
        }

        if ((styles.layers[m].mode && styles.layers[m].mode.name) == null) {
            styles.layers[m].mode = {};
            for (var p in Style.defaults.mode) {
                styles.layers[m].mode[p] = Style.defaults.mode[p];
            }
        }
    }

    return styles;
};

// Processes the tile response to create layers as defined by this renderer
// Can include post-processing to partially filter or re-arrange data, e.g. only including POIs that have names
VectorRenderer.processLayersForTile = function (layers, tile)
{
    var tile_layers = {};
    for (var t=0; t < layers.length; t++) {
        layers[t].number = t;

        if (layers[t] != null) {
            // Just pass through data untouched if no data transform function defined
            if (layers[t].data == null) {
                tile_layers[layers[t].name] = tile.layers[layers[t].name];
            }
            // Pass through data but with different layer name in tile source data
            else if (typeof layers[t].data == 'string') {
                tile_layers[layers[t].name] = tile.layers[layers[t].data];
            }
            // Apply the transform function for post-processing
            else if (typeof layers[t].data == 'function') {
                tile_layers[layers[t].name] = layers[t].data(tile.layers);
            }
        }

        // Handle cases where no data was found in tile or returned by post-processor
        tile_layers[layers[t].name] = tile_layers[layers[t].name] || { type: 'FeatureCollection', features: [] };
    }
    tile.layers = tile_layers;
    return tile_layers;
};

// Called once on instantiation
VectorRenderer.createModes = function (modes, styles)
{
    // Built-in modes
    var built_ins = require('./gl/gl_modes').Modes; // TODO: make this non-GL specific
    for (var m in built_ins) {
        modes[m] = built_ins[m];
    }

    // Stylesheet modes
    for (var m in styles.modes) {
        // if (m != 'all') {
            modes[m] = ModeManager.configureMode(m, styles.modes[m]);
        // }
    }

    return modes;
};

VectorRenderer.refreshModes = function (modes, styles)
{
    // Copy stylesheet modes
    // TODO: is this the best way to copy stylesheet changes to mode instances?
    for (var m in styles.modes) {
        // if (m != 'all') {
            ModeManager.configureMode(m, styles.modes[m]);
        // }
    }

    // Refresh all modes
    for (m in modes) {
        modes[m].refresh();
    }

    return modes;
};

// Used for passing mode state information between main thread and worker (since entire object can't be exchanged due to cloning restrictions)
// VectorRenderer.getModeStates = function (modes)
// {
//     var mode_states = {};
//     for (var m in modes) {
//         mode_states[m] = modes[m].state;
//     }
//     return mode_states;
// };

// VectorRenderer.refreshModeStates = function (modes, mode_states)
// {
//     for (var m in mode_states) {
//         if (modes[m] != null) {
//             modes[m].updateState(mode_states[m]);
//         }
//     }
// }

// Private/internal

// Get base URL from which the library was loaded
// Used to load additional resources like shaders, textures, etc. in cases where library was loaded from a relative path
function findBaseLibraryURL ()
{
    VectorRenderer.library_base_url = '';
    var scripts = document.getElementsByTagName('script'); // document.querySelectorAll('script[src*=".js"]');
    for (var s=0; s < scripts.length; s++) {
        var match = scripts[s].src.indexOf('vector-map.debug.js');
        if (match == -1) {
            match = scripts[s].src.indexOf('vector-map.min.js');
        }
        if (match >= 0) {
            VectorRenderer.library_base_url = scripts[s].src.substr(0, match);
            break;
        }
    }
};

if (module !== undefined) {
    module.exports = VectorRenderer;
}
