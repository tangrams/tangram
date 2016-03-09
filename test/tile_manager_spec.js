import chai from 'chai';
let assert = chai.assert;
import Tile from '../src/tile';
import TileManager from '../src/tile_manager';


let nycLatLng = { lng: -73.97229909896852, lat: 40.76456761707639, zoom: 17 };
let midtownTile = { x: 38603, y: 49255, z: 17 };
let midtownTileKey = `${midtownTile.x}/${midtownTile.y}/${midtownTile.z}`;


describe('TileManager', function () {

    let scene, view;

    beforeEach(() => {
        scene = makeScene({});
        view = scene.view;
        TileManager.init({ scene, view });
        sinon.stub(view, 'findVisibleTileCoordinates').returns([]);
        view.setView(nycLatLng);
    });

    afterEach(() => {
        // scene.destroy();
        scene = null;
    });

    describe('.queueCoordinate(coords)', () => {

        let coords = midtownTile;

        beforeEach(() => {
            sinon.spy(TileManager, 'queueCoordinate');

            return scene.load().then(() => {
                TileManager.queueCoordinate(coords);
                TileManager.loadQueuedCoordinates();
            });
        });

        it('calls queueCoordinate with the queued tile', () => {
            sinon.assert.calledWith(TileManager.queueCoordinate, coords);
        });
    });

    describe('.loadCoordinate(coords)', () => {

        let coords = midtownTile;

        beforeEach(() => {
            return scene.load();
        });

        describe('when the tile manager has not loaded the tile', () => {

            let tile, tiles;

            beforeEach(() => {
                TileManager.loadCoordinate(coords);
                tiles = TileManager.tiles;
                tile = tiles[Object.keys(tiles)[0]];
            });

            it('loads and keeps the tile', () => {
                TileManager.loadCoordinate(coords);
                assert.isTrue(Object.keys(tiles).length === 1);
                assert.instanceOf(tile, Tile);
            });

        });

        describe('when the tile manager already has the tile', () => {
            let key = midtownTileKey;
            let tile, tiles;

            beforeEach(() => {
                TileManager.loadCoordinate(coords);

                tiles = TileManager.tiles;
                tile = tiles[Object.keys(tiles)[0]];

                sinon.spy(TileManager, 'keepTile');
                sinon.spy(tile, 'build');

                TileManager.loadCoordinate(coords);
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
