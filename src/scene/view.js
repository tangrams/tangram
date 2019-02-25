import Geo from '../utils/geo';
import { TileID } from '../tile/tile_id';
import Camera from './camera';
import Utils from '../utils/utils';
import subscribeMixin from '../utils/subscribe';
import log from '../utils/log';

export const VIEW_PAN_SNAP_TIME = 0.5;

export default class View {

    constructor(scene, options) {
        subscribeMixin(this);

        this.scene = scene;
        this.interactionLayer = null; // optionally set by tangramLayer
        this.createMatrices();

        this.zoom = null;
        this.center = null;
        this.bounds = null;
        this.meters_per_pixel = null;

        this.roll = null;
        this.pitch = null;

        this.panning = false;
        this.panning_stop_at = 0;
        this.pan_snap_timer = 0;
        this.zoom_direction = 0;

        this.user_input_at = 0;
        this.user_input_timeout = 50;
        this.user_input_active = false;

        // Size of viewport in CSS pixels, device pixels, and mercator meters
        this.size = {
            css: {},
            device: {},
            meters: {}
        };
        this.aspect = null;

        this.buffer = 0;
        this.continuous_zoom = (typeof options.continuousZoom === 'boolean') ? options.continuousZoom : true;
        this.wrap = (options.wrapView === false) ? false : true;
        this.preserve_tiles_within_zoom = 1;

        this.reset();
    }

    // Reset state before scene config is updated
    reset() {
        this.createCamera();
    }

    // Create camera
    createCamera() {
        let active_camera = this.getActiveCamera();
        if (active_camera) {
            this.camera = Camera.create(active_camera, this, this.scene.config.cameras[active_camera]);
            if (this.interactionLayer) { // if provided by tangramLayer -- otherwise handled separately
                this.interactionLayer.init(this.scene, this.camera);
            }
            this.camera.updateView();
        }
    }

    // Get active camera - for public API
    getActiveCamera() {
        if (this.scene.config && this.scene.config.cameras) {
            for (let name in this.scene.config.cameras) {
                if (this.scene.config.cameras[name].active) {
                    return name;
                }
            }

            // If no camera set as active, use first one
            let keys = Object.keys(this.scene.config.cameras);
            return keys.length && keys[0];
        } else {
            log('warn', 'No active camera could be found');
        }
    }

    // Set active camera and recompile - for public API
    setActiveCamera(name) {
        let prev = this.getActiveCamera();
        if (prev === name) {
            return name;
        }

        if (this.scene.config.cameras[name]) {
            this.scene.config.cameras[name].active = true;

            // Clear previously active camera
            if (prev && this.scene.config.cameras[prev]) {
                delete this.scene.config.cameras[prev].active;
            }
        }

        this.scene.updateConfig({ rebuild: false, normalize: false });
        return this.getActiveCamera();
    }

    // Update method called once per frame
    update() {
        if (this.camera != null && this.ready()) {
            this.camera.update();
        }
        this.pan_snap_timer = ((+new Date()) - this.panning_stop_at) / 1000;
        this.user_input_active = ((+new Date() - this.user_input_at) < this.user_input_timeout);
        if (this.panning) {
            // sync any markers to map
            this.trigger('move');
        }
    }

    // trigger moveend event for subscribers
    moveEnd() {
        this.trigger('moveend');
    }

    // trigger click event for subscribers
    onClick(e) {
        e.lngLat.wrap = function () {
            const n = this.lng;
            const min = -180;
            const max = 180;
            const d = max - min;
            const w = ((n - min) % d + d) % d + min;
            const wrapped = (w === min) ? max : w;
            // console.log('lng:', this.lng, 'wrapped:', wrapped);
            return { lng: wrapped, lat: this.lat };
        };
        this.trigger('click', e);
    }

    // Set logical pixel size of viewport
    setViewportSize(width, height) {
        this.size.css = { width, height };
        this.size.device = {
            width: Math.round(this.size.css.width * Utils.device_pixel_ratio),
            height: Math.round(this.size.css.height * Utils.device_pixel_ratio)
        };
        this.aspect = this.size.css.width / this.size.css.height;
        this.updateBounds();
    }

    // Set the map view, can be passed an object with lat/lng and/or zoom
    jumpTo({ lng, lat, zoom } = {}) {
        var changed = false;

        // Set center
        if (typeof lng === 'number' && typeof lat === 'number') {
            if (!this.center || lng !== this.center.lng || lat !== this.center.lat) {
                changed = true;
                this.center = { lng, lat };
            }
        }

        // Set zoom
        if (typeof zoom === 'number' && zoom !== this.zoom) {
            changed = true;
            this.zoom = zoom;
            this.setZoom(zoom);
        }
        if (changed) {
            this.updateBounds();
        }
        return changed;
    }

    // Set the map view, can be passed an object with lat/lng and/or zoom
    setView({ lng, lat, zoom } = {}) {
        var changed = false;

        // Set center
        if (typeof lng === 'number' && typeof lat === 'number') {
            if (!this.center || lng !== this.center.lng || lat !== this.center.lat) {
                changed = true;
                this.center = { lng, lat };
            }
        }

        // Set zoom
        if (typeof zoom === 'number' && zoom !== this.zoom) {
            changed = true;
            this.zoom = zoom;
            this.setZoom(zoom);
        }
        if (changed) {
            this.updateBounds();
        }
        return changed;
    }

    // create flyTo function
    getFlyToFunction(start, end) {
        function sq(n) { return n * n; }
        function dist(a, b) { return Math.sqrt(sq(b[0] - a[0]) + sq(b[1] - a[1])); }
        function lerp1(a, b, p) { return a + ((b - a) * p); }
        function lerp2(a, b, p) { return { x: lerp1(a[0], b[0], p), y: lerp1(a[1], b[1], p) }; }
        function cosh(x) { return (Math.pow(Math.E, x) + Math.pow(Math.E, -x)) / 2; }
        function sinh(x) { return (Math.pow(Math.E, x) - Math.pow(Math.E, -x)) / 2; }
        function tanh(x) { return sinh(x) / cosh(x); }

        // Implementation of https://www.win.tue.nl/~vanwijk/zoompan.pdf
        // based on Tangram-ES and https://gist.github.com/RandomEtc/599724

        var changed = false;

        // User preference for zoom/move curve sqrt(2)
        const rho = 1.414;

        const scale = Math.pow(2.0, end.z - start.z);

        // Current view bounds in Mercator Meters
        var rect = this.bounds;
        var width = Math.abs(rect.sw.x - rect.ne.x);
        var height = Math.abs(rect.sw.y - rect.ne.y);

        const w0 = Math.max(width, height);
        const w1 = w0 / scale;

        const startPos = [start.x, start.y];
        const endPos = [end.x, end.y];

        var u0 = 0;
        const u1 = dist(startPos, endPos);
        // i = 0 or 1
        function b(i) {
            var n = sq(w1) - sq(w0) + ((i ? -1 : 1) * Math.pow(rho, 4) * sq(u1 - u0));
            var d = 2 * (i ? w1 : w0) * sq(rho) * (u1 - u0);
            return n / d;
        }

        // give this a b(0) or b(1)
        function r(b) {
            return Math.log(-b + Math.sqrt(sq(b) + 1));
        }

        // Parameterization of the elliptic path to pass through (u0,w0) and (u1,w1)
        const r0 = r(b(0));
        const r1 = r(b(1));
        var S = (r1 - r0) / rho; // "distance"

        S = isNaN(S) ? Math.abs(start.z - end.z) * 0.5 : S;

        // u, w define the elliptic path.
        function u(s) {
            if (s === 0) { return 0; }
            var a = w0 / sq(rho),
                b = a * cosh(r0) * tanh(rho * s + r0),
                c = a * sinh(r0);
            return b - c + u0;
        }

        function w(s) {
            return w0 * cosh(r0) / cosh(rho * s + r0);
        }

        // Check if movement is large enough to derive the fly-to curve
        var move = u1 > 1;

        var returnFunction = (t) => {
            if (t >= 1.0) {
                this.updateBounds();
                return changed;
            } else if (move) {
                var s = S * t;
                var us = u(s);
                var pos = lerp2(startPos, endPos, (us - u0) / (u1 - u0));
                const base = 2;
                const what = w0 / w(s); // flip curve
                var zoom = start.z + Math.log(what) / Math.log(base);
            } else {
                // linear interpolation
                pos = lerp2(startPos, endPos, t);
                zoom = lerp1(start.z, end.z, t);
            }
            return { x: pos.x, y: pos.y, z: zoom };
        };
        return returnFunction;
    }

    // change the map view with a flyto animation, can be passed an object with lat/lng and/or zoom
    // can also be passed a duration, in seconds – default is based on distance
    flyTo({ start, end } = {}, duration) {
        var lngStart = start.center.lng,
            latStart = start.center.lat,
            zStart = start.zoom,
            lngEnd = end.center.lng,
            latEnd = end.center.lat,
            zEnd = end.zoom;

        // Ease over the smallest angular distance needed
        // var radiansDelta = this.camera.rotation - rStart % TWO_PI;
        // if (radiansDelta > PI) { radiansDelta -= TWO_PI; }
        // var rEnd = rStart + radiansDelta;

        var dLongitude = lngEnd - lngStart;
        if (dLongitude > 180.0) {
            lngEnd -= 360.0;
        } else if (dLongitude < -180.0) {
            lngEnd += 360.0;
        }
        var metersStart = Geo.latLngToMeters([lngStart, latStart]);
        var metersEnd = Geo.latLngToMeters([lngEnd, latEnd]);

        var fn = this.getFlyToFunction({ x: metersStart[0], y: metersStart[1], z: zStart }, { x: metersEnd[0], y: metersEnd[1], z: zEnd });

        // define a couple of helper functions for the distance calculation
        function sq(n) { return n * n; }
        function dist(a, b) { return Math.sqrt(sq(b[0] - a[0]) + sq(b[1] - a[1])); }

        if (typeof duration === 'undefined') {
            var distance = dist([metersStart[0], metersStart[1]], [metersEnd[0], metersEnd[1]]);
            // TODO: replace magic numbers with parameters for speed
            duration = Math.max(0.05 * Math.log(distance), 0) + Math.max(0.05 * Math.log(Math.abs(zStart - zEnd)), 0.25);
        }
        var t0 = Date.now();
        var interval = setInterval(() => {
            var t1 = Date.now();
            var t = (t1 - t0) / 1000.0; // number of seconds elapsed
            var s = t / duration; // progress through the trip

            if (s > 1) { // 1 === done
                clearInterval(interval);
            }

            var pos = fn(s);
            if (!isNaN(pos.x) && !isNaN(pos.y) && !isNaN(pos.z)) {
                var latLngPos = Geo.metersToLatLng([pos.x, pos.y]);
                this.setView({ lng: latLngPos[0], lat: latLngPos[1], zoom: pos.z });
                this.setZoom(pos.z);
                this.updateBounds();
                this.scene.requestRedraw();
            } else if (pos) {
                log('warn', 'Invalid position: '+pos);
            }
        }, 17); // 17 = 60fps

        // TODO: add easing type options
        // var easeType = "cubic";
        // var cb = (t) => {
        //         var pos = fn(t);
        //         this.setPosition(pos.x, pos.y);
        //         this.setZoom(pos.z);
        //         // this.setRoll(ease(rStart, rEnd, t, easeType));
        //         // this.setPitch(ease(tStart, this.camera.tilt, t, easeType));
        //         requestRender();
        //     };
        // var _speed = 1;
        // if (_speed <= 0.) { _speed = 1.; }
    }


    setZoom(zoom) {
        let last_tile_zoom = this.tile_zoom;
        let tile_zoom = this.baseZoom(zoom);
        if (!this.continuous_zoom) {
            zoom = tile_zoom;
        }

        if (tile_zoom !== last_tile_zoom) {
            this.zoom_direction = tile_zoom > last_tile_zoom ? 1 : -1; // 1 = zooming in, -1 = zooming out
        }

        this.zoom = zoom;
        this.tile_zoom = tile_zoom;

        this.trigger('zoom');

        this.updateBounds();
        this.scene.requestRedraw();
    }

    // Choose the base zoom level to use for a given fractional zoom
    baseZoom(zoom) {
        return Math.floor(zoom);
    }

    setPanning(panning) {
        this.panning = panning;
        if (!this.panning) {
            this.panning_stop_at = (+new Date());
        }
    }

    markUserInput() {
        this.user_input_at = (+new Date());
    }

    ready() {
        // TODO: better concept of "readiness" state?
        if (typeof this.size.css.width !== 'number' ||
            typeof this.size.css.height !== 'number' ||
            this.center == null ||
            typeof this.zoom !== 'number') {
            return false;
        }
        return true;
    }

    // Calculate viewport bounds based on current center and zoom
    calculateBounds(center = this.center, zoom = this.zoom) {
        this.meters_per_pixel = Geo.metersPerPixel(zoom);

        // Center of viewport in meters, and tile
        let [x, y] = Geo.latLngToMeters([center.lng, center.lat]);
        center.meters = { x, y };

        center.tile = Geo.tileForMeters([center.meters.x, center.meters.y], this.tile_zoom);

        // Size of the half-viewport in meters at current zoom
        this.size.meters = {
            x: this.size.css.width * this.meters_per_pixel,
            y: this.size.css.height * this.meters_per_pixel
        };

        // Bounds in meters
        this.bounds = {
            sw: {
                x: center.meters.x - this.size.meters.x / 2,
                y: center.meters.y - this.size.meters.y / 2
            },
            ne: {
                x: center.meters.x + this.size.meters.x / 2,
                y: center.meters.y + this.size.meters.y / 2
            }
        };
        let boundsLatLng = {};
        boundsLatLng.sw = Geo.metersToLatLng([this.bounds.sw.x, this.bounds.sw.y]);
        boundsLatLng.ne = Geo.metersToLatLng([this.bounds.ne.x, this.bounds.ne.y]);
        this.bounds.latLng = {
            sw: {
                lng: boundsLatLng.sw[0],
                lat: boundsLatLng.sw[1]
            },
            ne: {
                lng: boundsLatLng.ne[0],
                lat: boundsLatLng.ne[1]
            }
        };
        this.bounds.getNorth = function () {
            return this.latLng.ne.lat;
        };
        this.bounds.getSouth = function () {
            return this.latLng.sw.lat;
        };
        this.bounds.getEast = function () {
            return this.latLng.ne.lng;
        };
        this.bounds.getWest = function () {
            return this.latLng.sw.lng;
        };
        this.bounds.getSouthWest = function () {
            return this.latLng.sw;
        };
        this.bounds.getNorthEast = function () {
            return { lng: this.latLng.ne.lng, lat: this.latLng.ne.lat };
        };
        return this.bounds;
    }

    // Calculate viewport bounds based on current center and zoom
    updateBounds() {
        if (!this.ready()) {
            return;
        }
        this.calculateBounds();
        this.meters_per_pixel = Geo.metersPerPixel(this.zoom);

        // Size of the half-viewport in meters at current zoom
        this.size.meters = {
            x: this.size.css.width * this.meters_per_pixel,
            y: this.size.css.height * this.meters_per_pixel
        };

        // Center of viewport in meters, and tile
        let [x, y] = Geo.latLngToMeters([this.center.lng, this.center.lat]);
        this.center.meters = { x, y };

        this.center.tile = Geo.tileForMeters([this.center.meters.x, this.center.meters.y], this.tile_zoom);

        // Bounds in meters
        // TODO: a real latitude projection to account for projection
        this.bounds = {
            sw: {
                x: this.center.meters.x - this.size.meters.x / 2,
                y: this.center.meters.y - this.size.meters.y / 2
            },
            ne: {
                x: this.center.meters.x + this.size.meters.x / 2,
                y: this.center.meters.y + this.size.meters.y / 2
            }
        };
        this.scene.tile_manager.updateTilesForView();
        if (!this.panning) {
            this.trigger('moveend');
        }
    }

    findVisibleTileCoordinates() {
        if (!this.bounds) {
            return [];
        }

        let z = this.tile_zoom;
        let sw = Geo.tileForMeters([this.bounds.sw.x, this.bounds.sw.y], z);
        let ne = Geo.tileForMeters([this.bounds.ne.x, this.bounds.ne.y], z);

        let range = [
            sw.x - this.buffer, ne.x + this.buffer, // x
            ne.y - this.buffer, sw.y + this.buffer  // y
        ];

        if (this.wrap === false) { // prevent tiles from wrapping across antimeridian
            let tmax = (1 << z) - 1; // max xy tile number for this zoom
            range = range.map(v => Math.min(Math.max(0, v), tmax));
        }

        let coords = [];
        for (let x = range[0]; x <= range[1]; x++) {
            for (let y = range[2]; y <= range[3]; y++) {
                coords.push(TileID.coord({ x, y, z }));
            }
        }
        return coords;
    }

    // Remove tiles too far outside of view
    pruneTilesForView() {
        // TODO: will this function ever be called when view isn't ready?
        if (!this.ready()) {
            return;
        }

        // Remove tiles that are a specified # of tiles outside of the viewport border
        let border_tiles = [
            Math.ceil((Math.floor(this.size.css.width / Geo.tile_size) + 2) / 2),
            Math.ceil((Math.floor(this.size.css.height / Geo.tile_size) + 2) / 2)
        ];

        this.scene.tile_manager.removeTiles(tile => {
            // Ignore visible tiles
            if (tile.visible || tile.isProxy()) {
                return false;
            }

            // Remove tiles outside given zoom that are still loading
            if (tile.loading && tile.style_z !== this.tile_zoom) {
                return true;
            }

            // Discard if too far from current zoom
            const zdiff = Math.abs(tile.style_z - this.tile_zoom);
            const preserve_tiles_within_zoom = (tile.preserve_tiles_within_zoom != null ?
                tile.preserve_tiles_within_zoom : this.preserve_tiles_within_zoom); // optionally tile source specific
            if (zdiff > preserve_tiles_within_zoom) {
                return true;
            }

            // Handle tiles at different zooms
            let coords = TileID.coordAtZoom(tile.coords, this.tile_zoom);

            // Discard tiles outside an area surrounding the viewport
            if (Math.abs(coords.x - this.center.tile.x) - border_tiles[0] > this.buffer) {
                log('trace', `View: remove tile ${tile.key} (as ${coords.x}/${coords.y}/${this.tile_zoom}) for being too far out of visible area ***`);
                return true;
            }
            else if (Math.abs(coords.y - this.center.tile.y) - border_tiles[1] > this.buffer) {
                log('trace', `View: remove tile ${tile.key} (as ${coords.x}/${coords.y}/${this.tile_zoom}) for being too far out of visible area ***`);
                return true;
            }
            return false;
        });
    }

    // Allocate model-view matrices
    // 64-bit versions are for CPU calcuations
    // 32-bit versions are downsampled and sent to GPU
    createMatrices() {
        this.matrices = {};
        this.matrices.model = new Float64Array(16);
        this.matrices.model32 = new Float32Array(16);
        this.matrices.model_view = new Float64Array(16);
        this.matrices.model_view32 = new Float32Array(16);
        this.matrices.normal = new Float64Array(9);
        this.matrices.normal32 = new Float32Array(9);
        this.matrices.inverse_normal32 = new Float32Array(9);
    }

    // Calculate and set model/view and normal matrices for a tile
    setupTile(tile, program) {
        // Tile-specific state
        // TODO: calc these once per tile (currently being needlessly re-calculated per-tile-per-style)
        tile.setupProgram(this.matrices, program);

        // Model-view and normal matrices
        this.camera.setupMatrices(this.matrices, program);
    }

    // Set general uniforms that must be updated once per program
    setupProgram(program) {
        program.uniform('2fv', 'u_resolution', [this.size.device.width, this.size.device.height]);
        program.uniform('3fv', 'u_map_position', [this.center.meters.x, this.center.meters.y, this.zoom]);
        program.uniform('1f', 'u_meters_per_pixel', this.meters_per_pixel);
        program.uniform('1f', 'u_device_pixel_ratio', Utils.device_pixel_ratio);
        program.uniform('1f', 'u_view_pan_snap_timer', this.pan_snap_timer);
        program.uniform('1i', 'u_view_panning', this.panning);

        this.camera.setupProgram(program);
    }

    // View requires some animation, such as after panning stops
    isAnimating() {
        return (this.pan_snap_timer <= VIEW_PAN_SNAP_TIME);
    }

}
