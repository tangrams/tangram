import Geo from './geo';
import Tile from './tile';

const TilePyramid = {

    coords: {},
    max_proxy_descendant_depth: 3, // # of levels deep to search for descendant proxy tiles

    reset() {
        this.coords = {};
    },

    sourceTiles(coord, source) {
        return (
            this.coords[coord.key] &&
            this.coords[coord.key].sources &&
            this.coords[coord.key].sources.get(source.name));
    },

    addTile(tile) {
        // Add target tile
        let key = tile.coords.key;
        let coord = this.coords[key];
        if (!coord) {
            coord = this.coords[key] = { descendants: 0 };
        }

        if (!coord.sources) {
            coord.sources = new Map();
        }

        if (!coord.sources.get(tile.source.name)) {
            coord.sources.set(tile.source.name, new Map());
        }
        coord.sources.get(tile.source.name).set(tile.style_zoom, tile);

        // Increment reference count up the tile pyramid
        for (let z = tile.coords.z - 1; z >= 0; z--) {
            let up = Tile.coordinateAtZoom(tile.coords, z);
            if (!this.coords[up.key]) {
                this.coords[up.key] = { descendants: 0 };
            }
            this.coords[up.key].descendants++;
        }
    },

    removeTile(tile) {
        // Remove target tile
        let source_tiles = this.sourceTiles(tile.coords, tile.source);
        let key = tile.coords.key;

        if (source_tiles) {
            source_tiles.delete(tile.style_zoom);
            if (source_tiles.size === 0) {
                // remove source
                this.coords[key].sources.delete(tile.source.name);
                if (this.coords[key].sources.size === 0) {
                    delete this.coords[key].sources;

                    if (this.coords[key].descendants === 0) {
                        // remove whole coord
                        delete this.coords[key];
                    }
                }
            }
        }

        // Decrement reference count up the tile pyramid
        for (let z = tile.coords.z - 1; z >= 0; z--) {
            let down = Tile.coordinateAtZoom(tile.coords, z);
            if (this.coords[down.key] && this.coords[down.key].descendants > 0) {
                this.coords[down.key].descendants--;
                if (this.coords[down.key].descendants === 0 && !this.coords[down.key].sources) {
                    delete this.coords[down.key];
                }
            }
        }
    },

    getAncestor ({ coords, style_zoom, source }) {
        // First check overzoomed tiles at same coordinate zoom
        if (style_zoom > source.max_zoom) {
            let source_tiles = this.sourceTiles(coords, source);
            if (source_tiles) {
                for (let z = style_zoom - 1; z >= source.max_zoom; z--) {
                    if (source_tiles.has(z) && source_tiles.get(z).loaded) {
                        return source_tiles.get(z);
                    }
                }
            }
            style_zoom = source.max_zoom;
        }

        // Check tiles at next zoom up
        style_zoom--;
        let parent = Tile.coordinateAtZoom(coords, coords.z - 1);
        let parent_tiles = this.sourceTiles(parent, source);
        if (parent_tiles && parent_tiles.has(style_zoom) && parent_tiles.get(style_zoom).loaded) {
            return parent_tiles.get(style_zoom);
        }
        // didn't find ancestor, try next level
        // TODO: max depth levels to check
        if (parent.z > 0) {
            return this.getAncestor({ coords: parent, style_zoom, source });
        }
    },

    getDescendants ({ coords, style_zoom, source }, level = 1) {
        let descendants = [];

        // First check overzoomed tiles at same coordinate zoom
        if (style_zoom >= source.max_zoom) {
            let source_tiles = this.sourceTiles(coords, source);
            if (source_tiles) {
                let search_max_zoom = Math.max(Geo.default_view_max_zoom, style_zoom + this.max_proxy_descendant_depth);
                for (let z = style_zoom + 1; z <= search_max_zoom; z++) {
                    if (source_tiles.has(z) && source_tiles.get(z).loaded) {
                        descendants.push(source_tiles.get(z));
                        return descendants;
                    }
                }
            }
            return descendants;
        }

        // Check tiles at next zoom down
        if (this.coords[coords.key] && this.coords[coords.key].descendants > 0) {
            style_zoom++;
            for (let child of Tile.childrenForCoordinate(coords)) {
                let child_tiles = this.sourceTiles(child, source);
                if (child_tiles && child_tiles.has(style_zoom) && child_tiles.get(style_zoom).loaded) {
                    descendants.push(child_tiles.get(style_zoom));
                }
                // didn't find child, try next level
                else if (level <= this.max_proxy_descendant_depth && child.z <= source.max_zoom) {
                    descendants.push(...this.getDescendants({ coords: child, source, style_zoom }, level + 1));
                }
            }
        }

        return descendants;
    }

};

export default TilePyramid;
