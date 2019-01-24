
const COORD_CHILDREN = {}; // only allocate children coords once per coord

export const TileID = {

    coord(c) {
        return {x: c.x, y: c.y, z: c.z, key: this.coordKey(c)};
    },

    coordKey({x, y, z}) {
        return x + '/' + y + '/' + z;
    },

    key (coords, source, style_z) {
        if (coords.y < 0 || coords.y >= (1 << coords.z) || coords.z < 0) {
            return; // cull tiles out of range (x will wrap)
        }
        return [source.name, style_z, coords.x, coords.y, coords.z].join('/');
    },

    normalizedKey (coords, source, style_z) {
        return this.key(this.normalizedCoord(coords, source), source, style_z);
    },

    normalizedCoord (coords, source) {
        if (source.zoom_bias) {
            coords = this.coordAtZoom(coords, coords.z - source.zoom_bias);
        }
        return this.coordWithMaxZoom(coords, source.max_zoom);
    },

    coordAtZoom({x, y, z}, zoom) {
        zoom = Math.max(0, zoom); // zoom can't go below zero
        if (z !== zoom) {
            let zscale = Math.pow(2, z - zoom);
            x = Math.floor(x / zscale);
            y = Math.floor(y / zscale);
            z = zoom;
        }
        return this.coord({x, y, z});
    },

    coordWithMaxZoom({x, y, z}, max_zoom) {
        if (max_zoom != null && z > max_zoom) {
            return this.coordAtZoom({x, y, z}, max_zoom);
        }
        return this.coord({x, y, z});
    },

    childrenForCoord({x, y, z, key}) {
        if (!COORD_CHILDREN[key]) {
            z++;
            x *= 2;
            y *= 2;
            COORD_CHILDREN[key] = [
                this.coord({x, y,      z}), this.coord({x: x+1, y,      z}),
                this.coord({x, y: y+1, z}), this.coord({x: x+1, y: y+1, z})
            ];
        }
        return COORD_CHILDREN[key];
    },

    isDescendant(parent, descendant) {
        if (descendant.z > parent.z) {
            let {x, y} = this.coordAtZoom(descendant, parent.z);
            return (parent.x === x && parent.y === y);
        }
        return false;
    },

    // Return identifying info for tile's parent tile
    parent ({ coords, source, style_z }) {
        if (style_z > source.max_coord_zoom || style_z <= source.min_coord_zoom) {
            if (style_z > 0) { // no more tiles above style zoom 0
                return {
                    key: this.key(coords, source, style_z - 1),
                    coords,
                    style_z: style_z - 1,
                    source
                };
            }
            return;
        }
        else if (style_z > 0) { // no more tiles above style zoom 0
            const c = this.coordAtZoom(coords, coords.z - 1);
            return {
                key: this.key(c, source, style_z - 1),
                coords: c,
                style_z: style_z - 1,
                source
            };
        }
    },

    // Return identifying info for tile's child tiles
    children ({ coords, source, style_z }) {
        if (style_z >= source.max_coord_zoom || style_z < source.min_coord_zoom) {
            return [{
                key: this.key(coords, source, style_z + 1),
                coords,
                style_z: style_z + 1,
                source
            }];
        }

        const children = this.childrenForCoord(coords);
        return children.map(c => {
            return {
                key: this.key(c, source, style_z + 1),
                coords: c,
                style_z: style_z + 1,
                source
            };
        });
    }

};
