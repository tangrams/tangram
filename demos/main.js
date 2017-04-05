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
    var scene_url = 'demos/scene.yaml';

    // default source, can be overriden by URL
    var map = L.map('map', {
        maxZoom: 20,
        zoomSnap: 0
    });

    var layer = Tangram.leafletLayer({
        scene: scene_url,
        events: {
            hover: onFeatureHover
        },
        // logLevel: 'debug',
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

    // Feature selection
    var selection_info = document.createElement('div'); // shown on hover
    selection_info.setAttribute('class', 'label');

    function onFeatureHover (selection) {
        // Show selection info
        var feature = selection.feature;
        if (feature && feature.properties.name) {
            var name = feature.properties.name;

            selection_info.style.left = selection.pixel.x + 'px';
            selection_info.style.top = selection.pixel.y + 'px';
            selection_info.innerHTML = '<span class="labelInner">' + name + '</span>';

            if (selection_info.parentNode == null) {
                map.getContainer().appendChild(selection_info);
            }
        }
        else if (selection_info.parentNode != null) {
            selection_info.parentNode.removeChild(selection_info);
        }
    }

    /*** Map ***/
    var scene = layer.scene;
    window.scene = scene;
    window.map = map;
    window.layer = layer;

    var zoom_step = 0.03;
    // // Pre-render hook
    var preUpdate = function preUpdate (will_render) {
        if (key.isPressed('up')) {
            map._move(map.getCenter(), map.getZoom() + zoom_step);
        }
        else if (key.isPressed('down')) {
            map._move(map.getCenter(), map.getZoom() - zoom_step);
        }
    }

    /***** Render loop *****/
    window.addEventListener('load', function () {
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
