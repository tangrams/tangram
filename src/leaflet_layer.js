import Utils from './utils';
import Scene from './scene';

import log from 'loglevel';

// Exports must appear outside a function, but will only be defined in main thread (below)
export var LeafletLayer;
export function leafletLayer(options) {
    return new LeafletLayer(options);
}

// Leaflet layer functionality is only defined in main thread

if (Utils.isMainThread) {

    LeafletLayer = L.GridLayer.extend({

        initialize: function (options) {
            // Defaults
            options.unloadInvisibleTiles = options.unloadInvisibleTiles || false;
            options.updateWhenIdle = options.updateWhenIdle || false;

            L.setOptions(this, options);
            this.createScene();
            this.hooks = {};
            this._updating_tangram = false;

            // Force leaflet zoom animations off
            this._zoomAnimated = false;
        },

        createScene: function () {
            this.scene = Scene.create({
                source: this.options.source,
                config: this.options.scene
            }, {
                numWorkers: this.options.numWorkers,
                preUpdate: this.options.preUpdate,
                postUpdate: this.options.postUpdate,
                logLevel: this.options.logLevel,
                // advanced option, app will have to manually called scene.update() per frame
                disableRenderLoop: this.options.disableRenderLoop,
                // advanced option, will require library to be served as same host as page
                allowCrossDomainWorkers: this.options.allowCrossDomainWorkers
            });
        },

        // Finish initializing scene and setup events when layer is added to map
        onAdd: function () {
            if (!this.scene) {
                this.createScene();
            }

            L.GridLayer.prototype.onAdd.apply(this, arguments);

            this.hooks.tileunload = (event) => {
                // TODO: not expecting leaflet to fire this event for tiles that simply pan
                // out of bounds when 'unloadInvisibleTiles' option is set, but it's firing
                // since upgrading to latest master branch - force-checking for now
                if (this.options.unloadInvisibleTiles) {
                    var tile = event.tile;
                    var key = tile.getAttribute('data-tile-key');
                    this.scene.removeTile(key);
                }
            };
            this.on('tileunload', this.hooks.tileunload);

            this.hooks.resize = () => {
                this._updating_tangram = true;
                var size = this._map.getSize();
                this.scene.resizeMap(size.x, size.y);
                this._updating_tangram = false;
            };
            this._map.on('resize', this.hooks.resize);

            this.hooks.move = () => {
                this._updating_tangram = true;
                var view = this._map.getCenter();
                view.zoom = this._map.getZoom();

                var changed = this.scene.setView(view);
                if (changed) {
                    this.scene.immediateRedraw();
                }
                this._updating_tangram = false;
            };
            this._map.on('move', this.hooks.move);

            this.hooks.zoomstart = () => {
                this._updating_tangram = true;
                this.scene.startZoom();
                this._updating_tangram = false;
            };
            this._map.on('zoomstart', this.hooks.zoomstart);

            this.hooks.dragstart = () => {
                this.scene.panning = true;
            };
            this._map.on('dragstart', this.hooks.dragstart);

            this.hooks.dragend = () => {
                this.scene.panning = false;
            };
            this._map.on('dragend', this.hooks.dragend);

            // Force leaflet zoom animations off
            this._map._zoomAnimated = false;

            // Canvas element will be inserted after map container (leaflet transforms shouldn't be applied to the GL canvas)
            // TODO: find a better way to deal with this? right now GL map only renders correctly as the bottom layer
            this.scene.container = this._map.getContainer();

            // Initial view
            var view = this._map.getCenter();
            view.zoom = this._map.getZoom();
            this.scene.setView(view);

            // Subscribe to tangram events
            this.scene.subscribe({
                move: this.onTangramViewUpdate.bind(this)
            });

            // Subscribe to tangram events
            this.scene.subscribe({
                // Add one or more event hooks as:
                // event: function() { ... }
                // e.g.:
                // move: () => { console.log('tangram scene moved'); }
            });

            // Use leaflet's existing event system as the callback mechanism
            this.scene.init().then(() => {
                log.debug('Scene.init() succeeded');
                this.fire('init');
            }, (error) => {
                log.error('Scene.init() failed with error:', error);
                throw error;
            });
        },

        onRemove: function () {
            L.GridLayer.prototype.onRemove.apply(this, arguments);

            this.off('tileunload', this.hooks.tileunload);
            this._map.off('resize', this.hooks.resize);
            this._map.off('move', this.hooks.move);
            this._map.off('zoomstart', this.hooks.zoomstart);
            this._map.off('dragstart', this.hooks.dragstart);
            this._map.off('dragend', this.hooks.dragend);
            this.hooks = {};

            if (this.scene) {
                this.scene.destroy();
                this.scene = null;
            }
        },

        createTile: function (coords) {
            var div = document.createElement('div');
            this.scene.loadTile(coords, { debugElement: div });
            return div;
        },

        onTangramViewUpdate: function () {
            if (!this._map || this._updating_tangram) {
                return;
            }
            this._updating_tangram = true;

            var zoom = this._map.getZoom();
            var center = this._map.getCenter();

            this._map.setView([scene.center.lat, scene.center.lng], scene.zoom, { animate: false });
            this._updating_tangram = false;
        },

        render: function () {
            if (!this.scene) {
                return;
            }
            this.scene.update();
        }

    });
}
