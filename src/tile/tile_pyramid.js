import {TileID} from './tile_id';

export default class TilePyramid {

    constructor() {
        this.tiles = {};
        this.max_proxy_descendant_depth = 6; // # of levels to search up/down for proxy tiles
        this.max_proxy_ancestor_depth = 7;
        this.children_cache = {}; // cache for children of coordinates
    }

    addTile(tile) {
        // Add target tile
        this.tiles[tile.key] = this.tiles[tile.key] || { descendants: 0 };
        this.tiles[tile.key].tile = tile;

        // Add to parents
        while (tile.style_z >= 0) {
            tile = TileID.parent(tile);
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
        while (tile.style_z >= 0) {
            tile = TileID.parent(tile);
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
            tile = TileID.parent(tile);
            if (!tile) {
                return;
            }

            if (this.tiles[tile.key] &&
                this.tiles[tile.key].tile &&
                this.tiles[tile.key].tile.loaded) {
                return this.tiles[tile.key].tile;
            }

            level++;
        }
    }

    // Find the descendant tiles for a given tile and style zoom level
    getDescendants (tile, level = 0) {
        let descendants = [];
        if (level < this.max_proxy_descendant_depth) {
            let tiles = TileID.children(tile, this.children_cache);
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
                        descendants.push(...this.getDescendants(t, level + 1));
                    }
                }
            });
        }

        return descendants;
    }

}
