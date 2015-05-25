import Tile from './tile';

import log from 'loglevel';

var TileManager;

export default TileManager = {

    init(scene) {
        this.scene = scene;
        this.tiles = {};
        this.visible_tiles = {};
        this.queued_tiles = [];
        this.building_tiles = null;
    },

    destroy() {
        this.forEachTile(tile => tile.destroy());
        this.tiles = {};
        this.visible_tiles = {};
        this.queued_tiles = [];
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
        this.visible_tiles = this.scene.findVisibleTiles();
        for (let key in this.visible_tiles) {
            this.queueTile(this.visible_tiles[key]);
        }

        // Remove tiles too far outside of view
        this.scene.pruneTilesForView(); // TODO: return list to prune?

        this.forEachTile(tile => {
            this.updateVisibility(tile);
            tile.update(this.scene);
        });
    },

    updateVisibility(tile) {
        tile.visible = (this.visible_tiles[tile.key] && (tile.coords.z === this.scene.center_tile.z)) ? true : false;
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
    queueTile(coords) {
        this.queued_tiles[this.queued_tiles.length] = coords;
    },

    // Load all queued tiles
    loadQueuedTiles() {
        if (this.queued_tiles.length === 0) {
            return;
        }

        // Sort queued tiles from center tile
        this.queued_tiles.sort((a, b) => {
            let ad = Math.abs(this.scene.center_tile.x - a.x) + Math.abs(this.scene.center_tile.y - a.y);
            let bd = Math.abs(this.scene.center_tile.x - b.x) + Math.abs(this.scene.center_tile.y - b.y);
            return (bd > ad ? -1 : (bd === ad ? 0 : 1));
        });
        this.queued_tiles.forEach(coords => this.loadTile(coords));
        this.queued_tiles = [];
    },

    // Load a single tile
    loadTile(coords) {
        // Skip if not at current scene zoom
        if (coords.z !== this.scene.center_tile.z) {
            return;
        }

        let key = Tile.key(coords);
        let tile;
        if (!this.hasTile(key)) {
            tile = Tile.create({
                coords: coords,
                max_zoom: this.scene.findMaxZoom(), // TODO: replace with better max zoom handling
                worker: this.scene.nextWorker(),
                style_zoom: this.scene.styleZoom(coords.z) // TODO: replace?
            });

            this.keepTile(tile);
            this.buildTile(tile);
        }
        else {
            tile = this.tiles[key];
        }
        return tile;
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
        tile.build(this.scene.generation).then(message => this.buildTileCompleted(message));
    },

    // Called on main thread when a web worker completes processing for a single tile (initial load, or rebuild)
    buildTileCompleted({ tile }) {
        // Removed this tile during load?
        if (this.tiles[tile.key] == null) {
            log.trace(`discarded tile ${tile.key} in TileManager.buildTileCompleted because previously removed`);
            Tile.abortBuild(tile);
        }
        // Built with an outdated scene configuration?
        else if (tile.generation !== this.scene.generation) {
            log.debug(`discarded tile ${tile.key} in TileManager.buildTileCompleted because built with ` +
                `scene config gen ${tile.generation}, current ${this.scene.generation}`);
            this.forgetTile(tile.key);
            Tile.abortBuild(tile);
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
    }

};
