import Geo from './geo';
import Tile from './tile';
import Camera from './camera';
import Utils from './utils/utils';
import subscribeMixin from './utils/subscribe';
import log from './utils/log';

export const VIEW_PAN_SNAP_TIME = 0.5;

export default class View {

    constructor (scene, options) {
        subscribeMixin(this);

        this.scene = scene;
        this.createMatrices();

        this.zoom = null;
        this.center = null;
        this.bounds = null;
        this.meters_per_pixel = null;

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
    reset () {
        this.createCamera();
    }

    // Create camera
    createCamera () {
        let active_camera = this.getActiveCamera();
        if (active_camera) {
            this.camera = Camera.create(active_camera, this, this.scene.config.cameras[active_camera]);
            this.camera.updateView();
        }
    }

    // Get active camera - for public API
    getActiveCamera () {
        if (this.scene.config && this.scene.config.cameras) {
            for (let name in this.scene.config.cameras) {
                if (this.scene.config.cameras[name].active) {
                    return name;
                }
            }

            // If no camera set as active, use first one
            let keys = Object.keys(this.scene.config.cameras);
            return keys.length && keys[0];
        }
    }

    // Set active camera and recompile - for public API
    setActiveCamera (name) {
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
    update () {
        if (this.camera != null && this.ready()) {
            this.camera.update();
        }
        this.pan_snap_timer = ((+new Date()) - this.panning_stop_at) / 1000;
        this.user_input_active = ((+new Date() - this.user_input_at) < this.user_input_timeout);
    }

    // Set logical pixel size of viewport
    setViewportSize (width, height) {
        this.size.css = { width, height };
        this.size.device = {
            width: Math.round(this.size.css.width * Utils.device_pixel_ratio),
            height: Math.round(this.size.css.height * Utils.device_pixel_ratio)
        };
        this.aspect = this.size.css.width / this.size.css.height;
        this.updateBounds();
    }

    // Set the map view, can be passed an object with lat/lng and/or zoom
    setView ({ lng, lat, zoom } = {}) {
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
            this.setZoom(zoom);
        }

        if (changed) {
            this.updateBounds();
        }
        return changed;
    }

    setZoom (zoom) {
        let last_tile_zoom = this.tile_zoom;
        let tile_zoom = this.baseZoom(zoom);
        if (!this.continuous_zoom) {
            zoom = tile_zoom;
        }

        if (tile_zoom !== last_tile_zoom) {
            this.zoom_direction = tile_zoom > last_tile_zoom ? 1 : -1;
        }

        this.zoom = zoom;
        this.tile_zoom = tile_zoom;

        this.updateBounds();
        this.scene.requestRedraw();
    }

    // Choose the base zoom level to use for a given fractional zoom
    baseZoom (zoom) {
        return Math.floor(zoom);
    }

    setPanning (panning) {
        this.panning = panning;
        if (!this.panning) {
            this.panning_stop_at = (+new Date());
        }
    }

    markUserInput () {
        this.user_input_at = (+new Date());
    }

    ready () {
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
    updateBounds () {
        if (!this.ready()) {
            return;
        }

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

        this.trigger('move');
        this.scene.requestRedraw(); // TODO automate via move event?
    }

    findVisibleTileCoordinates () {
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
                coords.push(Tile.coord({ x, y, z }));
            }
        }
        return coords;
    }

    // Remove tiles too far outside of view
    pruneTilesForView () {
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
            if (tile.loading && tile.style_zoom !== this.tile_zoom) {
                return true;
            }

            // Discard if too far from current zoom
            let zdiff = Math.abs(tile.style_zoom - this.tile_zoom);
            if (zdiff > this.preserve_tiles_within_zoom) {
                return true;
            }

            // Handle tiles at different zooms
            let coords = Tile.coordinateAtZoom(tile.coords, this.tile_zoom);

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
    createMatrices () {
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
    setupTile (tile, program) {
        // Tile-specific state
        // TODO: calc these once per tile (currently being needlessly re-calculated per-tile-per-style)
        tile.setupProgram(this.matrices, program);

        // Model-view and normal matrices
        this.camera.setupMatrices(this.matrices, program);
    }

    // Set general uniforms that must be updated once per program
    setupProgram (program) {
        program.uniform('2fv', 'u_resolution', [this.size.device.width, this.size.device.height]);
        program.uniform('3fv', 'u_map_position', [this.center.meters.x, this.center.meters.y, this.zoom]);
        program.uniform('1f', 'u_meters_per_pixel', this.meters_per_pixel);
        program.uniform('1f', 'u_device_pixel_ratio', Utils.device_pixel_ratio);
        program.uniform('1f', 'u_view_pan_snap_timer', this.pan_snap_timer);
        program.uniform('1i', 'u_view_panning', this.panning);

        this.camera.setupProgram(program);
    }

    // View requires some animation, such as after panning stops
    isAnimating () {
        return (this.pan_snap_timer <= VIEW_PAN_SNAP_TIME);
    }

}
