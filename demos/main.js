/*jslint browser: true*/
/*global Tangram, gui */

(function () {
    'use strict';

    function appendProtocol(url) {
        return window.location.protocol + url;
    }

    // default source, can be overriden by URL
    var default_tile_source = 'mapzen',
        rS;

    var tile_sources = {
        'mapzen': {
            source: {
                type: 'GeoJSONTileSource',
                url:  appendProtocol('//vector.mapzen.com/osm/all/{z}/{x}/{y}.json')
            },
            layers: 'demos/layers.yaml',
            styles: 'demos/styles.yaml'
        },
        'mapzen-dev': {
            source: {
                type: 'GeoJSONTileSource',
                url: appendProtocol('//vector.dev.mapzen.com/osm/all/{z}/{x}/{y}.json')
            },
            layers: 'demos/layers.yaml',
            styles: 'demos/styles.yaml'
        },
        'mapzen-local': {
            source: {
                type: 'GeoJSONTileSource',
                url: 'http://localhost:8080/all/{z}/{x}/{y}.json'
            },
            layers: 'demos/layers.yaml',
            styles: 'demos/styles.yaml'
        },
        'mapzen-mvt': {
            source: {
                type: 'MapboxFormatTileSource',
                url: appendProtocol('//vector.mapzen.com/osm/all/{z}/{x}/{y}.mapbox')
            },
            layers: 'demos/layers.yaml',
            styles: 'demos/styles.yaml'
        },
        'mapzen-topojson': {
            source: {
                type: 'TopoJSONTileSource',
                url: appendProtocol('//vector.mapzen.com/osm/all/{z}/{x}/{y}.topojson')
            },
            layers: 'demos/layers.yaml',
            styles: 'demos/styles.yaml'
        },
        'osm': {
            source: {
                type: 'GeoJSONTileSource',
                url: 'http://tile.openstreetmap.us/vectiles-all/{z}/{x}/{y}.json'
            },
            layers: 'demos/layers.yaml',
            styles: 'demos/styles.yaml'
        },
        'mapbox': {
            source: {
                type: 'MapboxFormatTileSource',
                url: 'http://{s:[a,b,c,d]}.tiles.mapbox.com/v4/mapbox.mapbox-streets-v6-dev/{z}/{x}/{y}.vector.pbf?access_token=pk.eyJ1IjoiYmNhbXBlciIsImEiOiJWUmh3anY0In0.1fgSTNWpQV8-5sBjGbBzGg',
                max_zoom: 15
            },
            layers: 'demos/layers_mvt.yaml',
            styles: 'demos/styles.yaml'
        }
    };

    var locations = {
        'London': [51.508, -0.105, 15],
        'New York': [40.70531887544228, -74.00976419448853, 16],
        'Seattle': [47.609722, -122.333056, 15]
    };
    var osm_debug = false;

    /***** GUI/debug controls *****/

    /*** URL parsing ***/

    // URL hash pattern is one of:
    // #[source]
    // #[lat],[lng],[zoom]
    // #[source],[lat],[lng],[zoom]
    // #[source],[location name]
    var url_hash = window.location.hash.slice(1, window.location.hash.length).split(',');

    // Get tile source from URL
    if (url_hash.length >= 1 && tile_sources[url_hash[0]] != null) {
        default_tile_source = url_hash[0];
    }

    // Get location from URL
    var map_start_location = locations['New York'];

    if (url_hash.length == 3) {
        map_start_location = url_hash.slice(0, 3);
    }
    if (url_hash.length > 3) {
        map_start_location = url_hash.slice(1, 4);
    }
    else if (url_hash.length == 2) {
        map_start_location = locations[url_hash[1]];
    }

    if (url_hash.length > 4) {
        var url_ui = url_hash.slice(4);

        // Mode on URL?
        var url_mode;
        if (url_ui) {
            var re = new RegExp(/mode=(\w+)/);
            url_ui.forEach(function(u) {
                var match = u.match(re);
                url_mode = (match && match.length > 1 && match[1]);
            });
        }
    }

    // Put current state on URL
    function updateURL() {
        var map_latlng = map.getCenter(),
            url_options = [default_tile_source, map_latlng.lat, map_latlng.lng, map.getZoom()];

        if (rS) {
            url_options.push('rstats');
        }

        if (gl_mode_options && gl_mode_options.effect != '') {
            url_options.push('mode=' + gl_mode_options.effect);
        }

        window.location.hash = url_options.join(',');
    }

    /*** Map ***/

    var map = L.map('map', {
        maxZoom: 20,
        inertia: false,
        keyboard: false
    });

    var layer = Tangram.leafletLayer({
        vectorTileSource: tile_sources[default_tile_source].source,
        vectorLayers: tile_sources[default_tile_source].layers,
        vectorStyles: tile_sources[default_tile_source].styles,
        numWorkers: 2,
        preRender: preRender,
        postRender: postRender,
        logLevel: 'debug',
        attribution: 'Map data &copy; OpenStreetMap contributors | <a href="https://github.com/tangrams/tangram" target="_blank">Source Code</a>',
        unloadInvisibleTiles: false,
        updateWhenIdle: false
    });
    window.layer = layer;

    var scene = layer.scene;
    window.scene = scene;

    // Update URL hash on move
    map.attributionControl.setPrefix('');
    map.setView(map_start_location.slice(0, 2), map_start_location[2]);
    map.on('moveend', updateURL);

    // Resize map to window
    function resizeMap() {
        document.getElementById('map').style.width = window.innerWidth + 'px';
        document.getElementById('map').style.height = window.innerHeight + 'px';
        map.invalidateSize(false);
    }

    window.addEventListener('resize', resizeMap);
    resizeMap();


    // Take a screenshot and save file
    function screenshot() {
        // Adapted from: https://gist.github.com/unconed/4370822
        var image = scene.canvas.toDataURL('image/png').slice(22); // slice strips host/mimetype/etc.
        var data = atob(image); // convert base64 to binary without UTF-8 mangling
        var buf = new Uint8Array(data.length);
        for (var i = 0; i < data.length; ++i) {
            buf[i] = data.charCodeAt(i);
        }
        var blob = new Blob([buf], { type: 'image/png' });
        saveAs(blob, 'tangram-' + (+new Date()) + '.png'); // uses FileSaver.js: https://github.com/eligrey/FileSaver.js/
    }

    // Render/GL stats: http://spite.github.io/rstats/
    // Activate with 'rstats' anywhere in options list in URL
    if (url_ui && url_ui.indexOf('rstats') >= 0) {
        var glS = new glStats();
        glS.fractions = []; // turn this off till we need it

        rS = new rStats({
            values: {
                frame: { caption: 'Total frame time (ms)', over: 5 },
                raf: { caption: 'Time since last rAF (ms)' },
                fps: { caption: 'Framerate (FPS)', below: 30 },
                rendertiles: { caption: 'Rendered tiles' },
                features: { caption: '# of geo features' },
                glbuffers: { caption: 'GL buffers (MB)' }
            },
            CSSPath : 'demos/lib/',
            plugins: [glS]
        });

        // Move it to the bottom-left so it doesn't obscure zoom controls
        var rSDOM = document.querySelector('.rs-base');
        rSDOM.style.bottom = '0px';
        rSDOM.style.top = 'inherit';
    }


    // For easier debugging access

    // GUI options for rendering modes/effects
    var gl_mode_options = {
        effect: url_mode || '',
        options: {
            'None': '',
            'Elevator': 'elevator',
            'Breathe': 'breathe',
            'Pop-up': 'popup',
            'Dots': 'dots',
            'Wood': 'wood',
            'B&W Halftone': 'halftone',
            'Color Halftone': 'colorhalftone',
            'Windows': 'windows',
            'Environment Map': 'envmap',
            'Color Bleed': 'colorbleed',
            'Rainbow': 'rainbow'
        },
        setup: function (mode) {
            // Restore initial state
            var layer_styles = scene.styles.layers;
            for (var l in layer_styles) {
                if (this.initial.layers[l] != null) {
                    layer_styles[l].mode = this.initial.layers[l].mode;
                    layer_styles[l].visible = this.initial.layers[l].visible;
                }
            };
            gui.camera = scene.styles.camera.type = this.initial.camera || scene.styles.camera.type;

            // Remove existing mode-specific controls
            gui.removeFolder(this.folder);

            // Mode-specific settings
            if (mode != '') {
                // Save settings to restore later
                for (l in layer_styles) {
                    if (this.initial.layers[l] == null) {
                        this.initial.layers[l] = {
                            // mode: (layer_styles[l].mode ? { name: layer_styles[l].mode.name } : null),
                            mode: layer_styles[l].mode,
                            visible: layer_styles[l].visible
                        };
                    }
                }
                this.initial.camera = this.initial.camera || scene.styles.camera.type;

                // Remove existing mode-specific controls
                gui.removeFolder(this.folder);

                if (this.settings[mode] != null) {
                    var settings = this.settings[mode] || {};

                    // Change projection if specified
                    gui.camera = scene.styles.camera.type = settings.camera || this.initial.camera;

                    // Mode-specific setup function
                    if (settings.setup) {
                        settings.uniforms = (scene.modes[mode].shaders && scene.modes[mode].shaders.uniforms);
                        settings.state = {}; // dat.gui needs a single object to old state

                        this.folder = mode[0].toUpperCase() + mode.slice(1); // capitalize first letter
                        settings.folder = gui.addFolder(this.folder);
                        settings.folder.open();

                        settings.setup(mode);

                        if (settings.folder.__controllers.length == 0) {
                            gui.removeFolder(this.folder);
                        }
                    }
                }
            }

            // Recompile/rebuild
            scene.updateStyles();
            scene.rebuildGeometry();
            updateURL();

            // Force-update dat.gui
            for (var i in gui.__controllers) {
                gui.__controllers[i].updateDisplay();
            }
        },
        settings: {
            'colorbleed': {
                setup: function (mode) {
                    scene.styles.layers.buildings.mode = { name: mode };

                    this.state.animated = scene.modes[mode].shaders.defines['EFFECT_COLOR_BLEED_ANIMATED'];
                    this.folder.add(this.state, 'animated').onChange(function(value) {
                        scene.modes[mode].shaders.defines['EFFECT_COLOR_BLEED_ANIMATED'] = value;
                        scene.updateStyles();
                    });
                }
            },
            'rainbow': {
                setup: function (mode) {
                    scene.styles.layers.buildings.mode = { name: mode };
                }
            },
            'popup': {
                setup: function (mode) {
                    scene.styles.layers.buildings.mode = { name: mode };

                    this.state.popup_radius = this.uniforms.u_popup_radius;
                    this.folder.add(this.state, 'popup_radius', 0, 500).onChange(function(value) {
                        this.uniforms.u_popup_radius = value;
                        scene.requestRedraw();
                    }.bind(this));

                    this.state.popup_height = this.uniforms.u_popup_height;
                    this.folder.add(this.state, 'popup_height', 0, 5).onChange(function(value) {
                        this.uniforms.u_popup_height = value;
                        scene.requestRedraw();
                    }.bind(this));
                }
            },
            'elevator': {
                setup: function (mode) {
                    scene.styles.layers.buildings.mode = { name: mode };
                }
            },
            'breathe': {
                setup: function (mode) {
                    scene.styles.layers.buildings.mode = { name: mode };

                    this.state.breathe_scale = this.uniforms.u_breathe_scale;
                    this.folder.add(this.state, 'breathe_scale', 0, 50).onChange(function(value) {
                        this.uniforms.u_breathe_scale = value;
                        scene.requestRedraw();
                    }.bind(this));

                    this.state.breathe_speed = this.uniforms.u_breathe_speed;
                    this.folder.add(this.state, 'breathe_speed', 0, 3).onChange(function(value) {
                        this.uniforms.u_breathe_speed = value;
                        scene.requestRedraw();
                    }.bind(this));
                }
            },
            'dots': {
                setup: function (mode) {
                    scene.styles.layers.buildings.mode = { name: mode };

                    this.state.background = gl_mode_options.scaleColor(this.uniforms.u_dot_background_color, 255);
                    this.folder.addColor(this.state, 'background').onChange(function(value) {
                        this.uniforms.u_dot_background_color = gl_mode_options.scaleColor(value, 1 / 255);
                        scene.requestRedraw();
                    }.bind(this));

                    this.state.dot_color = gl_mode_options.scaleColor(this.uniforms.u_dot_color, 255);
                    this.folder.addColor(this.state, 'dot_color').onChange(function(value) {
                        this.uniforms.u_dot_color = gl_mode_options.scaleColor(value, 1 / 255);
                        scene.requestRedraw();
                    }.bind(this));

                    this.state.grid_scale = this.uniforms.u_dot_grid_scale;
                    this.folder.add(this.state, 'grid_scale', 0, 0.1).onChange(function(value) {
                        this.uniforms.u_dot_grid_scale = value;
                        scene.requestRedraw();
                    }.bind(this));

                    this.state.dot_scale = this.uniforms.u_dot_scale;
                    this.folder.add(this.state, 'dot_scale', 0, 0.4).onChange(function(value) {
                        this.uniforms.u_dot_scale = value;
                        scene.requestRedraw();
                    }.bind(this));
                }
            },
            'wood': {
                setup: function (mode) {
                    scene.styles.layers.buildings.mode = { name: mode };

                    this.state.wood_color1 = gl_mode_options.scaleColor(this.uniforms.u_wood_color1, 255);
                    this.folder.addColor(this.state, 'wood_color1').onChange(function(value) {
                        this.uniforms.u_wood_color1 = gl_mode_options.scaleColor(value, 1 / 255);
                        scene.requestRedraw();
                    }.bind(this));

                    this.state.wood_color2 = gl_mode_options.scaleColor(this.uniforms.u_wood_color2, 255);
                    this.folder.addColor(this.state, 'wood_color2').onChange(function(value) {
                        this.uniforms.u_wood_color2 = gl_mode_options.scaleColor(value, 1 / 255);
                        scene.requestRedraw();
                    }.bind(this));

                    this.state.eccentricity = this.uniforms.u_wood_eccentricity;
                    this.folder.add(this.state, 'eccentricity', -1, 1).onChange(function(value) {
                        this.uniforms.u_wood_eccentricity = value;
                        scene.requestRedraw();
                    }.bind(this));

                    this.state.twist = this.uniforms.u_wood_twist / .0001;
                    this.folder.add(this.state, 'twist', 0, 1).onChange(function(value) {
                        this.uniforms.u_wood_twist = value * .0001;
                        scene.requestRedraw();
                    }.bind(this));

                    this.state.scale = this.uniforms.u_wood_scale / 100;
                    this.folder.add(this.state, 'scale', 0, 1).onChange(function(value) {
                        this.uniforms.u_wood_scale = value * 100;
                        scene.requestRedraw();
                    }.bind(this));
                }
            },
            'colorhalftone': {
                setup: function (mode) {
                    scene.styles.layers.buildings.mode = { name: mode };
                    scene.styles.layers.water.mode = { name: mode };
                    scene.styles.layers.landuse.mode = { name: mode };
                    scene.styles.layers.earth.mode = { name: mode };

                    scene.styles.layers.pois.visible = false;

                    this.state.dot_frequency = this.uniforms.dot_frequency;
                    this.folder.add(this.state, 'dot_frequency', 0, 200).onChange(function(value) {
                        this.uniforms.dot_frequency = value;
                        scene.requestRedraw();
                    }.bind(this));

                    this.state.dot_scale = this.uniforms.dot_scale;
                    this.folder.add(this.state, 'dot_scale', 0, 3).onChange(function(value) {
                        this.uniforms.dot_scale = value;
                        scene.requestRedraw();
                    }.bind(this));

                    this.state.true_color = this.uniforms.true_color;
                    this.folder.add(this.state, 'true_color').onChange(function(value) {
                        this.uniforms.true_color = value;
                        scene.requestRedraw();
                    }.bind(this));
                }
            },
            'halftone': {
                setup: function (mode) {
                    Object.keys(scene.styles.layers).forEach(function(l) {
                        scene.styles.layers[l].mode = { name: mode };
                    });

                    scene.styles.layers.earth.visible = false;
                    scene.styles.layers.pois.visible = false;
                }
            },
            'windows': {
                camera: 'isometric', // force isometric
                setup: function (mode) {
                    scene.styles.layers.buildings.mode = { name: mode };
                    scene.styles.layers.pois.visible = false;
                }
            },
            'envmap': {
                setup: function (mode) {
                    scene.styles.layers.buildings.mode = { name: mode };

                    var envmaps = {
                        'Chrome': 'demos/images/LitSphere_test_02.jpg',
                        'Sunset': 'demos/images/sunset.jpg',
                        'Matte Red': 'demos/images/matball01.jpg',
                        'Color Wheel': 'demos/images/wheel.png'
                    };

                    this.state.u_env_map = this.uniforms.u_env_map;
                    this.folder.add(this.state, 'u_env_map', envmaps).onChange(function(value) {
                        this.uniforms.u_env_map = value;
                        scene.requestRedraw();
                    }.bind(this));
                }
            }
        },
        initial: { // initial state to restore to on mode switch
            layers: {}
        },
        folder: null, // set to current (if any) DAT.gui folder name, cleared on mode switch
        scaleColor: function (c, factor) { // convenience for converting between uniforms (0-1) and DAT colors (0-255)
            if ((typeof c == 'string' || c instanceof String) && c[0].charAt(0) == "#") {
                // convert from hex to rgb
                var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(c);
                c = result ? [
                    parseInt(result[1], 16),
                    parseInt(result[2], 16),
                    parseInt(result[3], 16)
                ] : null;
            }
            return [c[0] * factor, c[1] * factor, c[2] * factor];
        }
    };

    // Create dat GUI
    var gui = new dat.GUI({ autoPlace: true });
    function addGUI () {
        gui.domElement.parentNode.style.zIndex = 5;
        window.gui = gui;

        // Add ability to remove a whole folder from DAT.gui
        gui.removeFolder = function(name) {
            var folder = this.__folders[name];
            if (folder == null) {
                return;
            }

            folder.close();
            folder.__ul.parentNode.removeChild(folder.__ul);
            this.__folders[name] = undefined;
            this.onResize();
        };

        // Camera
        var camera_types = {
            'Flat': 'flat',
            'Perspective': 'perspective',
            'Isometric': 'isometric'
        };
        gui.camera = layer.scene.styles.camera.type;
        gui.add(gui, 'camera', camera_types).onChange(function(value) {
            layer.scene.styles.camera.type = value;
            layer.scene.updateStyles();
        });

        // Lighting
        var lighting_presets = {
            'Point': {
                type: 'point',
                position: [0, 0, 200],
                ambient: 0.5,
                backlight: true
            },
            'Directional': {
                type: 'directional',
                direction: [-1, 0, -.5],
                ambient: 0.5
            },
            'Spotlight': {
                type: 'spotlight',
                position: [0, 0, 500],
                direction: [0, 0, -1],
                inner_angle: 20,
                outer_angle: 25,
                ambient: 0.2
            },
            'Night': {
                type: 'point',
                position: [0, 0, 50],
                ambient: 0,
                backlight: false
            }
        };
        var lighting_options = Object.keys(lighting_presets);
        for (var k=0; k < lighting_options.length; k++) {
            if (lighting_presets[lighting_options[k]].type === layer.scene.styles.lighting.type) {
                gui.lighting = lighting_options[k];
                break;
            }
        }
        gui.add(gui, 'lighting', lighting_options).onChange(function(value) {
            layer.scene.styles.lighting = lighting_presets[value];
            layer.scene.updateStyles();
        });

        // Feature selection on hover
        gui['feature info'] = true;
        gui.add(gui, 'feature info');

        // Screenshot
        gui.screenshot = function () {
            gui.queue_screenshot = true;
        };
        gui.add(gui, 'screenshot');

        // Layers
        var layer_gui = gui.addFolder('Layers');
        var layer_controls = {};
        layer.scene.layers.forEach(function(l) {
            if (layer.scene.styles.layers[l.name] == null) {
                return;
            }

            layer_controls[l.name] = !(layer.scene.styles.layers[l.name].visible == false);
            layer_gui.
                add(layer_controls, l.name).
                onChange(function(value) {
                    layer.scene.styles.layers[l.name].visible = value;
                    layer.scene.rebuildGeometry();
                });
        });

        // Modes
        gui.add(gl_mode_options, 'effect', gl_mode_options.options).
            onChange(gl_mode_options.setup.bind(gl_mode_options));
    }

    // Feature selection
    function initFeatureSelection () {
        // Selection info shown on hover
        var selection_info = document.createElement('div');
        selection_info.setAttribute('class', 'label');
        selection_info.style.display = 'block';

        // Show selected feature on hover
        scene.container.addEventListener('mousemove', function (event) {
            if (gui['feature info'] == false) {
                if (selection_info.parentNode != null) {
                    selection_info.parentNode.removeChild(selection_info);
                }

                return;
            }

            var pixel = { x: event.clientX, y: event.clientY };

            scene.getFeatureAt(pixel).then(function(selection) {
                var feature = selection.feature;
                if (feature != null) {
                    // console.log("selection map: " + JSON.stringify(feature));

                    var label = '';
                    if (feature.properties.name != null) {
                        label = feature.properties.name;
                    }

                    // if (feature.properties.layer == 'buildings' && feature.properties.height) {
                    //     if (label != '') {
                    //         label += '<br>';
                    //     }
                    //     label += feature.properties.height + 'm';
                    // }

                    if (label != '') {
                        selection_info.style.left = (pixel.x + 5) + 'px';
                        selection_info.style.top = (pixel.y + 15) + 'px';
                        selection_info.innerHTML = '<span class="labelInner">' + label + '</span>';
                        scene.container.appendChild(selection_info);
                    }
                    else if (selection_info.parentNode != null) {
                        selection_info.parentNode.removeChild(selection_info);
                    }
                }
                else if (selection_info.parentNode != null) {
                    selection_info.parentNode.removeChild(selection_info);
                }
            });

            // Don't show labels while panning
            if (scene.panning == true) {
                if (selection_info.parentNode != null) {
                    selection_info.parentNode.removeChild(selection_info);
                }
            }
        });
    }

    // Pre-render hook
    function preRender () {
        if (rS != null) { // rstats
            rS('frame').start();
            // rS('raf').tick();
            rS('fps').frame();

            if (scene.dirty) {
                glS.start();
            }
        }
    }

    // Post-render hook
    function postRender () {
        if (rS != null) { // rstats
            rS('frame').end();
            rS('rendertiles').set(scene.renderable_tiles_count);
            rS('glbuffers').set((scene.getDebugSum('buffer_size') / (1024*1024)).toFixed(2));
            rS('features').set(scene.getDebugSum('features'));
            rS().update();
        }

        // Screenshot needs to happen in the requestAnimationFrame callback, or the frame buffer might already be cleared
        if (gui.queue_screenshot == true) {
            gui.queue_screenshot = false;
            screenshot();
        }
    }

    /***** Render loop *****/
    window.addEventListener('load', function () {
        // Scene initialized
        layer.on('init', function() {
            addGUI();

            if (url_mode) {
                gl_mode_options.setup(url_mode);
            }
            updateURL();

            initFeatureSelection();
        });
        layer.addTo(map);

        if (osm_debug == true) {
            window.osm_layer =
                L.tileLayer(
                    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    { opacity: 0.5 })
                .bringToFront()
                .addTo(map);
        }
    });


}());
