/*global Tile */
import {Geo} from './geo';

var BUILD_TILE_TYPE = 'buildTile';

class QueuedTile {

    constructor({coords, div, cb}) {
        this.coords = coords;
        this.div    = div;
        this.cb     = cb;
    }
    static create(spec) { return new QueuedTile(spec); }
}

export default class Tile {

    constructor(spec = {}) {
        Object.assign(this, {
            key: null,
            coords: {
                x: null,
                y: null,
                z: null
            },
            max: {
                x: null,
                y: null
            },
            min: {},
            debug: false,
            bounds: {
                sw: {
                    x: null,
                    y: null
                },
                ne: {
                    x: null,
                    y: null,
                }
            },
            loading: false,
            loaded: false
        }, spec);
    }
    static create(spec) { return new Tile(spec); }

    destory() {
        if (this.worker) {
            this.worker = null;
        }
    }

    buildTileAsMessage() {
        return {
            key: this.key,
            coords: this.coords,
            min: this.min,
            max: this.max,
            debug: this.debug
        };
    }

    build(scene) {
        scene.workerPostMessageForTile(this, {
            type: BUILD_TILE_TYPE,
            tile: this.buildTileAsMessage(),
            tile_source: scene.tile_source,
            styles: scene.styles_serialized
        });
    }

    rebuild() {}

    showDebug(div) {
        var debug_overlay = document.createElement('div');
        debug_overlay.style = {
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            color: 'white',
            fontSize: '16px;',
            borderStyle: 'solid',
            borderColor: 'white',
            borderWidth: '1px'
        };
        div.appendChild(debug_overlay);
        return debug_overlay;
    }

    updateElement(div) {

        div.setAttribute('data-tile-key', this.key);
        div.style = {
            width: '256px',
            height: '256px'
        };

        if (this.debug) {
            this.showDebug(div);
        }
    }

    updateVisibility(scene) {
        var visible = this.visible;
        this.visible = this.isInZoom(scene) && Geo.boxIntersect(this.bounds, scene.buffered_meter_bounds);
        this.center_dist = Math.abs(scene.center_meters.x - this.min.x) + Math.abs(scene.center_meters.y - this.min.y);
        return (visible !== this.visible);
    }

    isInZoom(scene) {
        return (Math.min(this.coords.z, scene.tile_source.max_zoom || this.coords.z)) === scene.capped_zoom;
    }

    getKey() {
        return [this.coords.x, this.coords.y, this.coords.z].join('/');
    }

    load(scene, coords, div, cb) {
        var key,
            zgap = coords.z - scene.tile_source.max_zoom;
        coords.x = ~~(coords.x / Math.pow(2, zgap));
        coords.y = ~~(coords.y / Math.pow(2, zgap));


        coords.display_z = coords.z;
        coords.z -= zgap;
        scene.trackTileSetLoadStart();

        this.key = [coords.x, coords.y, coords.z].join('/');

        scene.tiles[this.key] = this;

        Object.assign(this, {
            coords: coords,
            min: Geo.metersForTile(coords),
            max: Geo.metersForTile({x: coords.x + 1, y: coords.y + 1, z: coords.z }),
            span: { x: (this.max.x - this.min.x), y: (this.max.y - this.min.y) },
            loading: true
        });

        this.build(scene, key);
        this.updateElement(div);
        this.updateVisibility(scene);

        if (cb) { cb(null, div); }
    }

/*
    if (coords.z > this.tile_source.max_zoom) {
        var zgap = coords.z - this.tile_source.max_zoom;
        // var original_tile = [coords.x, coords.y, coords.z].join('/');
        coords.x = ~~(coords.x / Math.pow(2, zgap));
        coords.y = ~~(coords.y / Math.pow(2, zgap));
        coords.display_z = coords.z; // z without overzoom
        coords.z -= zgap;
        // console.log(`adjusted for overzoom, tile ${original_tile} -> ${[coords.x, coords.y, coords.z].join('/')}`);
    }

    this.trackTileSetLoadStart();

    var key = [coords.x, coords.y, coords.z].join('/');

    // Already loading/loaded?
    if (this.tiles[key]) {
        // if (this.tiles[key].loaded == true) {
        //     console.log(`use loaded tile ${key} from cache`);
        // }
        // if (this.tiles[key].loading == true) {
        //     console.log(`already loading tile ${key}, skip`);
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
    tile.span = { x: (tile.max.x - tile.min.x), y: (tile.max.y - tile.min.y) };
    tile.bounds = { sw: { x: tile.min.x, y: tile.max.y }, ne: { x: tile.max.x, y: tile.min.y } };
    tile.debug = {};
    tile.loading = true;
    tile.loaded = false;

    this.buildTile(tile.key);
    this.updateTileElement(tile, div);
    this.updateVisibilityForTile(tile);
*/


}
