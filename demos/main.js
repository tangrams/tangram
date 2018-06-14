/*
    Hello source-viewers!
    We're glad you're interested in how Tangram can be used to make amazing maps!
    - The Tangram team
*/

(function () {
    var scene_url = 'demos/scene.yaml';

    // Create Tangram map in the element called 'map'
    var map = Tangram.tangramLayer('map');

    /*** Map ***/

    window.addEventListener('load', function() {
        options = {
            scene: scene_url,
            maxZoom: 20,
            zoomSnap: 0,
            keyboard: false
        };
        map._lastCenter = {lat: 40.70531887544228, lng: -74.00976419448853};
        map._zoom = 16.;

        map.initialize(options);

        window.scene = map.scene; // set by tangramLayer

    });
    window.map = map;

}());
