(function(){
    var scene = window.scene;
    var scene_key = 'Simple';

    window.addEventListener('load', function () {
        // Add search control
        L.control.geocoder('ge-3d066b6b1c398181', {
            url: 'https://api.geocode.earth/v1',
            layers: 'coarse',
            expanded: true,
            markers: false
        }).addTo(window.map);

        // Add GUI on scene load
        layer.scene.subscribe({
            load: function (msg) {
                addGUI();
            }
        });
    });

    var gui;
    function addGUI () {
        // Remove old GUI
        if (gui != null) {
            gui.destroy();
        }

        // Create GUI
        gui = new dat.GUI({ autoPlace: true });
        gui.domElement.parentNode.style.zIndex = 10000;
        window.gui = gui;

        setLanguage(gui, scene);
        setCamera(gui, scene);
        setScene(gui);
        setScreenshot(gui, scene);
        setMediaRecorder(gui, scene);
        setFeatureDebug(gui);
        setLayers(gui, scene);
    }

    function setScene(gui) {
        // NOTE: using previous version of Mapzen/Nextzen basemaps, until some issues are
        // resolved in current versions (syntax errors on shields, etc.)
        var scenes = {
            // Default style
            'Simple': 'demos/scene.yaml',

            // Nextzen (nee Mapzen) basemaps
            'Bubble Wrap': {
                import: [
                    'https://www.nextzen.org/carto/bubble-wrap-style/10/bubble-wrap-style.zip',
                    'https://www.nextzen.org/carto/bubble-wrap-style/10/themes/label-10.zip',
                    'https://www.nextzen.org/carto/bubble-wrap-style/10/themes/bubble-wrap-road-shields-usa.zip',
                    'https://www.nextzen.org/carto/bubble-wrap-style/10/themes/bubble-wrap-road-shields-international.zip'
                ]
            },

            'Walkabout': {
                import: [
                  'https://www.nextzen.org/carto/walkabout-style/8/walkabout-style.zip',
                  'https://www.nextzen.org/carto/walkabout-style/8/themes/label-10.zip',
                  'https://www.nextzen.org/carto/walkabout-style/8/themes/walkabout-road-shields-usa.zip',
                  'https://www.nextzen.org/carto/walkabout-style/8/themes/walkabout-road-shields-international.zip'
                ]
            },

            'Refill': {
                import: [
                  'https://www.nextzen.org/carto/refill-style/11/refill-style.zip',
                  'https://www.nextzen.org/carto/refill-style/11/themes/label-10.zip',
                ]
            },

            'Refill Blue Terrain': {
                import: [
                    'https://www.nextzen.org/carto/refill-style/11/refill-style.zip',
                    'https://www.nextzen.org/carto/refill-style/11/themes/label-10.zip',
                    'https://www.nextzen.org/carto/refill-style/11/themes/color-blue.zip',
                    'https://www.nextzen.org/carto/refill-style/11/themes/no-texture.zip',
                    'https://www.nextzen.org/carto/refill-style/11/themes/terrain-pattern-dark.zip'
                ]
            },

            'Tron': {
                import: [
                    'https://www.nextzen.org/carto/tron-style/6/tron-style.zip',
                    'https://www.nextzen.org/carto/tron-style/6/themes/label-10.zip'
                ]
            },

            // Crosshatch style (texture/shader demos)
            'Crosshatch': 'demos/styles/crosshatch.zip',

            // Fragment shader example
            'Rainbow Buildings': {
                import: [
                    'demos/scene.yaml',
                    'demos/styles/rainbow.yaml'
                ],
                layers: {
                    buildings: {
                        polygons: {
                            draw: {
                                polygons: { style: 'rainbow' }
                            },
                            extruded: {
                                draw: {
                                    polygons: { style: 'rainbow' }
                                }
                            }
                        }
                    }
                }
            },

            // Vertex shader example
            'Pop-up Buildings': {
                import: [
                    'demos/scene.yaml',
                    'demos/styles/popup.yaml'
                ],
                layers: {
                    buildings: {
                        polygons: {
                            extruded: {
                                draw: {
                                    polygons: { style: 'popup' }
                                }
                            }
                        }
                    }
                }
            }
        };
        Object.keys(scenes).forEach(function(s){ scenes[s] = JSON.stringify(scenes[s]) }); // need to stringify JSON for dat.gui :(

        gui.scene = scenes[scene_key];
        gui.add(gui, 'scene', scenes).onChange(function(value) {
            scene_key = Object.keys(scenes).filter(function(s){ return scenes[s] === value })[0]; // find scene from sample list
            value = JSON.parse(value); // need to stringify JSON for dat.gui :(
            scene.load(value);
        });
    }

    function setLanguage(gui, scene){
        var langs = {
            '(default)': null,
            'English': 'en',
            'Russian': 'ru',
            'Japanese': 'ja',
            'German': 'de',
            'French': 'fr',
            'Arabic': 'ar',
            'Hindi': 'hi',
            'Spanish': 'es'
        };

        // only add if scene supports language
        if (scene.config.global.language !== undefined || scene.config.global.ux_language !== undefined) {
            gui.language = 'en';
            scene.config.global.language = gui.language;
            scene.config.global.ux_language = gui.language;
            gui.add(gui, 'language', langs).onChange(function(value) {
                scene.config.global.language = value;    // for bundled demos
                scene.config.global.ux_language = value; // for Nextzen basemaps
                scene.updateConfig();
            });
        }
    }

    function setCamera(gui, scene){
        // Only add if scene has all camera types
        var cameras = scene.config.cameras;
        if (cameras.perspective && cameras.isometric && cameras.flat) {
            var camera_types = {
                'Flat': 'flat',
                'Perspective': 'perspective',
                'Isometric': 'isometric'
            };

            gui.camera = scene.getActiveCamera();
            gui.add(gui, 'camera', camera_types).onChange(function(value) {
                scene.setActiveCamera(value);
            });
        }
    }

    function setScreenshot(gui, scene){
        // Take a screenshot and save to file
        gui.screenshot = function () {
            return scene.screenshot().then(function(screenshot) {
                // uses FileSaver.js: https://github.com/eligrey/FileSaver.js/
                saveAs(screenshot.blob, 'tangram-' + (+new Date()) + '.png');
            });
        };
        gui.add(gui, 'screenshot');
    }

    function setMediaRecorder(gui, scene){
        // Take a video capture and save to file
        if (typeof window.MediaRecorder == 'function') {
            gui.video = function () {
                if (!gui.video_capture) {
                    if (scene.startVideoCapture()) {
                        gui.video_capture = true;
                        gui.video_button.name('stop video');
                    }
                }
                else {
                    return scene.stopVideoCapture().then(function(video) {
                        gui.video_capture = false;
                        gui.video_button.name('capture video');
                        saveAs(video.blob, 'tangram-video-' + (+new Date()) + '.webm');
                    });
                }
            };
            gui.video_button = gui.add(gui, 'video');
            gui.video_button.name('capture video');
            gui.video_capture = false;
        }
    }

    function setLayers(gui, scene){
        var layer_gui = gui.addFolder('Layers');
        var layer_controls = {};
        var layers = scene.config.layers;

        for (var key in layers){
            setOnChange(key);
        }
        function setOnChange(key) {
            var layer = layers[key];
            if (!layer) {
                return;
            }

            layer_controls[key] = !(layer.enabled == false);
            layer_gui.add(layer_controls, key)
                .onChange(function(value) {
                    layer.enabled = value;
                    scene.updateConfig();
                });

        }
    }

    function setFeatureDebug(gui) {
        gui.debug = scene.introspection;
        gui.add(gui, 'debug').onChange(function(value) {
            scene.setIntrospection(value);
        });
    }
})();
