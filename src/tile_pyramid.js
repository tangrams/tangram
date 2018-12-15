import Tile from './tile';

export default class TilePyramid {

    constructor() {
        this.tiles = {};
        this.max_proxy_descendant_depth = 3; // # of levels to search up/down for proxy tiles
        this.max_proxy_ancestor_depth = 5;
    }

    addTile(tile) {
        // Add target tile
        this.tiles[tile.key] = this.tiles[tile.key] || { descendants: 0 };
        this.tiles[tile.key].tile = tile;

        // Add to parents
        while (tile.style_zoom >= 0) {
            tile = Tile.parentInfo(tile);
            if (!tile) {
                return;
            }

            if (!this.tiles[tile.key]) {
                this.tiles[tile.key] = { descendants: 0 };
            }
            this.tiles[tile.key].descendants++;
        }
    }

    removeTile(tile) {
        // Remove target tile
        if (this.tiles[tile.key]) {
            delete this.tiles[tile.key].tile;

            if (this.tiles[tile.key].descendants === 0) {
                delete this.tiles[tile.key]; // remove whole tile in tree
            }
        }

        // Decrement reference count up the tile pyramid
        while (tile.style_zoom >= 0) {
            tile = Tile.parentInfo(tile);
            if (!tile) {
                return;
            }

            if (this.tiles[tile.key] && this.tiles[tile.key].descendants > 0) {
                this.tiles[tile.key].descendants--;
                if (this.tiles[tile.key].descendants === 0 && !this.tiles[tile.key].tile) {
                    delete this.tiles[tile.key]; // remove whole tile in tree
                }
            }
        }
    }

    // Find the parent tile for a given tile and style zoom level
    getAncestor (tile) {
        let level = 0;
        while (level < this.max_proxy_ancestor_depth) {
            const last_z = tile.coords.z;
            tile = Tile.parentInfo(tile);
            if (!tile) {
                return;
            }

            if (this.tiles[tile.key] &&
                this.tiles[tile.key].tile &&
                this.tiles[tile.key].tile.loaded) {
                return this.tiles[tile.key].tile;
            }

            if (tile.coords.z !== last_z) {
                level++;
            }
        }
    }

    // Find the descendant tiles for a given tile and style zoom level
    getDescendants (tile, level = 0) {
        let descendants = [];
        if (level < this.max_proxy_descendant_depth) {
            let tiles = Tile.childrenInfo(tile);
            if (!tiles) {
                return;
            }

            tiles.forEach(t => {
                if (this.tiles[t.key]) {
                    if (this.tiles[t.key].tile &&
                        this.tiles[t.key].tile.loaded) {
                        descendants.push(this.tiles[t.key].tile);
                    }
                    else if (this.tiles[t.key].descendants > 0) { // didn't find any children, try next level
                        descendants.push(...this.getDescendants(t, level + (t.coords.z !== tile.coords.z)));
                    }
                }
            });
        }

        return descendants;
    }

}
