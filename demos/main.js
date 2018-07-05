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

    this.map = Tangram.tangramLayer('map', {
      scene: scene_url
      // scene: {
      //   import: [
      //     'https://www.nextzen.org/carto/bubble-wrap-style/8/bubble-wrap-style.zip',
      //     'https://www.nextzen.org/carto/bubble-wrap-style/8/themes/label-10.zip',
      //   ],
      //   sources: {
      //     mapzen: {
      //       type: 'MVT',
      //       url: 'https://tile.nextzen.org/tilezen/vector/v1/256/all/{z}/{x}/{y}.mvt',
      //       url_params: {
      //         api_key: 'tsINU1vsQnKLU1jjCimtVw',
      //       },
      //       tile_size: 256,
      //       max_zoom: 16,
      //     },
      //   },
      // },
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
