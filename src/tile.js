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
            coords: {
                x: null,
                y: null,
                z: null
            },
            layers: null,
            max: {
                x: null,
                y: null
            },
            min: {},
            debug: {},
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

    buildAsMessage() {
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
            tile: this.buildAsMessage(),
            tile_source: this.tile_source.buildAsMessage(),
            layers: scene.layers_serialized,
            styles: scene.styles_serialized
        });
    }

    rebuild() {}

    showDebug(div) {
        var debug_overlay = document.createElement('div');

        debug_overlay.textContent = this.key;
        debug_overlay.style.position = 'absolute';
        debug_overlay.style.left = 0;
        debug_overlay.style.top = 0;
        debug_overlay.style.color = 'white';
        debug_overlay.style.fontSize = '16px';
        debug_overlay.style.textOutline = '1px #000000';
        div.appendChild(debug_overlay);
        div.style.borderStyle = 'solid';
        div.style.borderColor = 'white';
        div.style.borderWidth = '1px';
        return debug_overlay;
    }

    updateElement(div) {

        div.setAttribute('data-tile-key', this.key);

        div.style = {
            width: '256px',
            height: '256px'
        };

        this.showDebug(div);

//        if (this.debug) { }
    }
    updateVisibility(scene) {

        var visible = this.visible;
        this.visible = this.isInZoom(scene) && Geo.boxIntersect(this.bounds, scene.buffered_meter_bounds);
        this.center_dist = Math.abs(scene.center_meters.x - this.min.x) + Math.abs(scene.center_meters.y - this.min.y);
        return (visible !== this.visible);
    }

    isInZoom(scene) {
        return (Math.min(this.coords.z, this.tile_source.max_zoom || this.coords.z)) === scene.capped_zoom;
    }

    get key () {
        return this.getKey();
    }

    getKey() {
        var zgap, x, y;

        zgap = this.tile_source.getZGap(this.coords);
        console.log(zgap);

        x = ~~(this.coords.x / Math.pow(2, zgap));
        y = ~~(this.coords.y / Math.pow(2, zgap));
        this.coords.display_z = this.coords.z;

        return [x, y, this.coords.z].join('/');
    }

    load(scene, coords, div, cb) {

        scene.trackTileSetLoadStart();
        Object.assign(this, {
            coords: coords,
            min: Geo.metersForTile(coords),
            max: Geo.metersForTile({x: coords.x + 1, y: coords.y + 1, z: coords.z }),
            loading: true
        });

        this.span = { x: (this.max.x - this.min.x), y: (this.max.y - this.min.y) },
        this.bounds = { sw: { x: this.min.x, y: this.max.y }, ne: { x: this.max.x, y: this.min.y } },
        this.build(scene);
        this.updateElement(div);
        this.updateVisibility(scene);

        if (cb) { cb(null, div); }
    }

}
