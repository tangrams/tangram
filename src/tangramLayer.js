// Tangram main API
//
// example:
//
// `var map = Tangram.tangramLayer('map');`
//
// This will create a Tangram map in the DOM element (normally a div) called 'map'.

import Thread from './utils/thread';
import Scene from './scene/scene';
import Geo from './utils/geo';
import { mat4 } from './utils/gl-matrix';
import * as interaction from './interaction';

export function tangramLayer(element, options = {}) {
    if (Thread.is_main) {
        return {
            container: typeof element === 'string' ? document.getElementById(element) : element,
            initialize(initOptions = {}) {
                this.isloaded = false;
                // if options were defined in both the layer instantiation and the initialize call, merge them
                // (initialization options will override layer options)
                for (var attribute in initOptions) { options[attribute] = initOptions[attribute]; }
                // Defaults
                if (!this.hasOwnProperty('options')) {
                    this.options = options;
                }
                for (var i in options) {
                    this.options[i] = options[i];
                }
                let center = this.center || options.center || { lat: 40.70531, lng: -74.00976 }; // default - NYC
                let zoom = this.zoom || options.zoom || 12; // default
                let scrollWheelZoom = this.scrollWheelZoom || options.scrollWheelZoom || true; // default

                if (!this.options.scene) {
                    this.options.scene = 'demos/scene.yaml'; // default scene
                }

                this.center = center;
                this.zoom = zoom;
                this.scrollWheelZoom = scrollWheelZoom;

                this.scene = Scene.create();
                this.view = this.scene.view;
                this.view.center = this.center;
                this.bounds = this.view.calculateBounds();
                this.view.bounds = this.bounds;

                this.parent = this.options.parent;

                // stub - TODO: separate into a new module?
                this.transform = {
                    // TODO: this should be overridable per-marker
                    wrapWorld: true,
                    zoomScale: function (zoom) { return Math.pow(2, zoom); },
                };

                // Add GL canvas to map this.container
                this.scene.container = this.container;

                // Initial view
                this.scene.load(
                    this.options.scene, {}
                ).then(() => {
                    // this happens after the 'load' subscription is triggered
                    this.view.setView({ lng: this.center.lng, lat: this.center.lat, zoom: this.zoom });
                    this.updateView(this);
                    this.updateSize(this);

                    // Interaction layer initialization
                    interaction.init(this.scene, this.view.camera);

                }).catch(error => {
                    throw (error);
                });

                this.scene.subscribe({
                    load: () => {
                        // this happens before the scene.load() promise returns
                        // Initial view
                        this.isloaded = true;
                        // force calculation of camera matrices, to allow apps to use latLngToPixel
                        // before all the tiles finish building
                        this.view.update();
                    }
                });

            },

            getCenter: function () {
                return this.view.center;
            },

            getZoom: function () {
                return this.view.zoom;
            },

            setView: function (view) {
                this.view.setView(view);
            },

            updateView: function (map) {
                var view = map.center;
                view.zoom = map.zoom;
                map.scene.view.setView(view);
            },

            updateSize: function (map) {
                var size = { x: this.container.clientWidth, y: this.container.clientHeight };
                map.scene.resizeMap(size.x, size.y);
            },

            loaded: function () {
                return this.isloaded;
            },

            jumpTo: function (opts) {
                this.setView({ lng: opts.lng, lat: opts.lat, zoom: opts.zoom });
            },

            flyTo: function (opts) {
                this.view.flyTo(opts);
            },

            getBounds: function () {
                this.bounds = this.view.calculateBounds();
                this.view.bounds = this.bounds;
                return this.bounds;
            },

            getBoundsLatLng: function () {
                let boundsLatLng = {};
                boundsLatLng.sw = Geo.metersToLatLng([this.bounds.sw.x, this.bounds.sw.y]);
                boundsLatLng.ne = Geo.metersToLatLng([this.bounds.ne.x, this.bounds.ne.y]);
                this.bounds.latLng = {
                    _sw: {
                        lng: boundsLatLng.sw[0],
                        lat: boundsLatLng.sw[1]
                    },
                    _ne: {
                        lng: boundsLatLng.ne[0],
                        lat: boundsLatLng.ne[1]
                    }
                };

                return this.bounds.latLng;
            },

            scrollWheelZoom: {
                isEnabled: function () {
                    return this.scrollWheelZoom;
                },
                enable: function () {
                    this.scrollWheelZoom = true;
                    return true;
                },
                disable: function () {
                    this.scrollWheelZoom = false;
                    return true;
                }
            },

            // convert lngLat to screenspace pixels, ES version: https://github.com/tangrams/tangram-es/blob/6fa12a7a84f71adb3e8d9a473d538b1ac49bca7b/core/src/view/view.cpp#L429
            project: function (lngLat) {
                let view = this.view;

                let meters = Geo.latLngToMeters([lngLat.lng, lngLat.lat]);
                let metersPos = [meters[0], meters[1], 0, 1];

                let point = {
                    x: null,
                    y: null
                };

                // used by marker.js for unwrap
                point.distSqr = function (pos) {
                    var a = point.x - pos.x;
                    var b = point.y - pos.y;
                    return a * a + b * b;
                };

                // used by marker.js for offset
                point.add = function (offset) {
                    point.x += offset.x;
                    point.y += offset.y;
                    return point;
                };

                // round point position to integers
                point.round = function () {
                    point.x = Math.round(point.x);
                    point.y = Math.round(point.y);
                    return point;
                };

                if (typeof view.camera !== 'undefined') {
                    if (typeof view.camera.view_matrix === 'undefined') {
                        // no view.camera.view_matrix
                        return point;
                    }
                } else {
                    // no view.camera
                    return point;
                }
                // otherwise carry on

                let m_proj = view.camera.projection_matrix;
                let m_view = view.camera.view_matrix;

                let m_viewProj = new Float64Array(16);
                m_viewProj = mat4.multiply(m_viewProj, m_proj, m_view);

                let screenSize = { x: view.size.css.width, y: view.size.css.height };
                let clipped = false;
                let screenPosition = worldToScreenSpace(m_viewProj, metersPos, screenSize, clipped);

                function worldToScreenSpace(mvp, worldPosition, screenSize) {
                    let clipSpace = new Array(4);
                    clipSpace = worldToClipSpace(clipSpace, mvp, worldPosition);
                    let screenSpace = clipToScreenSpace(clipSpace, screenSize);
                    return screenSpace;
                }

                function worldToClipSpace(clipSpace, mvp, worldPosition) {
                    clipSpace = transformMat4(clipSpace, mvp, worldPosition);
                    return { x: clipSpace[0], y: clipSpace[1], z: clipSpace[2], w: clipSpace[3] };
                }

                function transformMat4(out, m, a) {
                    let x = a[0], y = a[1], z = a[2], w = a[3];
                    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
                    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
                    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
                    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
                    return out;
                }

                function clipToScreenSpace(clipCoords, screenSize) {
                    let halfScreen = { x: screenSize.x * 0.5, y: screenSize.y * 0.5 };
                    // from normalized device coordinates to screen space coordinate system
                    // top-left screen axis, y pointing down

                    let screenPos =
                    {
                        x: (clipCoords.x / clipCoords.w) + 1,
                        y: 1 - (clipCoords.y / clipCoords.w)
                    };

                    return { x: screenPos.x * halfScreen.x, y: screenPos.y * halfScreen.y };
                }

                point.x = screenPosition.x;
                point.y = screenPosition.y;
                return point;
            },

            // convert screenspace pixel coordinates to lngLat
            unproject: function (point) {
                let view = this.view;

                let deltaX = point[0] - window.innerWidth / 2;
                let deltaY = point[1] - window.innerHeight / 2;

                let metersDeltaX = deltaX * Geo.metersPerPixel(view.zoom);
                let metersDeltaY = deltaY * Geo.metersPerPixel(view.zoom);

                let lngLat = Geo.metersToLatLng([view.center.meters.x + metersDeltaX, view.center.meters.y - metersDeltaY]);
                return { lng: lngLat[0], lat: lngLat[1] };
            },

            fitBounds: function (bounds, options, eventData) {
                return this.view.fitBounds(bounds, options, eventData);
            },

            // TODO: necessary for react apps?
            // onMove: function(evt) {
            // }

        };
    }
}
