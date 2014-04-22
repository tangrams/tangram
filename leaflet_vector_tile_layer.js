L.VectorTileLayer = L.GridLayer.extend({

    options: {
        vectorRenderer: 'canvas'
    },

    initialize: function (options) {
        L.setOptions(this, options);
        this.options.vectorRenderer = this.options.vectorRenderer || 'GLRenderer';
        this._renderer = VectorRenderer.create(this.options.vectorRenderer, this.options.vectorTileSource, this.options.vectorLayers, this.options.vectorStyles, { num_workers: this.options.numWorkers });
    },

    // Finish initializing renderer and setup events when layer is added to map
    onAdd: function (map) {
        L.GridLayer.prototype.onAdd.apply(this, arguments);

        var layer = this;

        layer.on('tileunload', function (event) {
            var tile = event.tile;
            var key = tile.getAttribute('data-tile-key');
            layer._renderer.removeTile(key);
        });

        layer._map.on('resize', function () {
            var size = layer._map.getSize();
            layer._renderer.resizeMap(size.x, size.y);
        });

        layer._map.on('move', function () {
            var center = layer._map.getCenter();
            layer._renderer.setCenter(center.lng, center.lat);
        });

        layer._map.on('zoomstart', function () {
            console.log("map.zoomstart " + layer._map.getZoom());
            layer._renderer.startZoom();
        });

        layer._map.on('zoomend', function () {
            console.log("map.zoomend " + layer._map.getZoom());
            layer._renderer.setZoom(layer._map.getZoom());
        });

        // Canvas element will be inserted after map container (leaflet transforms shouldn't be applied to the GL canvas)
        // TODO: find a better way to deal with this? right now GL map only renders correctly as the bottom layer
        layer._renderer.container = layer._map.getContainer();

        var center = layer._map.getCenter();
        layer._renderer.setCenter(center.lng, center.lat);
        layer._renderer.setZoom(layer._map.getZoom());

        layer._renderer.init();
    },

    onRemove: function (map) {
        L.GridLayer.prototype.onRemove.apply(this, arguments);
        // TODO: remove event handlers, destroy map
    },

    createTile: function (coords, done) {
        var div = document.createElement('div');
        this._renderer.loadTile(coords, div, done);
        return div;
    },

    render: function () {
        this._renderer.render();
    }

});

L.vectorTileLayer = function (options) {
    return new L.VectorTileLayer(options);
};
