import Scene from './scene';

import log from 'loglevel';

export var LeafletLayer = L.GridLayer.extend({

    initialize: function (options) {
        L.setOptions(this, options);
        this.createScene();
        this.hooks = {};
    },

    createScene: function () {
        this.scene = Scene.create({
            tile_source: this.options.vectorTileSource,
            layers: this.options.vectorLayers,
            styles: this.options.vectorStyles
        }, {
            numWorkers: this.options.numWorkers,
            preRender: this.options.preRender,
            postRender: this.options.postRender,
            // advanced option, app will have to manually called scene.render() per frame
            disableRenderLoop: this.options.disableRenderLoop
        });
    },

    // Finish initializing scene and setup events when layer is added to map
    onAdd: function () {
        if (!this.scene) {
            this.createScene();
        }

        L.GridLayer.prototype.onAdd.apply(this, arguments);

        this.hooks.tileunload = (event) => {
            // TODO: not expecting leaflet to fire this event for tiles that simply pan
            // out of bounds when 'unloadInvisibleTiles' option is set, but it's firing
            // since upgrading to latest master branch - force-checking for now
            if (this.options.unloadInvisibleTiles) {
                var tile = event.tile;
                var key = tile.getAttribute('data-tile-key');
                this.scene.removeTile(key);
            }
        };
        this.on('tileunload', this.hooks.tileunload);

        this.hooks.resize = () => {
            var size = this._map.getSize();
            this.scene.resizeMap(size.x, size.y);
        };
        this._map.on('resize', this.hooks.resize);

        this.hooks.move = () => {
            var center = this._map.getCenter();
            this.scene.setCenter(center.lng, center.lat);
            this.scene.immediateRedraw();
        };
        this._map.on('move', this.hooks.move);

        this.hooks.zoomstart = () => {
            this.scene.startZoom();
        };
        this._map.on('zoomstart', this.hooks.zoomstart);

        this.hooks.zoomend = () => {
            this.scene.setZoom(this._map.getZoom());
        };
        this._map.on('zoomend', this.hooks.zoomend);

        this.hooks.dragstart = () => {
            this.scene.panning = true;
        };
        this._map.on('dragstart', this.hooks.dragstart);

        this.hooks.dragend = () => {
            this.scene.panning = false;
        };
        this._map.on('dragend', this.hooks.dragend);

        // Canvas element will be inserted after map container (leaflet transforms shouldn't be applied to the GL canvas)
        // TODO: find a better way to deal with this? right now GL map only renders correctly as the bottom layer
        this.scene.container = this._map.getContainer();

        var center = this._map.getCenter();
        this.scene.setCenter(center.lng, center.lat, this._map.getZoom());

        // Use leaflet's existing event system as the callback mechanism
        this.scene.init().then(() => {
            log.debug('Scene.init() succeeded');
            this.fire('init');
        }, (error) => {
            log.error('Scene.init() failed with error:', error);
            throw error;
        });
    },

    onRemove: function () {
        L.GridLayer.prototype.onRemove.apply(this, arguments);

        this.off('tileunload', this.hooks.tileunload);
        this._map.off('resize', this.hooks.resize);
        this._map.off('move', this.hooks.move);
        this._map.off('zoomstart', this.hooks.zoomstart);
        this._map.off('zoomend', this.hooks.zoomend);
        this._map.off('dragstart', this.hooks.dragstart);
        this._map.off('dragend', this.hooks.dragend);
        this.hooks = {};

        if (this.scene) {
            this.scene.destroy();
            this.scene = null;
        }
    },

    createTile: function (coords) {
        var div = document.createElement('div');
        this.scene.loadTile(coords, { debugElement: div });
        return div;
    },

    render: function () {
        if (!this.scene) {
            return;
        }
        this.scene.render();
    }

});

export function leafletLayer(options) {
    return new LeafletLayer(options);
}
