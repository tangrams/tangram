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
            key: this.getKey(),
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

        var zgap = this.coords.z - this.tile_source.max_zoom,
            x = ~~(this.coords.x / Math.pow(2, zgap)),
            y = ~~(this.coords.y / Math.pow(2, zgap)),
            z = this.coords.z - zgap;

        return [x, y, z].join('/');
    }

    load(scene, coords, div, cb) {

        scene.trackTileSetLoadStart();
        Object.assign(this, {
            coords: coords,
            min: Geo.metersForTile(coords),
            max: Geo.metersForTile({x: coords.x + 1, y: coords.y + 1, z: coords.z }),
            span: { x: (this.max.x - this.min.x), y: (this.max.y - this.min.y) },
            loading: true
        });

        this.build(scene);
        this.updateElement(div);
        this.updateVisibility(scene);

        if (cb) { cb(null, div); }
    }

}
