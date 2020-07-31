import Thread from './utils/thread';
import Scene from './scene/scene';
import Geo from './utils/geo';
import debounce from './utils/debounce';
import {mergeDebugSettings} from './utils/debug_settings';

// Exports must appear outside a function, but will only be defined in main thread (below)
export var LeafletLayer;
export function leafletLayer(options) {
    return extendLeaflet(options);
}

// save references to overloaded Leaflet methods
const originalHandlers = {
    map: {},
    scrollWheelZoom: {},
    doubleClickZoom: {}
};

function extendLeaflet(options) {

    // If LeafletLayer is already defined when this is called just return that immediately
    // e.g. if you call leafletLayer multiple times (which is valid)
    if (typeof LeafletLayer !== 'undefined') {
        return new LeafletLayer(options);
    }

    // Leaflet layer functionality is only defined in main thread
    if (Thread.is_main) {

        let L = options.leaflet || window.L;

        // Determine if we are extending the leaflet 0.7.x TileLayer class, or the newer
        // leaflet 1.x GridLayer class.
        let layerBaseClass = L.GridLayer ? L.GridLayer : L.TileLayer;
        let leafletVersion = layerBaseClass === L.GridLayer ? '1.x' : '0.7.x';
        let layerClassConfig = {};
        let setZoomAroundNoMoveEnd; // alternate zoom functions defined below

        // If extending leaflet 0.7.x TileLayer, additional modifications are needed
        if (layerBaseClass === L.TileLayer) {
            layerClassConfig._addTile = function(){};
            layerClassConfig._removeTile = function(){};
            layerClassConfig._reset = function() {
                layerBaseClass.prototype._reset.apply(this, arguments);
                // re-add the canvas since base class `viewreset` event can remove it
                if (this.scene && this.scene.container && this.scene.canvas) {
                    this.scene.container.appendChild(this.scene.canvas);
                }
            };
        }

        // Define custom layer methods
        Object.assign(layerClassConfig, {

            initialize (options) {
                // Defaults
                options.showDebug = (!options.showDebug ? false : true);

                L.setOptions(this, options);
                this.updateTangramDebugSettings();
                this.createScene();
                this.hooks = {};
                this._updating_tangram = false;
            },

            createScene () {
                this.scene = Scene.create(
                    this.options.scene,
                    {
                        numWorkers: this.options.numWorkers,
                        preUpdate: this.options.preUpdate,
                        postUpdate: this.options.postUpdate,
                        continuousZoom: (LeafletLayer.leafletVersion === '1.x'),
                        wrapView: (this.options.noWrap === true ? false : true),
                        highDensityDisplay: this.options.highDensityDisplay,
                        logLevel: this.options.logLevel,
                        introspection: this.options.introspection, // turn scene introspection on/off
                        webGLContextOptions: this.options.webGLContextOptions, // override/supplement WebGL context options
                        disableRenderLoop: this.options.disableRenderLoop // app must call scene.update() per frame
                    });
            },

            // Finish initializing scene and setup events when layer is added to map
            onAdd (map) {
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

                    this.scene.view.setPanning(true);
                    var view = map.getCenter();
                    view.zoom = Math.max(Math.min(map.getZoom(), map.getMaxZoom() || Geo.default_view_max_zoom), map.getMinZoom());

                    this.scene.view.setView(view);
                    if (this._mapLayerCount > 1) {
                        // if there are other map pane layers active, redraw immediately to stay in better visual sync
                        // otherwise, wait until next regular animation loop iteration
                        this.scene.immediateRedraw();
                    }

                    this._updating_tangram = false;
                };
                map.on('move', this.hooks.move);

                this.hooks.moveend = () => {
                    this.scene.view.setPanning(false);
                    this.scene.requestRedraw();
                };
                map.on('moveend', this.hooks.moveend);

                this.hooks.drag = () => {
                    this.scene.view.markUserInput();
                };
                map.on('drag', this.hooks.drag);

                // keep Tangram layer in sync with view via mutation observer
                this._map_pane_observer = new MutationObserver(mutations => {
                    mutations.forEach(() => this.reverseTransform());
                });
                this._map_pane_observer.observe(map.getPanes().mapPane, { attributes: true });

                // Modify default Leaflet behaviors
                this.modifyScrollWheelBehavior(map);
                this.modifyZoomBehavior(map);

                this.trackMapLayerCounts(map);

                // Setup feature selection
                this.setupSelectionEventHandlers(map);
                this.setSelectionEvents(this.options.events, { radius: this.options.selectionRadius });

                // Add GL canvas to layer container
                this.scene.container = this.getContainer();
                this.updateSize();

                // Initial view
                this.updateView();
                this.resizeOnFirstVisible();

                // Subscribe to tangram events
                this.scene.subscribe({
                    move: this.onTangramViewUpdate.bind(this)
                });

                // Use leaflet's existing event system as the callback mechanism
                this.scene.load(
                    this.options.scene,
                    {
                        base_path: this.options.sceneBasePath,
                        file_type: this.options.sceneFileType,
                        blocking: false
                    }).then(() => {

                    if (!this.options.attribution) {
                        for (const [, value] of Object.entries(this.scene.config.sources)) {
                            if (value.attribution) {
                                map.attributionControl.addAttribution(value.attribution);
                            }
                        }
                    }

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

            onRemove (map) {
                layerBaseClass.prototype.onRemove.apply(this, arguments);

                map.off('layeradd layerremove overlayadd overlayremove', this._updateMapLayerCount);
                map.off('resize', this.hooks.resize);
                map.off('move', this.hooks.move);
                map.off('moveend', this.hooks.moveend);
                map.off('drag', this.hooks.drag);
                map.off('click', this.hooks.click);
                map.off('mousemove', this.hooks.mousemove);
                map.off('mouseout', this.hooks.mouseout);
                document.removeEventListener('visibilitychange', this.hooks.visibilitychange);
                this.hooks = {};

                this._map_pane_observer.disconnect();

                if (this.scene) {
                    this.scene.destroy();
                    this.scene = null;
                }
            },

            createTile (coords) {
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

            // Modify leaflet's default scroll wheel behavior to render frames more frequently
            // (should generally lead to smoother scroll with Tangram frame re-render)
            modifyScrollWheelBehavior (map) {
                if (this.scene.view.continuous_zoom && map.scrollWheelZoom && this.options.modifyScrollWheel !== false) {
                    map.options.zoomSnap = 0;

                    const enabled = map.scrollWheelZoom.enabled();
                    map.scrollWheelZoom.disable();

                    // Chrome and Safari have smoother scroll-zoom without actively throttling the mouse wheel,
                    // while FF and Edge/IE do better with throttling.
                    // TODO: may be related to syncing differences with requestAnimationFrame loop, investigate further
                    if (L.Browser.chrome || L.Browser.safari) {
                        map.scrollWheelZoom._onWheelScroll = function (e) {
                            var delta = L.DomEvent.getWheelDelta(e);
                            this._delta += delta;
                            this._lastMousePos = this._map.mouseEventToContainerPoint(e);
                            this._performZoom();
                            L.DomEvent.stop(e);
                        };
                    }
                    else {
                        map.options.wheelDebounceTime = 20; // better default for FF and Edge/IE
                    }

                    const debounceMoveEnd = debounce(
                        function(map) {
                            map._moveEnd(true);
                            map.fire('viewreset'); // keep other leaflet layers in sync
                        },
                        map.options.wheelDebounceTime * 2
                    );

                    // save reference to overloaded method
                    if (!originalHandlers.scrollWheelZoom._performZoom) {
                        originalHandlers.scrollWheelZoom._performZoom = map.scrollWheelZoom._performZoom;
                    }

                    var layer = this;
                    map.scrollWheelZoom._performZoom = function () {
                        if (this._map !== layer._map) { // only call overloaded method on a tangram layer
                            originalHandlers.scrollWheelZoom._performZoom.call(this);
                            return;
                        }

                        var map = this._map,
                            zoom = map.getZoom();

                        map._stop(); // stop panning and fly animations if any

                        var delta = this._delta / (this._map.options.wheelPxPerZoomLevel * 4);
                        this._delta = 0;

                        if ((zoom + delta) >= this._map.getMaxZoom()) {
                            delta = this._map.getMaxZoom() - zoom; // don't go past max zoom
                        }
                        else if ((zoom + delta) <= this._map.getMinZoom()) {
                            delta = this._map.getMinZoom() - zoom; // don't go past min zoom
                        }

                        if (!delta) { return; }

                        if (map.options.scrollWheelZoom === 'center') {
                            setZoomAroundNoMoveEnd(layer, map.getCenter(), zoom + delta);
                        } else {
                            setZoomAroundNoMoveEnd(layer, this._lastMousePos, zoom + delta);
                        }
                        debounceMoveEnd(map);
                    };

                    if (enabled) {
                        map.scrollWheelZoom.enable();
                    }
                }
            },

            // Modify leaflet's default double-click and zoom in/out behavior, to better keep Tangram layer in sync with marker/SVG layers
            modifyZoomBehavior (map) {
                if (this.scene.view.continuous_zoom && this.options.modifyZoomBehavior !== false) {
                    var layer = this;

                    // Simplified version of Leaflet's flyTo, for short animations zooming around a point
                    const flyAround = function (layer, targetCenter, targetZoom) {
                        map._stop();

                        var startZoom = map._zoom;

                        targetCenter = L.latLng(targetCenter);
                        targetZoom = targetZoom === undefined ? startZoom : targetZoom;
                        targetZoom = Math.min(targetZoom, map.getMaxZoom()); // don't go past max zoom

                        var start = Date.now(),
                            duration = 75;

                        function frame() {
                            var t = (Date.now() - start) / duration;

                            if (t <= 1) {
                                // reuse internal flyTo frame to ensure these animations are canceled like others
                                map._flyToFrame = L.Util.requestAnimFrame(frame, map);
                                setZoomAroundNoMoveEnd(layer, targetCenter, startZoom + (targetZoom - startZoom) * t);
                            } else {
                                setZoomAroundNoMoveEnd(layer, targetCenter, targetZoom)
                                    ._moveEnd(true);
                            }
                        }

                        map._moveStart(true);

                        frame.call(map);
                        return map;
                    };

                    // Modify the double-click zoom handler to do a short zoom animation
                    // See original: https://github.com/Leaflet/Leaflet/blob/cf518ff1a5e0e54a2f63faa144aeaa50888e0bc6/src/map/handler/Map.DoubleClickZoom.js#L29
                    if (map.doubleClickZoom) {
                        const enabled = map.doubleClickZoom.enabled();
                        map.doubleClickZoom.disable();

                        // save reference to overloaded method
                        if (!originalHandlers.doubleClickZoom._onDoubleClick) {
                            originalHandlers.doubleClickZoom._onDoubleClick = map.doubleClickZoom._onDoubleClick;
                        }

                        map.doubleClickZoom._onDoubleClick = function (e) {
                            if (this._map !== layer._map) { // only call overloaded method on a tangram layer
                                originalHandlers.doubleClickZoom._onDoubleClick.call(this, e);
                                return;
                            }

                            var map = this._map,
                                oldZoom = map.getZoom(),
                                delta = map.options.zoomDelta,
                                zoom = e.originalEvent.shiftKey ? oldZoom - delta : oldZoom + delta;

                            if (map.options.doubleClickZoom === 'center') {
                                flyAround(layer, map.getCenter(), zoom);
                            } else {
                                flyAround(layer, map.containerPointToLatLng(e.containerPoint), zoom);
                            }
                        };

                        if (enabled) {
                            map.doubleClickZoom.enable();
                        }
                    }

                    // Modify the zoom in/out behavior
                    // NOTE: this will NOT fire the 'zoomanim' event, so this modification should be disabled for apps that depend on it
                    // See original: https://github.com/Leaflet/Leaflet/blob/cf518ff1a5e0e54a2f63faa144aeaa50888e0bc6/src/map/Map.js#L1610
                    if (map._zoomAnimated) {
                        // save reference to overloaded method
                        if (!originalHandlers.map._animateZoom) {
                            originalHandlers.map._animateZoom = map._animateZoom;
                        }

                        map._animateZoom = function (center, zoom, startAnim, noUpdate) {
                            if (this !== layer._map) { // only call overloaded method on a tangram layer
                                originalHandlers.map._animateZoom.call(this, center, zoom, startAnim, noUpdate);
                                return;
                            }

                            if (startAnim) {
                                this._animatingZoom = true;

                                // remember what center/zoom to set after animation
                                this._animateToCenter = center;
                                this._animateToZoom = zoom;

                                // replace leaflet CSS animation with Tangram animation to keep markers/SVG in sync
                                // (this is a workaround from not being able to easily track/sync to on-going CSS animations in JS)
                                flyAround(layer, center, zoom);
                            }

                            // Work around webkit not firing 'transitionend', see https://github.com/Leaflet/Leaflet/issues/3689, 2693
                            setTimeout(L.Util.bind(this._onZoomTransitionEnd, this), 250);
                        };
                    }
                }
            },

            updateView () {
                var view = this._map.getCenter();
                view.zoom = Math.max(Math.min(this._map.getZoom(), this._map.getMaxZoom() || Geo.default_view_max_zoom), this._map.getMinZoom());
                this.scene.view.setView(view);
            },

            updateSize () {
                var size = this._map.getSize();
                this.scene.resizeMap(size.x, size.y);
            },

            resizeOnFirstVisible () {
                let first_visibility = true;
                this.hooks.visibilitychange = () => {
                    if (first_visibility) {
                        first_visibility = false;
                        this.updateSize();
                    }
                };

                document.addEventListener('visibilitychange', this.hooks.visibilitychange);
            },

            onTangramViewUpdate () {
                if (!this._map || this._updating_tangram) {
                    return;
                }

                // View changed?
                let map_center = this._map.getCenter();
                let view_center = this.scene.view.center;
                if (map_center.lng === view_center.lng &&
                    map_center.lat === view_center.lat &&
                    this._map.getZoom() === this.scene.view.zoom) {
                    return;
                }

                this._updating_tangram = true;
                this._map.setView([this.scene.view.center.lat, this.scene.view.center.lng], this.scene.view.zoom, { animate: false });
                this._updating_tangram = false;
            },

            render () {
                if (!this.scene) {
                    return;
                }
                this.scene.update();
            },

            // Reverse the CSS positioning Leaflet applies to the layer, since Tangram's WebGL canvas
            // is expected to be 'absolutely' positioned.
            reverseTransform () {
                if (!this._map || !this.scene || !this.scene.container) {
                    return;
                }

                var top_left = this._map.containerPointToLayerPoint([0, 0]);
                L.DomUtil.setPosition(this.scene.container, top_left);
            },

            // Tie Leaflet event handlers to Tangram feature selection
            setupSelectionEventHandlers (map) {
                this._selection_events = {};
                this._selection_radius = null; // optional radius

                this.hooks.click = (event) => {
                    if (typeof this._selection_events.click === 'function') {
                        this.scene.getFeatureAt(event.containerPoint, { radius: this._selection_radius }).
                            then(selection => {
                                let results = Object.assign({}, selection, { leaflet_event: event });
                                this._selection_events.click(results);
                            });
                    }
                };
                map.on('click', this.hooks.click);

                this.hooks.mousemove = (event) => {
                    if (typeof this._selection_events.hover === 'function') {
                        this.scene.getFeatureAt(event.containerPoint, { radius: this._selection_radius }).
                            then(selection => {
                                let results = Object.assign({}, selection, { leaflet_event: event });
                                this._selection_events.hover(results);
                            });
                    }
                };
                map.on('mousemove', this.hooks.mousemove);

                this.hooks.mouseout = (event) => {
                    // When mouse leaves map, send an additional selection event to indicate no feature is selected
                    if (typeof this._selection_events.hover === 'function') {
                        this._selection_events.hover({ changed: true, leaflet_event: event });
                    }
                };
                map.on('mouseout', this.hooks.mouseout);
            },

            // Set user-defined handlers for feature selection events
            // Currently only one handler can be defined for each event type
            // Event types are: `click`, `hover` (leaflet `mousemove`)
            setSelectionEvents (events, { radius } = {}) {
                this._selection_events = Object.assign(this._selection_events, events);
                this._selection_radius = (radius !== undefined) ? radius : this._selection_radius;
            },

            // Track the # of layers in the map pane
            // Used to optimize Tangram redraw sensitivity (redraw more frequently when needing to sync w/other layers)
            trackMapLayerCounts (map) {
                this._updateMapLayerCount = () => {
                    let nodes = map.getPanes().mapPane.childNodes;
                    this._mapLayerCount = 0;
                    for (let i=0; i < nodes.length; i++) {
                        this._mapLayerCount += nodes[i].childNodes.length;
                    }
                };

                map.on('layeradd layerremove overlayadd overlayremove', this._updateMapLayerCount);
                this._updateMapLayerCount();
            },

            updateTangramDebugSettings () {
                mergeDebugSettings(this.options.debug || {});
            }

        });

        // Modified version of Leaflet's setZoomAround that doesn't trigger a moveEnd event
        setZoomAroundNoMoveEnd = function (layer, latlng, zoom) {
            var map = layer._map,
                scene = layer.scene,
                scale = map.getZoomScale(zoom),
                viewHalf = map.getSize().divideBy(2),
                containerPoint = latlng instanceof L.Point ? latlng : map.latLngToContainerPoint(latlng),

                centerOffset = containerPoint.subtract(viewHalf).multiplyBy(1 - 1 / scale),
                newCenter = map.containerPointToLatLng(viewHalf.add(centerOffset));

            if (scene) {
                scene.view.markUserInput();
            }
            return map._move(newCenter, zoom, { flyTo: true });
        };

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
