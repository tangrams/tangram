/*jslint browser: true*/
/*global Tangram, gui */

/*

Hello source-viewers!

We're glad you're interested in how Tangram can be used to make amazing maps!

This demo is meant to show off various visual styles, but it has a really complex setup - we had to jump through a lot of hoops to implement the style-switcher and rebuild the dat.gui interface on the fly, which are things you would probably never have to do in a real-world use case.

So instead of rummaging through this rather confusing example, we recommend you check out our documentation, which is chock-full of specific, targeted demos highlighting all of the nifty features of the Tangram library:

https://github.com/tangrams/tangram/wiki/

Enjoy!
- The Mapzen Tangram team

*/

(function () {

    var scene_url = 'demos/scene.yaml',
        osm_debug = false,
        rS, url_hash, map_start_location, url_style;

    getValuesFromUrl();

    // default source, can be overriden by URL
    var
        map = L.map('map', {
            maxZoom: 20,
            zoomSnap: 0,
            trackResize: true,
            keyboard: false
        }),

        layer = Tangram.leafletLayer({
            scene: scene_url,
            events: {
                hover: onFeatureHover
            },
            preUpdate: preUpdate,
            postUpdate: postUpdate,
            // highDensityDisplay: false,
            logLevel: 'debug',
            attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
        });

    // useful events to subscribe to
    layer.scene.subscribe({
        load: function (msg) {
            // scene was loaded
        },
        view_complete: function (msg) {
            // new set of map tiles was rendered
        },
        error: function (msg) {
            // debugger;
        },
        warning: function (msg) {
            // debugger;
        }
    });


    /***** GUI/debug controls *****/

    /*** URL parsing ***/

    // URL hash pattern is one of:
    // #[lat],[lng],[zoom]
    // #[source],[lat],[lng],[zoom] (legacy)
    function getValuesFromUrl() {

        url_hash = window.location.hash.slice(1, window.location.hash.length).split(',');

        // Get location from URL
        map_start_location = [40.70531887544228, -74.00976419448853, 16]; // NYC

        if (url_hash.length >= 3) {
            // Note: backwards compatibility with old demo links, deprecate?
            if (typeof parseFloat(url_hash[0]) === 'number' && !isNaN(parseFloat(url_hash[0]))) {
                map_start_location = url_hash.slice(0, 3);
            }
            else if (typeof parseFloat(url_hash[1]) === 'number' && !isNaN(parseFloat(url_hash[1]))) {
                map_start_location = url_hash.slice(1, 4);
            }
        }

        if (url_hash.length > 3) {
            // Style on URL?
            var re = new RegExp(/(?:style|mode)=(\w+)/);
            url_hash.forEach(function(u) {
                var match = u.match(re);
                url_style = (match && match.length > 1 && match[1]);
            });
        }

    }

    // Put current state on URL
    var update_url_throttle = 100;
    var update_url_timeout = null;
    function updateURL() {
        clearTimeout(update_url_timeout);
        update_url_timeout = setTimeout(function() {
            var center = map.getCenter();
            var url_options = [center.lat, center.lng, map.getZoom()];

            if (rS) {
                url_options.push('rstats');
            }

            if (style_options && style_options.effect != '') {
                url_options.push('style=' + style_options.effect);
            }

            window.location.hash = url_options.join(',');
        }, update_url_throttle);
    }

    /*** Map ***/

    window.layer = layer;
    window.map = map;
    var scene = layer.scene;
    window.scene = scene;

    // Update URL hash on move
    map.attributionControl.setPrefix('');
    map.setView(map_start_location.slice(0, 2), map_start_location[2]);
    map.on('move', updateURL);

    // Render/GL stats: http://spite.github.io/rstats/
    // Activate with 'rstats' anywhere in options list in URL
    if (url_hash.indexOf('rstats') >= 0) {
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

    // GUI options for rendering style/effects
    var style_options = {
        effect: url_style || '',
        options: {
            'None': '',
            'Water animation': 'water',
            'Elevator': 'elevator',
            'Pop-up': 'popup',
            'Halftone': 'halftone',
            'Windows': 'windows',
            'Environment Map': 'envmap',
            'Rainbow': 'rainbow'
        },
        saveInitial: function() {
            this.initial = { config: JSON.stringify(scene.config) };
        },
        setup: function (style) {
            // Restore initial state
            scene.config = JSON.parse(this.initial.config);

            // Remove existing style-specific controls
            gui.removeFolder(this.folder);

            // Style-specific settings
            if (style != '') {
                if (this.settings[style] != null) {
                    var settings = this.settings[style] || {};

                    // Change projection if specified
                    if (settings.camera) {
                        scene.setActiveCamera(settings.camera);
                    }

                    // Style-specific setup function
                    if (settings.setup) {
                        settings.uniforms = function() {
                            return scene.styles[style] && scene.styles[style].shaders.uniforms;
                        };
                        settings.state = {}; // dat.gui needs a single object to old state

                        this.folder = style[0].toUpperCase() + style.slice(1); // capitalize first letter
                        settings.folder = gui.addFolder(this.folder);
                        settings.folder.open();

                        settings.setup(style);

                        if (settings.folder.__controllers.length === 0) {
                            gui.removeFolder(this.folder);
                        }
                    }
                }
            }

            // Recompile/rebuild
            scene.updateConfig();
            updateURL();

            // Force-update dat.gui
            for (var i in gui.__controllers) {
                gui.__controllers[i].updateDisplay();
            }
        },
        settings: {
            'water': {
                setup: function (style) {
                    scene.config.layers.water.draw.polygons.style = style;
                }
            },
            'rainbow': {
                setup: function (style) {
                    scene.config.layers.earth.draw.polygons.color = '#333';
                    scene.config.layers.roads.draw.lines.color = '#777';
                    scene.config.layers.pois.visible = false;
                    scene.config.layers.buildings.draw.polygons.style = style;
                    scene.config.layers.buildings.extruded.draw.polygons.style = style;
                }
            },
            'popup': {
                setup: function (style) {
                    scene.config.layers.buildings.extruded.draw.polygons.style = style;
                }
            },
            'elevator': {
                setup: function (style) {
                    scene.config.layers.buildings.extruded.draw.polygons.style = style;
                }
            },
            'halftone': {
                setup: function (style) {
                    scene.config.scene.background.color = 'black';

                    var layers = scene.config.layers;
                    layers.earth.draw.polygons.style = 'halftone_polygons';
                    layers.water.draw.polygons.style = 'halftone_polygons';
                    layers.landuse.areas.draw.polygons.style = 'halftone_polygons';
                    layers.buildings.draw.polygons.style = 'halftone_polygons';
                    layers.buildings.extruded.draw.polygons.style = 'halftone_polygons';
                    layers.buildings.draw.polygons.color = 'Style.color.pseudoRandomColor()';
                    layers.roads.draw.lines.style = 'halftone_lines';
                    layers.pois.visible = false;

                    var visible_layers = ['landuse', 'water', 'roads', 'buildings'];
                    Object.keys(layers).forEach(function(l) {
                        if (visible_layers.indexOf(l) === -1) {
                            layers[l].visible = false;
                        }
                    });
                }
            },
            'windows': {
                camera: 'isometric', // force isometric
                setup: function (style) {
                    scene.config.layers.earth.draw.polygons.color = '#333';
                    scene.config.layers.roads.draw.lines.color = '#777';
                    scene.config.layers.pois.visible = false;

                    scene.config.layers.buildings.draw.polygons.style = style;
                    scene.config.layers.buildings.extruded.draw.polygons.style = style;
                    // scene.config.layers.pois.visible = false;
                }
            },
            'envmap': {
                setup: function (style) {
                    scene.config.layers.earth.draw.polygons.color = '#333';
                    scene.config.layers.roads.draw.lines.color = '#777';

                    scene.config.layers.buildings.draw.polygons.style = style;
                    scene.config.layers.buildings.extruded.draw.polygons.style = style;

                    var envmaps = {
                        'Sunset': window.location.origin+window.location.pathname+'demos/images/sunset.jpg',
                        'Chrome': window.location.origin+window.location.pathname+'demos/images/LitSphere_test_02.jpg',
                        'Matte Red': window.location.origin+window.location.pathname+'demos/images/matball01.jpg',
                        'Color Wheel': window.location.origin+window.location.pathname+'demos/images/wheel.png'
                    };

                    this.state.envmap = scene.styles.envmap.material.emission.texture;
                    this.folder.add(this.state, 'envmap', envmaps).onChange(function(value) {
                        scene.styles.envmap.material.emission.texture = value;
                        scene.requestRedraw();
                    }.bind(this));
                }
            }
        },
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
        gui.domElement.parentNode.style.zIndex = 10000;
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

        // Language selector
        var langs = {
            '(default)': null,
            'English': 'en',
            'Russian': 'ru',
            'Japanese': 'ja',
            'German': 'de',
            'French': 'fr',
            'Arabic': 'ar',
            'Spanish': 'es'
        };
        gui.language = 'en';
        gui.add(gui, 'language', langs).onChange(function(value) {
            scene.config.global.language = value;
            scene.updateConfig();
        });

        // Camera
        var camera_types = {
            'Flat': 'flat',
            'Perspective': 'perspective',
            'Isometric': 'isometric'
        };
        gui.camera = scene.getActiveCamera();
        gui.add(gui, 'camera', camera_types).onChange(function(value) {
            scene.setActiveCamera(value);
        });

        // Feature selection on hover
        gui['feature info'] = true;
        gui.add(gui, 'feature info');

        // Take a screenshot and save to file
        gui.screenshot = function () {
            return scene.screenshot().then(function(screenshot) {
                // uses FileSaver.js: https://github.com/eligrey/FileSaver.js/
                saveAs(screenshot.blob, 'tangram-' + (+new Date()) + '.png');
            });
        };
        gui.add(gui, 'screenshot');

        // Layers
        var layer_gui = gui.addFolder('Layers');
        var layer_controls = {};
        Object.keys(layer.scene.config.layers).forEach(function(l) {
            if (!layer.scene.config.layers[l]) {
                return;
            }

            layer_controls[l] = !(layer.scene.config.layers[l].visible == false);
            layer_gui.
                add(layer_controls, l).
                onChange(function(value) {
                    layer.scene.config.layers[l].visible = value;
                    layer.scene.rebuild();
                });
        });

        // Styles
        gui.add(style_options, 'effect', style_options.options).
            onChange(style_options.setup.bind(style_options));

        // Link to edit in OSM - hold 'e' and click
        window.addEventListener('click', function () {
            // if (key.isPressed('e')) {
            if (key.shift) {
                var url = 'https://www.openstreetmap.org/edit?';

                if (scene.selection.feature && scene.selection.feature.id) {
                    url += 'way=' + scene.selection.feature.id;
                }

                if (scene.center) {
                    url += '#map=' + scene.baseZoom(scene.zoom) + '/' + scene.center.lat + '/' + scene.center.lng;
                }

                window.open(url, '_blank');
            }
        });
    }

    // Feature selection
    var selection_info = document.createElement('div'); // shown on hover
    selection_info.setAttribute('class', 'label');
    selection_info.style.display = 'block';

    function onFeatureHover (selection) {
        // Show selection info
        var feature = selection.feature;
        if (feature != null) {
            var label = '';
            if (feature.properties.name != null) {
                label = feature.properties.name;
            }
            // Object.keys(feature.properties).forEach(p => label += `<b>${p}:</b> ${feature.properties[p]}<br>`);

            if (label != '') {
                selection_info.style.left = (selection.pixel.x + 5) + 'px';
                selection_info.style.top = (selection.pixel.y + 15) + 'px';
                selection_info.innerHTML = '<span class="labelInner">' + label + '</span>';
                if (selection_info.parentNode == null) {
                    map.getContainer().appendChild(selection_info);
                }
            }
            else if (selection_info.parentNode != null) {
                selection_info.parentNode.removeChild(selection_info);
            }
        }
        else if (selection_info.parentNode != null) {
            selection_info.parentNode.removeChild(selection_info);
        }
    }

    // Pre-render hook
    var zoom_step = 0.03;
    function preUpdate (will_render) {
        // Input
        if (key.isPressed('up')) {
            map._move(map.getCenter(), map.getZoom() + zoom_step);
        }
        else if (key.isPressed('down')) {
            map._move(map.getCenter(), map.getZoom() - zoom_step);
        }

        // Profiling
        if (will_render && rS) {
            rS('frame').start();
            // rS('raf').tick();
            rS('fps').frame();

            if (scene.dirty) {
                glS.start();
            }
        }
    }

    // Post-render hook
    function postUpdate () {
        if (rS != null) { // rstats
            rS('frame').end();
            rS('rendertiles').set(scene.renderable_tiles_count);
            rS('glbuffers').set((scene.tile_manager.getDebugSum('buffer_size') / (1024*1024)).toFixed(2));
            rS('features').set(scene.tile_manager.getDebugSum('features'));
            rS().update();
        }
    }

    /***** Render loop *****/
    window.addEventListener('load', function () {
        // Scene initialized
        layer.on('init', function() {
            addGUI();

            style_options.saveInitial();
            if (url_style) {
                style_options.setup(url_style);
            }
            updateURL();
        });
        layer.addTo(map);

        if (osm_debug == true) {
            window.osm_layer =
                L.tileLayer(
                    'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                    // 'https://stamen-tiles.a.ssl.fastly.net/terrain-background/{z}/{x}/{y}.jpg',
                    {
                        maxZoom: 19//,
                        // opacity: 0.5
                    })
                .addTo(map);
                // .bringToFront();
        }

        layer.bringToFront();
    });


}());
