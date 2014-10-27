/*global Tile */
import {Geo} from './geo';

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
            debug: {},
            loading: false,
            loaded: false
        }, spec);
    }

    static create(spec) { return new Tile(spec); }

    freeResources() {
        if (this != null && this.gl_geometry != null) {
            for (var p in this.gl_geometry) {
                this.gl_geometry[p].destroy();
            }
            this.gl_geometry = null;
        }
    }

    destroy() {
        this.freeResources();
        this.worker = null;
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

    sendBuild(scene) {
        scene.trackTileBuildStart(this.key);
        scene.workerPostMessageForTile(this, {
            type: 'buildTile',
            tile: this.buildAsMessage(),
            tile_source: this.tile_source.buildAsMessage(),
            layers: scene.layers_serialized,
            styles: scene.styles_serialized
        });
    }

    // Web worker will cancel XHR requests
    sendRemove(scene) {
        scene.workerPostMessageForTile(this, {
            type: 'removeTile',
            key: this.key
        });
    }

    /**
       Called on main thread when a web worker completes processing
       for a single tile.
    */
    buildGLGeometry(modes) {
        var vertex_data = this.vertex_data;
        // Cleanup existing GL geometry objects
        this.freeResources();
        this.gl_geometry = {};

        // Create GL geometry objects
        for (var s in vertex_data) {
            this.gl_geometry[s] = modes[s].makeGLGeometry(vertex_data[s]);
        }

        this.debug.geometries = 0;
        this.debug.buffer_size = 0;
        for (var p in this.gl_geometry) {
            this.debug.geometries += this.gl_geometry[p].geometry_count;
            this.debug.buffer_size += this.gl_geometry[p].vertex_data.byteLength;
        }
        this.debug.geom_ratio = (this.debug.geometries / this.debug.features).toFixed(1);

        delete this.vertex_data; // TODO: might want to preserve this for rebuilding geometries when styles/etc. change?
    }

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
        return (Math.min(this.coords.z, this.tile_source.max_zoom || this.coords.z)) === scene.capped_zoom;
    }

    get key () {
        var {x, y, z} = this.tile_source.calculateOverZoom(this.coords);
        this.coords = {x, y, z};
        return [x, y, z].join('/');
    }


    load(scene, coords, div, cb) {

        scene.trackTileSetLoadStart();
        Object.assign(this, {
            coords: coords,
            min: Geo.metersForTile(coords),
            max: Geo.metersForTile({x: coords.x + 1, y: coords.y + 1, z: coords.z }),
            loading: true
        });

        this.span = { x: (this.max.x - this.min.x), y: (this.max.y - this.min.y) };
        this.bounds = { sw: { x: this.min.x, y: this.max.y }, ne: { x: this.max.x, y: this.min.y } };
        this.sendBuild(scene);
        this.updateElement(div);
        this.updateVisibility(scene);

        if (cb) { cb(null, div); }
    }

    merge(other) {
        for (var key in other) {
            if (key !== 'key') {
                this[key] = other[key];
            }
        }
        return this;
    }

}
