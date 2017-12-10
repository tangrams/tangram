import Tile from './tile';
import TilePyramid from './tile_pyramid';
import Geo from './geo';
import mainThreadLabelCollisionPass from './labels/main_pass';
import log from './utils/log';
import WorkerBroker from './utils/worker_broker';
import Task from './utils/task';

export default class TileManager {

    constructor({ scene, view }) {
        this.scene = scene;
        this.view = view;
        this.tiles = {};
        this.pyramid = new TilePyramid();
        this.visible_coords = {};
        this.queued_coords = [];
        this.building_tiles = null;
        this.renderable_tiles = [];
        this.collision = { tiles: [], mesh_counts: [], zoom: null, zoom_steps: 3 };
        this.active_styles = [];

        // Provide a hook for this object to be called from worker threads
        this.main_thread_target = ['TileManager', this.scene.id].join('_');
        WorkerBroker.addTarget(this.main_thread_target, this);
    }

    destroy() {
        this.forEachTile(tile => tile.destroy());
        this.tiles = {};
        this.pyramid = null;
        this.visible_coords = {};
        this.queued_coords = [];
        this.scene = null;
        this.view = null;
    }

    keepTile(tile) {
        this.tiles[tile.key] = tile;
        this.pyramid.addTile(tile);
    }

    hasTile(key) {
        return this.tiles[key] !== undefined;
    }

    forgetTile(key) {
        if (this.hasTile(key)) {
            let tile = this.tiles[key];
            this.pyramid.removeTile(tile);
        }

        delete this.tiles[key];
        this.tileBuildStop(key);
    }

    // Remove a single tile
    removeTile(key) {
        log('trace', `tile unload for ${key}`);

        var tile = this.tiles[key];

        if (tile != null) {
            tile.destroy();
        }

        this.forgetTile(tile.key);
        this.scene.requestRedraw();
    }

    // Run a function on each tile
    forEachTile(func) {
        for (let t in this.tiles) {
            func(this.tiles[t]);
        }
    }

    // Remove tiles that pass a filter condition
    removeTiles(filter) {
        let remove_tiles = [];
        for (let t in this.tiles) {
            let tile = this.tiles[t];
            if (filter(tile)) {
                remove_tiles.push(t);
            }
        }
        for (let r=0; r < remove_tiles.length; r++) {
            let key = remove_tiles[r];
            this.removeTile(key);
        }
    }

    updateTilesForView() {
        // Find visible tiles and load new ones
        this.visible_coords = {};
        let tile_coords = this.view.findVisibleTileCoordinates();
        for (let c=0; c < tile_coords.length; c++) {
            const coords = tile_coords[c];
            this.queueCoordinate(coords);
            this.visible_coords[coords.key] = coords;
        }

        this.updateTileStates();
    }

    updateTileStates () {
        this.forEachTile(tile => {
            this.updateVisibility(tile);
        });

        this.loadQueuedCoordinates();
        this.updateProxyTiles();
        this.view.pruneTilesForView();
        this.updateRenderableTiles();
        this.updateActiveStyles();
        this.updateLabels();
    }

    updateLabels ({ force = false, show = false } = {}) {
        if (!force && (this.isLoadingVisibleTiles() || this.scene.building)) {
            log('debug', `*** SKIP label layout due to loading (loading visible ${this.isLoadingVisibleTiles()}, building ${this.scene.building != null})`);
            return Promise.resolve({});
        }

        // const tiles = this.renderable_tiles.filter(t => t.style_zoom === this.view.tile_zoom);
        const tiles = this.renderable_tiles.filter(t => t.valid);//.filter(t => !t.isProxy());
        if (!force &&
            roundPrecision(this.view.zoom, this.collision.zoom_steps) === this.collision.zoom &&
            tiles.every(t => {
                let i = this.collision.tiles.indexOf(t);
                return i > -1 && this.collision.mesh_counts[i] === Object.keys(t.meshes).length;
            })) {
            log('debug', `*** SKIP label layout due to same tile/meshes (zoom ${this.view.zoom.toFixed(2)}, tiles ${JSON.stringify(this.collision.tiles.map(t => t.key))}, mesh counts ${JSON.stringify(this.collision.mesh_counts)})`);
            return Promise.resolve({});
        }

        if (!this.collision.task || force) {
            this.collision.tiles = tiles;
            this.collision.mesh_counts = tiles.map(t => Object.keys(t.meshes).length);
            this.collision.zoom = roundPrecision(this.view.zoom, this.collision.zoom_steps);
            log('debug', `*** update label collisions (zoom ${this.collision.zoom}, force ${force}, ${JSON.stringify(this.collision.tiles.map(t => t.key))}, mesh counts ${JSON.stringify(this.collision.mesh_counts)})`);

            this.collision.task = {
                type: 'tileManagerUpdateLabels',
                run: (task) => {
                    return mainThreadLabelCollisionPass(this.collision.tiles, this.collision.zoom, { show: task.show }).then(results => {
                        this.scene.requestRedraw();
                        this.collision.task = null;
                        Task.finish(task, results);
                    });
                },
                user_moving_view: false, // don't run task when user is moving view
                show
            };
            Task.add(this.collision.task);
        }
        else {
            log('debug', `*** SKIP label layout due to on-going layout (zoom ${this.view.zoom.toFixed(2)}, tiles ${JSON.stringify(this.collision.tiles.map(t => t.key))}, mesh counts ${JSON.stringify(this.collision.mesh_counts)})`);
        }
        return this.collision.task.promise;
    }

    updateProxyTiles () {
        if (this.view.zoom_direction === 0) {
            return;
        }

        // Clear previous proxies
        this.forEachTile(tile => tile.setProxyFor(null));

        let proxy = false;
        this.forEachTile(tile => {
            if (this.view.zoom_direction === 1) {
                if (tile.visible && !tile.built) {
                    const parent = this.pyramid.getAncestor(tile);
                    if (parent) {
                        parent.setProxyFor(tile);
                        proxy = true;
                    }
                }
            }
            else if (this.view.zoom_direction === -1) {
                if (tile.visible && !tile.built) {
                    const descendants = this.pyramid.getDescendants(tile);
                    for (let i=0; i < descendants.length; i++) {
                        descendants[i].setProxyFor(tile);
                        proxy = true;
                    }
                }
            }
        });

        if (!proxy) {
            this.view.zoom_direction = 0;
        }
    }

    updateVisibility(tile) {
        tile.visible = false;
        if (tile.style_zoom === this.view.tile_zoom) {
            if (this.visible_coords[tile.coords.key]) {
                tile.visible = true;
            }
            else {
                // brute force
                for (let key in this.visible_coords) {
                    if (Tile.isDescendant(tile.coords, this.visible_coords[key])) {
                        tile.visible = true;
                        break;
                    }
                }
            }
        }
    }

    // Remove tiles that aren't visible, and flag remaining visible ones to be updated (for loading, proxy, etc.)
    pruneToVisibleTiles () {
        this.removeTiles(tile => !tile.visible);
    }

    getRenderableTiles () {
        return this.renderable_tiles;
    }

    updateRenderableTiles() {
        this.renderable_tiles = [];
        for (let t in this.tiles) {
            let tile = this.tiles[t];
            if (tile.visible && tile.loaded) {
                this.renderable_tiles.push(tile);
            }
        }
        return this.renderable_tiles;
    }

    // Assign tile to worker thread based on coordinates and data source
    getWorkerForTile(coords, source) {
        let worker;

        if (source.tiled) {
            // Pin tile to a worker thread based on its coordinates
            worker = this.scene.workers[Math.abs(coords.x + coords.y + coords.z) % this.scene.workers.length];
        }
        else {
            // Pin all tiles from each non-tiled source to a single worker
            // Prevents data for these sources from being loaded more than once
            worker = this.scene.workers[source.id % this.scene.workers.length];
        }

        return worker;
    }

    getActiveStyles () {
        return this.active_styles;
    }

    updateActiveStyles () {
        let tiles = this.renderable_tiles;
        let active = {};
        for (let t=0; t < tiles.length; t++) {
            let tile = tiles[t];
            Object.keys(tile.meshes).forEach(s => active[s] = true);
        }
        this.active_styles = Object.keys(active);
        return this.active_styles;
    }

    isLoadingVisibleTiles() {
        return Object.keys(this.tiles).some(k => this.tiles[k].visible && !this.tiles[k].built);
    }

    // Queue a tile for load
    queueCoordinate(coords) {
        this.queued_coords[this.queued_coords.length] = coords;
    }

    // Load all queued tiles
    loadQueuedCoordinates() {
        if (this.queued_coords.length === 0) {
            return;
        }

        // Sort queued tiles from center tile
        this.queued_coords.sort((a, b) => {
            let center = this.view.center.meters;
            let half_span = Geo.metersPerTile(a.z) / 2;

            let ac = Geo.metersForTile(a);
            ac.x += half_span;
            ac.y -= half_span;

            let bc = Geo.metersForTile(b);
            bc.x += half_span;
            bc.y -= half_span;

            let ad = Math.abs(center.x - ac.x) + Math.abs(center.y - ac.y);
            let bd = Math.abs(center.x - bc.x) + Math.abs(center.y - bc.y);

            a.center_dist = ad;
            b.center_dist = bd;

            return (bd > ad ? -1 : (bd === ad ? 0 : 1));
        });
        this.queued_coords.forEach(coords => this.loadCoordinate(coords));
        this.queued_coords = [];
    }

    // Load all tiles to cover a given logical tile coordinate
    loadCoordinate(coords) {
        // Skip if not at current scene zoom
        if (coords.z !== this.view.center.tile.z) {
            return;
        }

        // Determine necessary tiles for each source
        for (let s in this.scene.sources) {
            let source = this.scene.sources[s];
            // Check if data source should build this tile
            if (!source.builds_geometry_tiles || !source.includesTile(coords, this.view.tile_zoom)) {
                continue;
            }

            let key = Tile.normalizedKey(coords, source, this.view.tile_zoom);
            if (key && !this.hasTile(key)) {
                log('trace', `load tile ${key}, distance from view center: ${coords.center_dist}`);
                let tile = new Tile({
                    source,
                    coords,
                    worker: this.getWorkerForTile(coords, source),
                    style_zoom: this.view.baseZoom(coords.z),
                    view: this.view
                });

                this.keepTile(tile);
                this.buildTile(tile);
            }
        }
    }

    // Start tile build process
    buildTile(tile, options) {
        this.tileBuildStart(tile.key);
        this.updateVisibility(tile);
        tile.build(this.scene.generation, options);
    }

    // Called on main thread when a web worker completes processing for a single tile (initial load, or rebuild)
    buildTileStylesCompleted({ tile, progress }) {
        // Removed this tile during load?
        if (this.tiles[tile.key] == null) {
            log('trace', `discarded tile ${tile.key} in TileManager.buildTileStylesCompleted because previously removed`);
            Tile.abortBuild(tile);
            this.updateTileStates();
        }
        // Built with an outdated scene configuration?
        else if (tile.generation !== this.scene.generation) {
            log('debug', `discarded tile ${tile.key} in TileManager.buildTileStylesCompleted because built with ` +
                `scene config gen ${tile.generation}, current ${this.scene.generation}`);
            Tile.abortBuild(tile);
            this.updateTileStates();
        }
        else {
            // Update tile with properties from worker
            if (this.tiles[tile.key]) {
                // Ignore if from a previously discarded tile
                if (tile.id < this.tiles[tile.key].id) {
                    log('trace', `discarded tile ${tile.key} for id ${tile.id} in TileManager.buildTileStylesCompleted because built for discarded tile id`);
                    Tile.abortBuild(tile);
                    return;
                }

                tile = this.tiles[tile.key].merge(tile);
            }

            if (progress.done) {
                tile.built = true;
            }

            tile.buildMeshes(this.scene.styles, progress);
            this.updateTileStates();
            this.scene.requestRedraw();
        }

        if (progress.done) {
            this.tileBuildStop(tile.key);
        }
    }

    // Called on main thread when web worker encounters an error building a tile
    buildTileError(tile) {
        log('error', `Error building tile ${tile.key}:`, tile.error);
        this.forgetTile(tile.key);
        Tile.abortBuild(tile);
    }

    // Track tile build state
    tileBuildStart(key) {
        this.building_tiles = this.building_tiles || {};
        this.building_tiles[key] = true;
        log('trace', `tileBuildStart for ${key}: ${Object.keys(this.building_tiles).length}`);
    }

    tileBuildStop(key) {
        // Done building?
        if (this.building_tiles) {
            log('trace', `tileBuildStop for ${key}: ${Object.keys(this.building_tiles).length}`);
            delete this.building_tiles[key];
            this.checkBuildQueue();
        }
    }

    // Check status of tile building queue and notify scene when we're done
    checkBuildQueue() {
        if (!this.building_tiles || Object.keys(this.building_tiles).length === 0) {
            this.building_tiles = null;
            this.scene.tileManagerBuildDone();
        }
    }

    // Get a debug property across tiles
    getDebugProp(prop, filter) {
        var vals = [];
        for (var t in this.tiles) {
            if (this.tiles[t].debug[prop] != null && (typeof filter !== 'function' || filter(this.tiles[t]) === true)) {
                vals.push(this.tiles[t].debug[prop]);
            }
        }
        return vals;
    }

    // Sum of a debug property across tiles
    getDebugSum(prop, filter) {
        var sum = 0;
        for (var t in this.tiles) {
            if (this.tiles[t].debug[prop] != null && (typeof filter !== 'function' || filter(this.tiles[t]) === true)) {
                sum += this.tiles[t].debug[prop];
            }
        }
        return sum;
    }

    // Average of a debug property across tiles
    getDebugAverage(prop, filter) {
        return this.getDebugSum(prop, filter) / Object.keys(this.tiles).length;
    }

}

// Round a number to given number of decimal divisions
// e.g. roundPrecision(x, 4) rounds a number to increments of 0.25
function roundPrecision (x, d) {
    return Math.floor(x * d) / d;
}
