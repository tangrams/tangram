import Geo from './geo';
import Tile from './tile';
import Utils from './utils/utils';
import subscribeMixin from './utils/subscribe';

import log from 'loglevel';

export default class View {

    constructor(scene, options) {
        subscribeMixin(this);

        this.scene = scene;

        this.zoom = null;
        this.center = null;
        this.bounds = null;
        this.meters_per_pixel = null;

        this.panning = false;
        this.zooming = false;
        this.zoom_direction = 0;

        // Size of viewport in CSS pixels, device pixels, and mercator meters
        this.size = {
            css: {},
            device: {},
            meters: {}
        };
        this.aspect = null;

        this.buffer = 0;
        this.continuous_zoom = (typeof options.continuousZoom === 'boolean') ? options.continuousZoom : true;
        this.tile_simplification_level = 0; // level-of-detail downsampling to apply to tile loading
        this.preserve_tiles_within_zoom = 1;
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
    setView({ lng, lat, zoom } = {}) {
        var changed = false;

        // Set center
        if (typeof lng === 'number' && typeof lat === 'number') {
            if (!this.center || lng !== this.center.lng || lat !== this.center.lat) {
                changed = true;
                this.center = { lng: Geo.wrapLng(lng), lat };
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

    setZoom(zoom) {
        if (this.zooming) {
            this.zooming = false;
        }
        else {
            this.last_zoom = this.zoom;
        }

        let last_tile_zoom = this.tile_zoom;
        let tile_zoom = this.tileZoom(zoom);
        if (!this.continuous_zoom) {
            zoom = tile_zoom;
        }

        if (tile_zoom !== last_tile_zoom) {
            // Remove tiles outside current zoom that are still loading
            this.scene.tile_manager.removeTiles(tile => {
                if (tile.loading && this.tileZoom(tile.coords.z) !== tile_zoom) {
                    log.trace(`removed ${tile.key} (was loading, but outside current zoom)`);
                    return true;
                }
            });

            this.zoom_direction = tile_zoom > last_tile_zoom ? 1 : -1;
        }

        this.last_zoom = this.zoom;
        this.zoom = zoom;
        this.tile_zoom = tile_zoom;

        this.updateBounds();
        this.scene.requestRedraw();
    }

    startZoom() {
        this.last_zoom = this.zoom;
        this.zooming = true;
    }

    // Choose the base zoom level to use for a given fractional zoom
    baseZoom(zoom) {
        return Math.floor(zoom);
    }

    // For a given view zoom, what tile zoom should be loaded?
    tileZoom(view_zoom) {
        return this.baseZoom(view_zoom) - this.tile_simplification_level;
    }

    // For a given tile zoom, what style zoom should be used?
    styleZoom(tile_zoom) {
        return this.baseZoom(tile_zoom) + this.tile_simplification_level;
    }

    ready() {
        // TODO: better concept of "readiness" state?
        if (this.size.css == null || this.center == null || this.zoom == null) {
             return false;
        }
        return true;
    }

    // Calculate viewport bounds based on current center and zoom
    updateBounds() {
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

        this.scene.tile_manager.updateTilesForView(this.view);

        this.trigger('move');
        this.scene.requestRedraw(); // TODO automate via move event?
    }

    findVisibleTileCoordinates() {
        if (!this.bounds) {
            return [];
        }

        let z = this.tile_zoom;
        let sw = Geo.tileForMeters([this.bounds.sw.x, this.bounds.sw.y], z);
        let ne = Geo.tileForMeters([this.bounds.ne.x, this.bounds.ne.y], z);

        let coords = [];
        for (let x = sw.x - this.buffer; x <= ne.x + this.buffer; x++) {
            for (let y = ne.y - this.buffer; y <= sw.y + this.buffer; y++) {
                coords.push(Tile.coord({ x, y, z }));
            }
        }
        return coords;
    }

    // Remove tiles too far outside of view
    pruneTileCoordinatesForView() {
        // TODO: will this function ever be called when view isn't ready?
        if (!this.ready()) {
            return;
        }

        // Remove tiles that are a specified # of tiles outside of the viewport border
        let border_tiles = [
            Math.ceil((Math.floor(this.size.css.width / Geo.tile_size) + 2) / 2),
            Math.ceil((Math.floor(this.size.css.height / Geo.tile_size) + 2) / 2)
        ];
        let style_zoom = this.tileZoom(this.zoom);

        this.scene.tile_manager.removeTiles(tile => {
            // Ignore visible tiles
            if (tile.visible || tile.proxy) {
                return false;
            }

            // Discard if too far from current zoom
            let zdiff = Math.abs(tile.style_zoom - style_zoom);
            if (zdiff > this.preserve_tiles_within_zoom) {
                return true;
            }

            // Handle tiles at different zooms
            let coords = Tile.coordinateAtZoom(tile.coords, style_zoom);

            // Discard tiles outside an area surrounding the viewport
            if (Math.abs(coords.x - this.center.tile.x) - border_tiles[0] > this.buffer) {
                log.trace(`View: remove tile ${tile.key} (as ${coords.x}/${coords.y}/${style_zoom}) for being too far out of visible area ***`);
                return true;
            }
            else if (Math.abs(coords.y - this.center.tile.y) - border_tiles[1] > this.buffer) {
                log.trace(`View: remove tile ${tile.key} (as ${coords.x}/${coords.y}/${style_zoom}) for being too far out of visible area ***`);
                return true;
            }
            return false;
        });
    }

    setupProgram (program) {
        program.uniform('2f', 'u_resolution', this.size.device.width, this.size.device.height);
        program.uniform('3f', 'u_map_position', this.center.meters.x, this.center.meters.y, this.zoom);
        program.uniform('1f', 'u_meters_per_pixel', this.meters_per_pixel);
        program.uniform('1f', 'u_device_pixel_ratio', Utils.device_pixel_ratio);
    }

}
