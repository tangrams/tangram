// Create dat GUI
var gui = new dat.GUI({ autoPlace: true });
gui.domElement.parentNode.style.zIndex = 10000;

window.addEventListener('load', function () {
        // Scene initialized
    layer.on('init', function() {
        addGUI();
    });
});

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

function addGUI () {
    setLanguage(gui, scene);
    setCamera(gui, scene);
    setFeatureInfo(gui);
    setMediaRecorder(gui, scene);
    setScreenshot(gui, scene);
    setLayers(gui, scene);
    setEffects(gui);
    setScene(gui);
}

function setScene(gui){
    var scenes = {
        default: '//demos/scene.yaml',
        tron: 'https://mapzen.com/carto/tron-style/2/tron-style.zip',
        bubble_wrap: 'https://mapzen.com/carto/bubble-wrap-style/bubble-wrap.zip',
        walkabout: 'https://mapzen.com/carto/walkabout-style/walkabout-style.yaml'
    };

    gui.scene = scenes.default;
    gui.add(gui, 'scene', scenes).onChange(function(value) {
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

    gui.language = langs.English;
    gui.add(gui, 'language', langs).onChange(function(value) {
        scene.config.global.language = value;
        scene.updateConfig();
    });
}

function setCamera(gui, scene){
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

function setFeatureInfo(gui){
    // Feature selection on hover
    gui['feature info'] = true;
    gui.add(gui, 'feature info');
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
        var layer = layers[key];
        if (!layer) {
            return;
        }

        layer_controls[key] = !(layer.enabled == false);
        layer_gui.add(layer_controls, key)
            .onChange(function(value) {
                layer.enabled = value;
                scene.rebuild();
            });
    }
}

function setEffects(gui){
    // GUI options for rendering style/effects
    var style_options = {
        effect: '',
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

                    scene.config.layers.earth.fill.enabled = true; // some custom shaders may need to render earth
                }
                else {
                    scene.config.layers.earth.fill.enabled = false; // don't need earth layer in default style
                }
            }

            // Recompile/rebuild
            scene.updateConfig();
            // updateURL();

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
                    scene.config.layers.earth.fill.draw.polygons.color = '#333';
                    scene.config.layers.roads.draw.lines.color = '#777';
                    scene.config.layers.pois.enabled = false;
                    scene.config.layers.buildings.polygons.draw.polygons.style = style;
                    scene.config.layers.buildings.polygons.extruded.draw.polygons.style = style;
                }
            },
            'popup': {
                setup: function (style) {
                    scene.config.layers.buildings.polygons.extruded.draw.polygons.style = style;
                }
            },
            'elevator': {
                setup: function (style) {
                    scene.config.layers.buildings.polygons.extruded.draw.polygons.style = style;
                }
            },
            'halftone': {
                setup: function (style) {
                    scene.config.scene.background.color = 'black';

                    var layers = scene.config.layers;
                    layers.earth.fill.draw.polygons.style = 'halftone_polygons';
                    layers.water.draw.polygons.style = 'halftone_polygons';
                    layers.landuse.areas.draw.polygons.style = 'halftone_polygons';
                    layers.buildings.polygons.draw.polygons.style = 'halftone_polygons';
                    layers.buildings.polygons.extruded.draw.polygons.style = 'halftone_polygons';
                    layers.buildings.polygons.draw.polygons.color = 'Style.color.pseudoRandomColor()';
                    layers.roads.draw.lines.style = 'halftone_lines';
                    layers.pois.enabled = false;

                    var enabled_layers = ['landuse', 'water', 'roads', 'buildings'];
                    Object.keys(layers).forEach(function(l) {
                        if (enabled_layers.indexOf(l) === -1) {
                            layers[l].enabled = false;
                        }
                    });
                }
            },
            'windows': {
                camera: 'isometric', // force isometric
                setup: function (style) {
                    scene.config.layers.earth.fill.draw.polygons.color = '#333';
                    scene.config.layers.roads.draw.lines.color = '#777';
                    scene.config.layers.pois.enabled = false;

                    scene.config.layers.buildings.polygons.draw.polygons.style = style;
                    scene.config.layers.buildings.polygons.extruded.draw.polygons.style = style;
                    // scene.config.layers.pois.enabled = false;
                }
            },
            'envmap': {
                setup: function (style) {
                    scene.config.layers.earth.fill.draw.polygons.color = '#333';
                    scene.config.layers.roads.draw.lines.color = '#777';

                    scene.config.layers.buildings.polygons.draw.polygons.style = style;
                    scene.config.layers.buildings.polygons.extruded.draw.polygons.style = style;

                    var envmaps = {
                        'Sunset': 'demos/images/sunset.jpg',
                        'Chrome': 'demos/images/LitSphere_test_02.jpg',
                        'Matte Red': 'demos/images/matball01.jpg',
                        'Color Wheel': 'demos/images/wheel.png'
                    };

                    this.state.envmap = envmaps['Sunset'];
                    this.folder.add(this.state, 'envmap', envmaps).onChange(function(value) {
                        scene.config.styles.envmap.material.emission.texture = value;
                        scene.load(scene.config, scene.config_path);
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

    gui.add(style_options, 'effect', style_options.options)
        .onChange(function(value){
            style_options.saveInitial();
            style_options.setup(value);
        });
}