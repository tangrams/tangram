import Scene from './scene';

export var LeafletLayer = L.GridLayer.extend({

    initialize: function (options) {
        L.setOptions(this, options);
        this.scene = new Scene(
            this.options.vectorTileSource,
            this.options.vectorLayers,
            this.options.vectorStyles,
            { num_workers: this.options.numWorkers }
        );

        this.scene.debug = this.options.debug;
        this.scene.continuous_animation = false; // set to true for animatinos, etc. (eventually will be automated)
    },

    // Finish initializing scene and setup events when layer is added to map
    onAdd: function (map) {

        this.on('tileunload', (event) => {
            var tile = event.tile;
            var key = tile.getAttribute('data-tile-key');
            this.scene.removeTile(key);
        });

        this._map.on('resize', () => {
            var size = this._map.getSize();
            this.scene.resizeMap(size.x, size.y);
            this.updateBounds();
        });

        this._map.on('move',  () => {
            var center = this._map.getCenter();
            this.scene.setCenter(center.lng, center.lat);
            this.updateBounds();
        });

        this._map.on('zoomstart', () => {
            console.log("map.zoomstart " + this._map.getZoom());
            this.scene.startZoom();
        });

        this._map.on('zoomend',  () => {
            console.log("map.zoomend " + this._map.getZoom());
            this.scene.setZoom(this._map.getZoom());
            this.updateBounds();
        });

        this._map.on('dragstart',  () => {
            this.scene.panning = true;
        });

        this._map.on('dragend', () => {
            this.scene.panning = false;
        });

        // Canvas element will be inserted after map container (leaflet transforms shouldn't be applied to the GL canvas)
        // TODO: find a better way to deal with this? right now GL map only renders correctly as the bottom layer
        this.scene.container = this._map.getContainer();

        var center = this._map.getCenter();
        this.scene.setCenter(center.lng, center.lat);
        console.log("zoom: " + this._map.getZoom());
        this.scene.setZoom(this._map.getZoom());
        this.updateBounds();

        L.GridLayer.prototype.onAdd.apply(this, arguments);

        // Use leaflet's existing event system as the callback mechanism
        this.scene.init(() => {
            this.fire('init');
        });
    },

    onRemove: function (map) {
        L.GridLayer.prototype.onRemove.apply(this, arguments);
        // TODO: remove event handlers, destroy map
    },

    createTile: function (coords, done) {
        var div = document.createElement('div');
        this.scene.loadTile(coords, div, done);
        return div;
    },

    updateBounds: function () {
        var bounds = this._map.getBounds();
        this.scene.setBounds(bounds.getSouthWest(), bounds.getNorthEast());
    },

    render: function () {
        this.scene.render();
    }

});

export function leafletLayer(options) {
    return new LeafletLayer(options);
}
