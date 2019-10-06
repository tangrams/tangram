/*
    Hello source-viewers!
    We're glad you're interested in how Tangram can be used to make amazing maps!
    - The Tangram team
*/

(function () {
    var scene_url = 'demos/scene.yaml';

    /*** Map ***/
    // Create Tangram map in the element called 'map'
    var map = Tangram.tangramLayer('map');

    // optionally override scene URL
    // if ('URLSearchParams' in window) {
    //     var params = new URLSearchParams(window.location.search);
    //     if (params.get('scene')) {
    //         scene_url = params.get('scene');
    //         if (scene_url[0] === '{') {
    //             scene_url = JSON.parse(scene_url); // parse JSON-encoded scenes
    //         }
    //     }
    // }

    // // Create Tangram as a Leaflet layer
    // var layer = Tangram.leafletLayer({
    //     scene: scene_url,
    //     events: {
    //         hover: onHover,     // hover event (defined below)
    //         click: onClick      // click event (defined below)
    //     },
    //     // debug: {
    //     //     layer_stats: true // enable to collect detailed layer stats, access w/`scene.debug.layerStats()`
    //     // },
    //     logLevel: 'debug',
    //     attribution: '<a href="https://github.com/tangrams/tangram" target="_blank">Tangram</a> | &copy; OSM contributors | <a href="https://nextzen.org/" target="_blank">Nextzen</a>'
    // });

    // // Create a Leaflet map
    // var map = L.map('map', {
    //     maxZoom: 22,
    //     zoomSnap: 0,
    //     keyboard: false
    // });

    this.map = Tangram.tangramLayer('map', {
        scene: scene_url
    });

    /*** Map ***/

    window.addEventListener('load', () => {
        const options = {
            maxZoom: 20,
            zoomSnap: 0,
            keyboard: false,
        };
        this.map.center = { lat: 40.70531887544228, lng: -74.00976419448853 };
        this.map.zoom = 16.;
        this.map.initialize(options);

        window.scene = map.scene; // set by tangramLayer
    });
    window.map = map;
}());
