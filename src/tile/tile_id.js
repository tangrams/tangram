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
        return [source.name, coords.x, coords.y, coords.z, style_z].join('/');
    },

    normalizedKey (coords, source, style_z) {
        return this.key(this.normalizedCoord(coords, source), source, style_z);
    },

    normalizedCoord (coords, source) {
        if (source.zoom_bias) {
            coords = this.coordAtZoom(coords, Math.max(coords.z - source.zoom_bias, source.zooms[0]));
        }
        return this.coordForTileZooms(coords, source.zooms);
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

    coordForTileZooms({ x, y, z }, zooms) {
        const nz = this.findZoomInRange(z, zooms);
        if (nz !== z) {
            return this.coordAtZoom({ x, y, z }, nz);
        }
        return this.coord({ x, y, z });
    },

    findZoomInRange(z, zooms) {
        return zooms.filter(s => z >= s).reverse()[0] || zooms[0];
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
        if (style_z > 0) { // no more tiles above style zoom 0
            style_z--;
            const sz = Math.max(style_z - source.zoom_bias, source.zooms[0]); // z can't be lower than tile source
            const c = this.coordForTileZooms(this.coordAtZoom(coords, sz), source.zooms);

            if (c.z > style_z) {
                return null;
            }

            return {
                key: this.key(c, source, style_z),
                coords: c,
                style_z,
                source
            };
        }
    },

    // Return identifying info for tile's child tiles
    children ({ coords, source, style_z }, CACHE = {}) {
        style_z++;
        const c = this.coordForTileZooms(this.coordAtZoom(coords, style_z - source.zoom_bias), source.zooms);
        if (c.z === coords.z) {
            // same coord zoom for next level down
            return [{
                key: this.key(c, source, style_z),
                coords: c,
                style_z,
                source
            }];
        }
        else {
            // coord zoom advanced down
            const key = this.key(c, source, style_z);
            CACHE[source.id] = CACHE[source.id] || {};
            if (CACHE[source.id][key] == null) {
                const span = Math.pow(2, c.z - coords.z);
                const x = coords.x * span;
                const y = coords.y * span;
                let children = [];
                for (let nx = x; nx < x + span; nx++) {
                    for (let ny = y; ny < y + span; ny++) {
                        let nc = this.coord({ x: nx, y: ny, z: c.z });
                        children.push({
                            key: this.key(nc, source, style_z),
                            coords: nc,
                            style_z,
                            source
                        });
                    }
                }
                CACHE[source.id][key] = children;
            }
            return CACHE[source.id][key];
        }
    }

};
