import chai from 'chai';
let assert = chai.assert;
import Tile from '../src/tile';
import TileManager from '../src/tile_manager';

let nycLatLng = { lng: -73.97229909896852, lat: 40.76456761707639, zoom: 17 };

describe('Tile', function() {

    let subject,
        scene,
        view,
        coords = { x: 38603, y: 49255, z: 17 };

    beforeEach(() => {
        scene = makeScene({});
        view = scene.view;
        TileManager.init({ scene, view });
        sinon.stub(view, 'findVisibleTileCoordinates').returns([]);
        view.setView(nycLatLng);

        return scene.load().then(() => {
            subject = Tile.create({
                coords,
                style_zoom: coords.z,
                source: scene.sources.osm,
                worker: scene.nextWorker(),
                view: scene.view
            });
        });
    });

    afterEach(() => {
        if (typeof view.findVisibleTileCoordinates.restore === 'function') {
            view.findVisibleTileCoordinates.restore();
        }
        scene.destroy();
        TileManager.destroy();
        scene   = null;
        view    = null;
        subject = null;
    });

    describe('.constructor(spec)', () => {

        it('returns a new instance', () => {
            assert.instanceOf(subject, Tile);
        });

        it('overzooms a coordinate above the tile source max zoom', () => {
            let unzoomed_coords = { x: Math.floor(coords.x*2), y: Math.floor(coords.y*2), z: 18 };
            let overzoomed_coords = { x: Math.floor(coords.x/4), y: Math.floor(coords.y/4), z: 15 };

            let overzoomed = Tile.coordinateWithMaxZoom(unzoomed_coords, 15);

            assert.deepEqual(overzoomed.x, overzoomed_coords.x);
            assert.deepEqual(overzoomed.y, overzoomed_coords.y);
            assert.deepEqual(overzoomed.z, overzoomed_coords.z);
        });

    });

    describe('.create(spec)', () => {
        it('returns a new instance', () => {
            assert.instanceOf(Tile.create({source: scene.sources.osm, coords: { x: 10, y: 10, z: 10 }, style_zoom: 10 }), Tile);
        });
    });

    describe('.build(generation)', () => {
        beforeEach(() => {
            sinon.spy(subject, 'workerMessage');
        });

        afterEach(() => {
            subject.workerMessage.restore();
        });

        it('calls .workerMessage()', () => {
            subject.build();
            sinon.assert.called(subject.workerMessage);
        });
    });

    describe('sets visibility', () => {

        describe('without a source max_zoom', () => {

            it('is visible when scene is at same zoom as tile zoom', () => {
                view.findVisibleTileCoordinates.restore();
                sinon.stub(view, 'findVisibleTileCoordinates').returns([Tile.coordinateWithMaxZoom(subject.coords, view.zoom)]);
                view.updateBounds();
                TileManager.updateVisibility(subject);
                view.findVisibleTileCoordinates.restore();

                assert.isTrue(subject.visible);
            });

            it('is NOT visible when scene is lower than tile zoom', () => {
                let z = 16;
                view.findVisibleTileCoordinates.restore();
                sinon.stub(view, 'findVisibleTileCoordinates').returns([Tile.coordinateWithMaxZoom(subject.coords, z)]);
                view.setZoom(z);
                TileManager.updateVisibility(subject);
                view.findVisibleTileCoordinates.restore();

                assert.isFalse(subject.visible);
            });

            it('is NOT visible when scene is higher than tile zoom', () => {
                let z = 18;
                view.findVisibleTileCoordinates.restore();
                sinon.stub(view, 'findVisibleTileCoordinates').returns([Tile.coordinateWithMaxZoom(subject.coords, z)]);
                view.setZoom(z);
                TileManager.updateVisibility(subject);
                view.findVisibleTileCoordinates.restore();

                assert.isFalse(subject.visible);
            });

        });

        describe('with a source max_zoom', () => {

            let old_max_zoom;

            beforeEach(() => {
                old_max_zoom = scene.sources.osm.max_zoom;
                scene.sources.osm.max_zoom = 17;
            });

            afterEach(() => {
                scene.sources.osm.max_zoom = old_max_zoom;
            });

            it('is visible when scene is higher than tile zoom and tile is at its max zoom', () => {
                let z = 18;
                view.findVisibleTileCoordinates.restore();
                sinon.stub(view, 'findVisibleTileCoordinates').returns([Tile.coordinateWithMaxZoom(subject.coords, z)]);
                view.setZoom(z);
                subject = Tile.create({coords: subject.coords, view: view, style_zoom: view.zoom, source: scene.sources.osm});
                TileManager.updateVisibility(subject);
                view.findVisibleTileCoordinates.restore();

                assert.isTrue(subject.visible);
            });

            it('is NOT visible when scene is higher than tile zoom and tile is NOT at its max zoom', () => {
                let z = 14;
                view.findVisibleTileCoordinates.restore();
                sinon.stub(view, 'findVisibleTileCoordinates').returns([Tile.coordinateWithMaxZoom(subject.coords, z)]);
                view.setZoom(z);
                subject = Tile.create({coords: subject.coords, view: view, style_zoom: view.zoom, source: scene.sources.osm});
                TileManager.updateVisibility(subject);

                assert.isFalse(subject.visible);
            });

        });

    });
});
