import Utils from './utils/utils';
import Scene from './scene';
import Geo from './geo';

import CSSMatrix from 'xcssmatrix';

// Exports must appear outside a function, but will only be defined in main thread (below)
export var LeafletLayer;
export function leafletLayer(options) {
    return new LeafletLayer(options);
}

// Leaflet layer functionality is only defined in main thread
if (Utils.isMainThread) {

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

            L.setOptions(this, options);
            this.createScene();
            this.hooks = {};
            this._updating_tangram = false;

            // Force leaflet zoom animations off
            this._zoomAnimated = false;
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
                var size = map.getSize();
                this.scene.resizeMap(size.x, size.y);
                this._updating_tangram = false;
            };
            map.on('resize', this.hooks.resize);

            this.hooks.move = () => {
                if (this._updating_tangram) {
                    return;
                }

                this._updating_tangram = true;
                var view = map.getCenter();
                view.zoom = Math.min(map.getZoom(), map.getMaxZoom() || Geo.max_zoom);

                this.scene.setView(view);
                this.scene.immediateRedraw();
                this.reverseTransform(map);
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

            // Canvas element will be inserted after map container (leaflet transforms shouldn't be applied to the GL canvas)
            // TODO: find a better way to deal with this? right now GL map only renders correctly as the bottom layer
            // this.scene.container = map.getContainer();
            this.scene.container = this.getContainer();

            // Initial view
            var view = map.getCenter();
            view.zoom = Math.min(map.getZoom(), map.getMaxZoom() || Geo.max_zoom);
            this.scene.setView(view);

            // Subscribe to tangram events
            this.scene.subscribe({
                move: this.onTangramViewUpdate.bind(this)
            });

            // Use leaflet's existing event system as the callback mechanism
            this.scene.load().then(() => {
                // make sure the expected scene is being initialized
                // can be another scene object if layer is removed and re-added before scene init completes
                if (this.scene === scene) {
                    // TODO: why is force-resize needed here?
                    var size = map.getSize();
                    this.scene.resizeMap(size.x, size.y);

                    var center = map.getCenter();
                    this.scene.setCenter(center.lng, center.lat, map.getZoom());
                    this.reverseTransform(map);
                }

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
                map.scrollWheelZoom._performZoom = function () {
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
                        map._move(map.getCenter(), zoom + delta);
                    } else {
                        // Re-centering code from Leaflet's map.setZoomAround() function
                        var latlng = this._lastMousePos,
                            newZoom = zoom + delta,
                            scale = map.getZoomScale(newZoom),
                            viewHalf = map.getSize().divideBy(2),
                            containerPoint = latlng instanceof L.Point ? latlng : map.latLngToContainerPoint(latlng),

                            centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
                            newCenter = map.containerPointToLatLng(viewHalf.add(centerOffset));

                        map._move(newCenter, newZoom);
                    }
                };
            }
        },

        onTangramViewUpdate: function () {
            if (!this._map || this._updating_tangram) {
                return;
            }
            this._updating_tangram = true;
            this._map.setView([this.scene.center.lat, this.scene.center.lng], this.scene.zoom, { animate: false });
            this._updating_tangram = false;
        },

        render: function () {
            if (!this.scene) {
                return;
            }
            this.scene.update();
        },

        // Reverse the CSS transform Leaflet applies to the layer, since Tangram's WebGL canvas
        // is expected to be 'absolutely' positioned.
        reverseTransform: function (map) {
            if (!map || !this.scene.canvas) {
                return;
            }

            var pane = map.getPanes().mapPane;
            var transform = pane.style.transform || pane.style['-webkit-transform'];
            var matrix = new CSSMatrix(transform).inverse();
            this.scene.canvas.style.transform = matrix;
            this.scene.canvas.style['-webkit-transform'] = matrix;
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

}
