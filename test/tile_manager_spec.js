import chai from 'chai';
let assert = chai.assert;
import Tile from '../src/tile';
import TileManager from '../src/tile_manager';


let nycLatLng = { lng: -73.97229909896852, lat: 40.76456761707639, zoom: 17 };
let midtownTile = { x: 38603, y: 49255, z: 17 };
let midtownTileKey = `${midtownTile.x}/${midtownTile.y}/${midtownTile.z}`;


describe('TileManager', function () {

    let scene;

    beforeEach(() => {
        scene = makeScene({});
        sinon.stub(scene, 'findVisibleTiles').returns([]);
        scene.setView(nycLatLng);
    });

    afterEach(() => {
        // scene.destroy();
        scene = null;
    });

    describe('.queueTile(coords)', () => {

        let coords = midtownTile;

        beforeEach(() => {
            sinon.spy(TileManager, 'loadTile');

            return scene.init().then(() => {
                TileManager.queueTile(coords);
                TileManager.loadQueuedTiles();
            });
        });

        it('calls loadTile with the queued tile', () => {
            sinon.assert.calledWith(TileManager.loadTile, coords);
        });
    });

    describe('.loadTile(coords, options)', () => {

        let coords = midtownTile;

        beforeEach(() => {
            return scene.init();
        });

        describe('when the tile manager has not loaded the tile', () => {

            it('loads the tile', () => {
                let tile = TileManager.loadTile(coords);
                assert.instanceOf(tile, Tile);
            });

            it('keeps the tile', () => {
                let tile = TileManager.loadTile(coords);
                let tiles = TileManager.tiles;
                assert.instanceOf(tiles[tile.key], Tile);
            });
        });

        describe('when the tile manager already has the tile', () => {
            let key = midtownTileKey;
            let tile;

            beforeEach(() => {
                TileManager.loadTile(coords);
                sinon.spy(TileManager, 'keepTile');
                tile = TileManager.loadTile(coords);
                sinon.spy(tile, 'build');
            });

            afterEach(() => {
                TileManager.keepTile.restore();
                tile.build.restore();
                TileManager.tiles[key] = undefined;
            });

            it('does not build the tile', () => {
                assert.isFalse(tile.build.called);
            });

            it('does not keep the tile', () => {
                assert.isFalse(TileManager.keepTile.called);
            });

        });

    });

});
