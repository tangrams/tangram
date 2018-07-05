// Tangram main API
//
// example:
//
// `var map = Tangram.tangramLayer('map');`
//
// This will create a Tangram map in the DOM element (normally a div) called 'map'.


import Thread from './utils/thread';
import Scene from './scene';
import * as interaction from './interaction';

var tangramLayer;
export function tangramLayer(id, options = {}) {
  if (Thread.is_main) {
    return {
      container: document.getElementById(id),
      initialize (initOptions = {}) {
        // if options were defined in both the layer instantiation and the initialize call, merge them
        // (initialization options will override layer options)
        for (var attribute in initOptions) { options[attribute] = initOptions[attribute]; }
        // Defaults
        if (!this.hasOwnProperty('options')) {
            this.options = options;
        }
        for (var i in options) {
            this.options[i] = options[i];
        }

        this.scene = Scene.create();
        this.view = this.scene.view;

        // Add GL canvas to map this.container
        this.scene.container = this.container;

        // Initial view
        this.updateView(this);

        this.scene.load(
            this.options.scene, {}
        ).then(() => {

          this.updateSize(this);

          // Interaction layer initialization
          interaction.init(this.scene, this.view.camera);

        }).catch(error => {
            throw(error);
        });
      },
      
      getCenter: function() {
        return this.view.center;
      },

      getZoom: function() {
        return this.view.zoom;
      },

      setView: function (view) {
        this.view.setView(view);
      },

      updateView: function (map) {
        var view = map._lastCenter;
        view.zoom = map._zoom;
        map.scene.view.setView(view);
      },

      updateSize: function (map) {
        var size = {x: this.container.clientWidth, y: this.container.clientHeight};
        map.scene.resizeMap(size.x, size.y);
      }
    };
  }
}
