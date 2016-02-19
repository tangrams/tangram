import Tile from './tile';
import TilePyramid from './tile_pyramid';
import Utils from './utils/utils';

import log from 'loglevel';

const TileManager = {

    init({ scene, view }) {
        this.scene = scene;
        this.view = view;
        this.tiles = {};
        this.pyramid = TilePyramid;
        this.pyramid.reset();
        this.visible_coords = {};
        this.queued_coords = [];
        this.building_tiles = null;
        this.reset_visible_tiles = true;
    },

    destroy() {
        this.forEachTile(tile => tile.destroy());
        this.tiles = {};
        this.pyramid.reset();
        this.visible_coords = {};
        this.queued_coords = [];
        this.scene = null;
        this.view = null;
    },

    keepTile(tile) {
        this.tiles[tile.key] = tile;
        this.pyramid.addTile(tile);
    },

    hasTile(key) {
        return this.tiles[key] !== undefined;
    },

    forgetTile(key) {
        if (this.hasTile(key)) {
            let tile = this.tiles[key];
            this.pyramid.removeTile(tile);
        }

        delete this.tiles[key];
        this.tileBuildStop(key);
    },

    // Remove a single tile
    removeTile(key) {
        log.trace(`tile unload for ${key}`);

        var tile = this.tiles[key];

        if (tile != null) {
            tile.destroy();
        }

        this.forgetTile(tile.key);
        this.scene.requestRedraw();
    },

    // Run a function on each tile
    forEachTile(func) {
        for (let t in this.tiles) {
            func(this.tiles[t]);
        }
    },

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
    },

    updateTilesForView() {
        // Find visible tiles and load new ones
        let prev_coords = Object.keys(this.visible_coords);
        this.visible_coords = {};
        let tile_coords = this.view.findVisibleTileCoordinates();
        for (let coords of tile_coords) {
            this.queueCoordinate(coords);
            this.visible_coords[coords.key] = coords;
        }

        // Check if visible coords changed
        // TODO: move to a new view manager object
        let new_coords = Object.keys(this.visible_coords);
        let coords_changed = false;
        if (prev_coords.length !== new_coords.length) {
            coords_changed = true;
        }
        else {
            prev_coords.sort();
            new_coords.sort();
            if (!prev_coords.every((c, i) => new_coords[i] === c)) {
                coords_changed = true;
            }
        }

        // Only update when states have changed:
        //   - visible coordinates changed
        //   - hard reset of visible tiles (e.g. when reloading scene)
        if (coords_changed || this.reset_visible_tiles) {
            this.updateTileStates();
        }
    },

    updateTileStates () {
        this.reset_visible_tiles = false;

        this.forEachTile(tile => {
            this.updateVisibility(tile);
            tile.update(this.view);
        });

        this.loadQueuedCoordinates();
        this.updateProxyTiles();
        this.view.pruneTileCoordinatesForView(); // remove tiles too far outside of view
    },

    updateProxyTiles () {
        if (this.view.zoom_direction === 0) {
            return;
        }

        // Clear previous proxies
        this.forEachTile(tile => tile.proxy = false);

        let proxy = false;
        this.forEachTile(tile => {
            if (this.view.zoom_direction === 1) {
                if (tile.visible && tile.loading && tile.coords.z > 0) {
                    let p = this.pyramid.getAncestor(tile);
                    if (p) {
                        proxy = true;
                        p.proxy = true;
                        p.visible = true;
                        p.update(this.view);
                    }
                }
            }
            else if (this.view.zoom_direction === -1) {
                if (tile.visible && tile.loading) {
                    let d = this.pyramid.getDescendants(tile);
                    for (let t of d) {
                        proxy = true;
                        t.proxy = true;
                        t.visible = true;
                        t.update(this.view);
                    }
                }
            }
        });

        if (!proxy) {
            this.view.zoom_direction = 0;
        }
    },

    updateVisibility(tile) {
        if (tile.style_zoom !== this.view.tile_zoom) {
            tile.visible = false;
            return;
        }

        if (this.visible_coords[tile.coords.key]) {
            tile.visible = true;
        }
        else {
            // brute force
            for (let key in this.visible_coords) {
                if (Tile.isChild(tile.coords, this.visible_coords[key])) {
                    tile.visible = true;
                    return;
                }
            }

            tile.visible = false;
        }
    },

    // Remove tiles that aren't visible, and flag remaining visible ones to be updated
    // (for loading, proxy, etc.)
    resetVisibleTiles () {
        this.removeTiles(tile => !tile.visible);
        this.reset_visible_tiles = true;
    },

    getRenderableTiles() {
        let tiles = [];
        for (let t in this.tiles) {
            let tile = this.tiles[t];
            if (tile.visible && tile.loaded) {
                tiles.push(tile);
            }
        }
        return tiles;
    },

    isLoadingVisibleTiles() {
        return Object.keys(this.tiles).some(k => this.tiles[k].visible && this.tiles[k].loading);
    },

    // Queue a tile for load
    queueCoordinate(coords) {
        this.queued_coords[this.queued_coords.length] = coords;
    },

    // Load all queued tiles
    loadQueuedCoordinates() {
        if (this.queued_coords.length === 0) {
            return;
        }

        // Sort queued tiles from center tile
        this.queued_coords.sort((a, b) => {
            let ad = Math.abs(this.view.center.tile.x - a.x) + Math.abs(this.view.center.tile.y - a.y);
            let bd = Math.abs(this.view.center.tile.x - b.x) + Math.abs(this.view.center.tile.y - b.y);
            return (bd > ad ? -1 : (bd === ad ? 0 : 1));
        });
        this.queued_coords.forEach(coords => this.loadCoordinate(coords));
        this.queued_coords = [];
    },

    // Load all tiles to cover a given logical tile coordinate
    loadCoordinate(coords) {
        // Skip if not at current scene zoom
        if (coords.z !== this.view.center.tile.z) {
            return;
        }

        // Determine necessary tiles for each source
        for (let source of Utils.values(this.scene.sources)) {
            if (!source.tiled) {
                continue;
            }

            let key = Tile.key(coords, source, this.view.tile_zoom);
            if (key && !this.hasTile(key)) {
                let tile = Tile.create({
                    source,
                    coords,
                    worker: this.scene.nextWorker(),
                    style_zoom: this.view.styleZoom(coords.z)
                });

                this.keepTile(tile);
                this.buildTile(tile);
            }
        }
    },

    // Sort and build a list of tiles
    buildTiles(tiles) {
        Tile.sort(tiles).forEach(tile => this.buildTile(tile));
        this.checkBuildQueue();
    },

    buildTile(tile) {
        this.tileBuildStart(tile.key);
        this.updateVisibility(tile);
        tile.update(this.view);
        tile.build(this.scene.generation)
            .then(message => this.buildTileCompleted(message))
            .catch(e => {
                log.error(`Error building tile ${tile.key}:`, e);
                this.forgetTile(tile.key);
                Tile.abortBuild(tile);
            });
    },

    // Called on main thread when a web worker completes processing for a single tile (initial load, or rebuild)
    buildTileCompleted({ tile }) {
        // Removed this tile during load?
        if (this.tiles[tile.key] == null) {
            log.trace(`discarded tile ${tile.key} in TileManager.buildTileCompleted because previously removed`);
            Tile.abortBuild(tile);
            this.updateTileStates();
        }
        // Built with an outdated scene configuration?
        else if (tile.generation !== this.scene.generation) {
            log.debug(`discarded tile ${tile.key} in TileManager.buildTileCompleted because built with ` +
                `scene config gen ${tile.generation}, current ${this.scene.generation}`);
            this.forgetTile(tile.key);
            Tile.abortBuild(tile);
            this.updateTileStates();
        }
        else {
            // Update tile with properties from worker
            if (this.tiles[tile.key]) {
                tile = this.tiles[tile.key].merge(tile);
            }

            this.updateTileStates();
            tile.buildMeshes(this.scene.styles);
            this.scene.requestRedraw();
        }

        this.tileBuildStop(tile.key);
    },

    // Track tile build state
    tileBuildStart(key) {
        this.building_tiles = this.building_tiles || {};
        this.building_tiles[key] = true;
        log.trace(`tileBuildStart for ${key}: ${Object.keys(this.building_tiles).length}`);
    },

    tileBuildStop(key) {
        // Done building?
        if (this.building_tiles) {
            log.trace(`tileBuildStop for ${key}: ${Object.keys(this.building_tiles).length}`);
            delete this.building_tiles[key];
            this.checkBuildQueue();
        }
    },

    // Check status of tile building queue and notify scene when we're done
    checkBuildQueue() {
        if (!this.building_tiles || Object.keys(this.building_tiles).length === 0) {
            this.building_tiles = null;
            this.scene.tileManagerBuildDone();
        }
    },

    // Sum of a debug property across tiles
    getDebugSum(prop, filter) {
        var sum = 0;
        for (var t in this.tiles) {
            if (this.tiles[t].debug[prop] != null && (typeof filter !== 'function' || filter(this.tiles[t]) === true)) {
                sum += this.tiles[t].debug[prop];
            }
        }
        return sum;
    },

    // Average of a debug property across tiles
    getDebugAverage(prop, filter) {
        return this.getDebugSum(prop, filter) / Object.keys(this.tiles).length;
    }

};

export default TileManager;
