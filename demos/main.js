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
    var scene_url = 'demos/scene.yaml', rStats_debug, url_style, postUpdate, preUpdate;

    var map_start_location = [16, 40.70531887544228, -74.00976419448853]; // NYC
    var url_hash = getValuesFromUrl();

    // default source, can be overriden by URL
    var map = L.map('map', {
        maxZoom: 20,
        zoomSnap: 0,
        trackResize: true
    });

    var layer = Tangram.leafletLayer({
        scene: scene_url,
        events: {
            hover: onFeatureHover
        },
        preUpdate: preUpdate,
        postUpdate: postUpdate,
        logLevel: 'debug',
        attribution: '<a href="https://mapzen.com/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://mapzen.com/" target="_blank">Mapzen</a>'
    });

    // useful events to subscribe to
    layer.scene.subscribe({
        load: function (msg) {
            // scene was loaded
        },
        update: function (msg) {
            // scene updated
        },
        view_complete: function (msg) {
            // new set of map tiles was rendered
        },
        error: function (msg) {
            // on error;
        },
        warning: function (msg) {
            // on warning;
        }
    });

    /*** URL parsing ***/

    // URL hash pattern is one of:
    // #[zoom],[lat],[lng]
    // #[source],[zoom],[lat],[lng] (legacy)
    function getValuesFromUrl() {
        var url_hash = window.location.hash.slice(1, window.location.hash.length).split('/');

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

        return url_hash;
    }

    // Put current state on URL
    var update_url_throttle = 100;
    var update_url_timeout = null;
    function updateURL() {
        clearTimeout(update_url_timeout);
        update_url_timeout = setTimeout(function() {
            var center = map.getCenter();
            var url_options = [map.getZoom(), center.lat, center.lng];

            if (rStats_debug) {
                url_options.push('rstats');
            }

            if (style_options && style_options.effect != '') {
                url_options.push('style=' + style_options.effect);
            }

            window.location.hash = url_options.join('/');
        }, update_url_throttle);
    }

    /*** Map ***/
    var scene = layer.scene;
    window.scene = scene;

    // Update URL hash on move
    map.attributionControl.setPrefix('');
    map.setView(map_start_location.slice(1, 3), map_start_location[0]);
    map.on('move', updateURL);

    // Render/GL stats: http://spite.github.io/rstats/
    // Activate with 'rstats' anywhere in options list in URL
    if (url_hash.indexOf('rstats') >= 0) {
        var glS = new glStats();
        glS.fractions = []; // turn this off till we need it

        rStats_debug = new rStats({
            values: {
                frame: { caption: 'Total frame time (ms)', over: 10 },
                raf: { caption: 'Time since last rAF (ms)' },
                fps: { caption: 'Framerate (FPS)', below: 40 },
                tiles: { caption: 'Rendered tiles' },
                geometry_count: { caption: '# geoms' },
                feature_count: { caption: '# features' },
                buffer_size: { caption: 'GL buffers (MB)' }
            },
            CSSPath : 'demos/lib/',
            plugins: [glS]
        });

        // Move it to the bottom-left so it doesn't obscure zoom controls
        var rSDOM = document.querySelector('.rs-base');
        rSDOM.style.bottom = '0px';
        rSDOM.style.top = 'inherit';

        postUpdate = function postUpdate () {
            rStats_debug('frame').end();
            rStats_debug('tiles').set(scene.debug.renderableTilesCount());
            rStats_debug('buffer_size').set((scene.tile_manager.getDebugSum('buffer_size') / (1024*1024)).toFixed(2));
            rStats_debug('geometry_count').set(scene.tile_manager.getDebugSum('geometry_count'));
            rStats_debug('feature_count').set(scene.tile_manager.getDebugSum('feature_count'));
            rStats_debug().update();
        }
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
    preUpdate = function preUpdate (will_render) {
        // Input
        if (key.isPressed('up')) {
            map._move(map.getCenter(), map.getZoom() + zoom_step);
        }
        else if (key.isPressed('down')) {
            map._move(map.getCenter(), map.getZoom() - zoom_step);
        }

        // Profiling
        if (rStats_debug) {
            rStats_debug('fps').frame();
            if (will_render) {
                rStats_debug('frame').start();
                glS.start();
            }
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

        layer.bringToFront();
    });

    // Link to edit in OSM - alt-click
    window.addEventListener('click', function () {
        if (key.alt) {
            var url = 'https://www.openstreetmap.org/edit?';
            var center = map.getCenter();
            url += '#map=' + map.getZoom() + '/' + center.lat + '/' + center.lng;
            window.open(url, '_blank');
        }
    });
}());
