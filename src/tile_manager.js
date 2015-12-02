import Tile from './tile';
import Utils from './utils/utils';

import log from 'loglevel';

var TileManager;

export default TileManager = {

    init(scene) {
        this.scene = scene;
        this.tiles = {};
        this.visible_coords = {};
        this.queued_coords = [];
        this.building_tiles = null;
    },

    destroy() {
        this.forEachTile(tile => tile.destroy());
        this.tiles = {};
        this.visible_coords = {};
        this.queued_coords = [];
        this.scene = null;
    },

    keepTile(tile) {
        this.tiles[tile.key] = tile;
    },

    hasTile(key) {
        return this.tiles[key] !== undefined;
    },

    forgetTile(key) {
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
        this.visible_coords = {};
        let tile_coords = this.scene.findVisibleTileCoordinates();
        for (let coords of tile_coords) {
            this.queueCoordinate(coords);
            this.visible_coords[Tile.coordKey(coords)] = coords;
        }

        // Remove tiles too far outside of view
        this.scene.pruneTileCoordinatesForView(); // TODO: return list to prune?

        this.forEachTile(tile => {
            this.updateVisibility(tile);
            tile.update(this.scene);
        });
    },

    updateVisibility(tile) {
        if (tile.style_zoom !== this.scene.tile_zoom) {
            tile.visible = false;
            return;
        }

        if (this.visible_coords[tile.coord_key]) {
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
            let ad = Math.abs(this.scene.center_tile.x - a.x) + Math.abs(this.scene.center_tile.y - a.y);
            let bd = Math.abs(this.scene.center_tile.x - b.x) + Math.abs(this.scene.center_tile.y - b.y);
            return (bd > ad ? -1 : (bd === ad ? 0 : 1));
        });
        this.queued_coords.forEach(coords => this.loadCoordinate(coords));
        this.queued_coords = [];
    },

    // Load all tiles to cover a given logical tile coordinate
    loadCoordinate(coords) {
        // Skip if not at current scene zoom
        if (coords.z !== this.scene.center_tile.z) {
            return;
        }

        // Determine necessary tiles for each source
        for (let source of Utils.values(this.scene.sources)) {
            if (!source.tiled) {
                continue;
            }

            let key = Tile.key(coords, source, this.scene.tile_zoom);
            if (key && !this.hasTile(key)) {
                let tile = Tile.create({
                    source,
                    coords,
                    // max_zoom: this.scene.findMaxZoom(), // TODO: replace with better max zoom handling
                    worker: this.scene.nextWorker(),
                    style_zoom: this.scene.styleZoom(coords.z) // TODO: replace?
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
        tile.update(this.scene);
        tile.build(this.scene.generation)
            .then(message => this.buildTileCompleted(message))
            .catch(() => {
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
            this.updateTilesForView();
        }
        // Built with an outdated scene configuration?
        else if (tile.generation !== this.scene.generation) {
            log.debug(`discarded tile ${tile.key} in TileManager.buildTileCompleted because built with ` +
                `scene config gen ${tile.generation}, current ${this.scene.generation}`);
            this.forgetTile(tile.key);
            Tile.abortBuild(tile);
            this.updateTilesForView();
        }
        else {
            // Update tile with properties from worker
            if (this.tiles[tile.key]) {
                tile = this.tiles[tile.key].merge(tile);
            }

            this.updateVisibility(tile);
            tile.update(this.scene);
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
