/*
    Hello source-viewers!
    We're glad you're interested in how Tangram can be used to make amazing maps!
    - The Tangram team
*/

(function () {
    var scene_url = 'demos/scene.yaml';

    // Create Tangram map in the element called 'map'
    // var map = Tangram.tangramLayer('map');

    /*** Map ***/

    // window.addEventListener('load', function() {
    //     options = {
    //         scene: scene_url,
    //         maxZoom: 20,
    //         zoomSnap: 0,
    //         keyboard: false
    //     };
    //     map._lastCenter = {lat: 40.70531887544228, lng: -74.00976419448853};
    //     map._zoom = 16.;

    //     map.initialize(options);

    //     window.scene = map.scene; // set by tangramLayer

    // });

    this.map = Tangram.tangramLayer('map', {
      scene: {
        import: [
          'http://localhost:8000/demos/scene.yaml'
          // 'https://www.nextzen.org/carto/bubble-wrap-style/8/bubble-wrap-style.zip',
          // 'https://www.nextzen.org/carto/bubble-wrap-style/8/themes/label-10.zip',
        ],
        sources: {
          mapzen: {
            url: 'https://tile.nextzen.org/tilezen/vector/v1/256/all/{z}/{x}/{y}.mvt',
            url_params: {
              api_key: 'tsINU1vsQnKLU1jjCimtVw',
            },
            tile_size: 256,
            max_zoom: 16,
          },
        },
      },
    });

    /*** Map ***/

    window.addEventListener('load', () => {
      const options = {
        maxZoom: 20,
        zoomSnap: 0,
        keyboard: false,
      };
      this.map._lastCenter = { lat: 40.70531887544228, lng: -74.00976419448853 };
      this.map._zoom = 16.;

      this.map.initialize(options);

      window.scene = map.scene; // set by tangramLayer

    });
    // window.map = map;
}());
