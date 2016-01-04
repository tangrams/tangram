import Utils from './utils/utils';
import Scene from './scene';
import Geo from './geo';

// Exports must appear outside a function, but will only be defined in main thread (below)
export var LeafletLayer;
export function leafletLayer(options) {
    return extendLeaflet(options);
}

function extendLeaflet(options) {

    // If LeafletLayer is already defined when this is called just return that immediately
    // e.g. if you call leafletLayer multiple times (which is valid)
    if (typeof LeafletLayer !== 'undefined') {
        return new LeafletLayer(options);
    }

    // Leaflet layer functionality is only defined in main thread
    if (Utils.isMainThread) {

        let L = options.leaflet || window.L;

        // Determine if we are extending the leaflet 0.7.x TileLayer class, or the newer
        // leaflet 1.x GridLayer class.
        let layerBaseClass = L.GridLayer ? L.GridLayer : L.TileLayer;
        let leafletVersion = layerBaseClass === L.GridLayer ? '1.x' : '0.7.x';
        let layerClassConfig = {};

        // If extending leaflet 0.7.x TileLayer, make add/remove tile no ops
        if (layerBaseClass === L.TileLayer) {
            layerClassConfig._addTile = function(){};
            layerClassConfig._removeTile = function(){};
        }

        // Define custom layer methods
        Object.assign(layerClassConfig, {

            initialize: function (options) {
                // Defaults
                options.showDebug = (!options.showDebug ? false : true);
                options.wheelDebounceTime = options.wheelDebounceTime || 40;

                L.setOptions(this, options);
                this.createScene();
                this.hooks = {};
                this._updating_tangram = false;

                // Force leaflet zoom animations off
                this._zoomAnimated = false;

                this.debounceViewReset = Utils.debounce(() => {
                    this._map.fire('zoomend');
                    this._map.fire('moveend');
                }, this.options.wheelDebounceTime);
            },

            createScene: function () {
                this.scene = Scene.create(
                    this.options.scene,
                    {
                        numWorkers: this.options.numWorkers,
                        preUpdate: this.options.preUpdate,
                        postUpdate: this.options.postUpdate,
                        continuousZoom: (LeafletLayer.leafletVersion === '1.x'),
                        highDensityDisplay: this.options.highDensityDisplay,
                        logLevel: this.options.logLevel,
                        // advanced option, app will have to manually called scene.update() per frame
                        disableRenderLoop: this.options.disableRenderLoop,
                        // advanced option, will require library to be served as same host as page
                        allowCrossDomainWorkers: this.options.allowCrossDomainWorkers
                    });
            },

            // Finish initializing scene and setup events when layer is added to map
            onAdd: function (map) {
                if (!this.scene) {
                    this.createScene();
                }

                layerBaseClass.prototype.onAdd.apply(this, arguments);

                this.hooks.resize = () => {
                    this._updating_tangram = true;
                    this.updateSize();
                    this._updating_tangram = false;
                };
                map.on('resize', this.hooks.resize);

                this.hooks.move = () => {
                    if (this._updating_tangram) {
                        return;
                    }

                    this._updating_tangram = true;
                    var view = map.getCenter();
                    view.zoom = Math.min(map.getZoom(), map.getMaxZoom() || Geo.default_max_zoom);

                    this.scene.setView(view);
                    this.scene.immediateRedraw();
                    this.reverseTransform();
                    this._updating_tangram = false;
                };
                map.on('move', this.hooks.move);

                this.hooks.zoomstart = () => {
                    if (this._updating_tangram) {
                        return;
                    }

                    this._updating_tangram = true;
                    this.scene.startZoom();
                    this._updating_tangram = false;
                };
                map.on('zoomstart', this.hooks.zoomstart);

                this.hooks.dragstart = () => {
                    this.scene.panning = true;
                };
                map.on('dragstart', this.hooks.dragstart);

                this.hooks.dragend = () => {
                    this.scene.panning = false;
                };
                map.on('dragend', this.hooks.dragend);

                // Force leaflet zoom animations off
                map._zoomAnimated = false;

                // Modify default leaflet scroll wheel behavior
                this.modifyScrollWheelBehavior(map);

                // Add GL canvas to layer container
                this.scene.container = this.getContainer();

                // Initial view
                this.updateView();

                // Subscribe to tangram events
                this.scene.subscribe({
                    move: this.onTangramViewUpdate.bind(this)
                });

                // Use leaflet's existing event system as the callback mechanism
                this.scene.load().then(() => {
                    this._updating_tangram = true;

                    this.updateSize();
                    this.updateView();
                    this.reverseTransform();

                    this._updating_tangram = false;

                    this.fire('init');
                }).catch(error => {
                    this.fire('error', error);
                });
            },

            onRemove: function (map) {
                layerBaseClass.prototype.onRemove.apply(this, arguments);

                map.off('resize', this.hooks.resize);
                map.off('move', this.hooks.move);
                map.off('zoomstart', this.hooks.zoomstart);
                map.off('dragstart', this.hooks.dragstart);
                map.off('dragend', this.hooks.dragend);
                this.hooks = {};

                if (this.scene) {
                    this.scene.destroy();
                    this.scene = null;
                }
            },

            createTile: function (coords) {
                var key = coords.x + '/' + coords.y + '/' + coords.z;
                var div = document.createElement('div');
                div.setAttribute('data-tile-key', key);
                div.style.width = '256px';
                div.style.height = '256px';

                if (this.options.showDebug) {
                    var debug_overlay = document.createElement('div');
                    debug_overlay.textContent = key;
                    debug_overlay.style.position = 'absolute';
                    debug_overlay.style.left = 0;
                    debug_overlay.style.top = 0;
                    debug_overlay.style.color = 'white';
                    debug_overlay.style.fontSize = '16px';
                    debug_overlay.style.textOutline = '1px #000000';
                    debug_overlay.style.padding = '8px';

                    div.appendChild(debug_overlay);
                    div.style.borderStyle = 'solid';
                    div.style.borderColor = 'white';
                    div.style.borderWidth = '1px';
                }

                return div;
            },

            // Modify leaflet's default scroll wheel behavior to have a much more sensitve/continuous zoom
            // Note: this should be deprecated once leaflet continuous zoom is more widely used and the
            // default behavior is presumably improved
            modifyScrollWheelBehavior: function (map) {
                if (this.scene.continuous_zoom && map.scrollWheelZoom && this.options.modifyScrollWheel !== false) {
                    let layer = this;
                    let enabled = map.scrollWheelZoom.enabled();
                    if (enabled) {
                        map.scrollWheelZoom.disable(); // disable before modifying
                    }

                    // modify prototype and current instance, so add/remove hooks work on existing references
                    L.Map.ScrollWheelZoom._onWheelScroll = map.scrollWheelZoom._onWheelScroll = function(e) {
                        // modify to skip debounce, as it seems to cause animation-sync issues in Chrome
                        // with Tangram continuous rendering
                        this._delta += L.DomEvent.getWheelDelta(e);
                        this._lastMousePos = this._map.mouseEventToContainerPoint(e);
                        this._performZoom();
                        L.DomEvent.stop(e);
                    };

                    L.Map.ScrollWheelZoom._performZoom = map.scrollWheelZoom._performZoom = function () {
                        var map = this._map,
                            delta = this._delta,
                            zoom = map.getZoom();

                        map.stop(); // stop panning and fly animations if any

                        // NOTE: this is the only real modification to default leaflet behavior
                        delta /= 40;

                        delta = Math.max(Math.min(delta, 4), -4);
                        delta = map._limitZoom(zoom + delta) - zoom;

                        this._delta = 0;
                        this._startTime = null;

                        if (!delta) { return; }

                        if (map.options.scrollWheelZoom === 'center') {
                            map.setZoom(zoom + delta);
                        } else {
                            map.setZoomAround(this._lastMousePos, zoom + delta);
                        }

                        layer.debounceViewReset();
                    };

                    if (enabled) {
                        map.scrollWheelZoom.enable(); // re-enable after modifying
                    }
                }
            },

            updateView: function () {
                var view = this._map.getCenter();
                view.zoom = Math.min(this._map.getZoom(), this._map.getMaxZoom() || Geo.default_max_zoom);
                this.scene.setView(view);
            },

            updateSize: function () {
                var size = this._map.getSize();
                this.scene.resizeMap(size.x, size.y);
            },

            onTangramViewUpdate: function () {
                if (!this._map || this._updating_tangram) {
                    return;
                }
                this._updating_tangram = true;
                this._map.setView([this.scene.center.lat, this.scene.center.lng], this.scene.zoom, { animate: false });
                this.reverseTransform();
                this._updating_tangram = false;
            },

            render: function () {
                if (!this.scene) {
                    return;
                }
                this.scene.update();
            },

            // Reverse the CSS positioning Leaflet applies to the layer, since Tangram's WebGL canvas
            // is expected to be 'absolutely' positioned.
            reverseTransform: function () {
                if (!this._map || !this.scene || !this.scene.container) {
                    return;
                }

                var top_left = this._map.containerPointToLayerPoint([0, 0]);
                L.DomUtil.setPosition(this.scene.container, top_left);
            }

        });

        // Create the layer class
        LeafletLayer = layerBaseClass.extend(layerClassConfig);

        // Polyfill some 1.0 methods
        if (typeof LeafletLayer.remove !== 'function') {
            LeafletLayer.prototype.remove = function() {
                if (this._map) {
                    this._map.removeLayer(this);
                }
                this.fire('remove');
            };
        }

        LeafletLayer.layerBaseClass = layerBaseClass;
        LeafletLayer.leafletVersion = leafletVersion;

        return new LeafletLayer(options);
    }
}
