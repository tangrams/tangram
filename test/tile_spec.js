import chai from 'chai';
let assert = chai.assert;
import Tile from '../src/tile';
import samples from './fixtures/samples';

let nycLatLng = { lng: -73.97229909896852, lat: 40.76456761707639, zoom: 17 };

describe('Tile', () => {
    let subject,
        scene;

    beforeEach((done) => {
        scene = makeScene({});
        scene.setView(nycLatLng);
        scene.init().then(() => {
            subject = Tile.create({coords: { x: 38605, y: 49254, z: 17 }, worker: scene.nextWorker()});
            done();
        });
    });

    afterEach(() => {
        scene.destroy();
        scene   = null;
        subject = null;
    });

    describe('.constructor(spec)', () => {

        it('returns a new instance', () => {
            assert.instanceOf(subject, Tile);
        });

        it('overzooms a coordinate above the tile source max zoom', () => {
            let unzoomed_coords = { x: 77202, y: 98506, z: 18 };
            let overzoomed_coords = { x: 9650, y: 12313, z: 15 };

            let overzoom_tile = new Tile({
                max_zoom: 15,
                coords: unzoomed_coords
            });

            assert.deepEqual(overzoom_tile.coords, overzoomed_coords);
        });

    });

    describe('.create(spec)', () => {
        it('returns a new instance', () => {
            assert.instanceOf(Tile.create({tile_source: scene.tile_source, coords: { x: 10, y: 10, z: 10 }}), Tile);
        });
    });

    describe('.build(scene)', () => {
        beforeEach(() => {
            sinon.spy(subject, 'workerMessage');
        });

        afterEach(() => {
            subject.workerMessage.restore();
        });

        it('calls .workerMessage()', () => {
            subject.build(scene);
            sinon.assert.called(subject.workerMessage);
        });
    });

    describe('.load(scene)', () => {

        beforeEach(() => {
            subject = Tile.create({tile_source: scene.tile_source, coords: _.clone(samples.nyc_coords), worker: scene.nextWorker()});

            sinon.stub(subject, 'build');
            sinon.spy(subject,  'update');

            subject.load(scene);
        });

        afterEach(() => {
            subject.update.restore();
        });

        it('sets the key value', () => {
            assert.propertyVal(subject, 'key', '150/192/9');
        });

        it('updates relative to scene', () => {
            sinon.assert.called(subject.update);
        });

    });

    describe('sets visibility', () => {

        describe('without a max_zoom', () => {

            it('is visible when scene is at same zoom as tile zoom', () => {
                subject.update(scene);
                assert.isTrue(subject.visible);
            });

            it('is NOT visible when scene is lower than tile zoom', () => {
                scene.setZoom(16);
                subject.update(scene);
                assert.isFalse(subject.visible);
            });

            it('is NOT visible when scene is higher than tile zoom', () => {
                scene.setZoom(18);
                subject.update(scene);
                assert.isFalse(subject.visible);
            });

        });

        describe('with a max_zoom', () => {

            beforeEach(() => {
                subject.max_zoom = 17;
            });

            afterEach(() => {
                delete subject.max_zoom;
            });

            it('is visible when scene is higher than tile zoom and tile is at its max zoom', () => {
                scene.setZoom(18);
                subject.update(scene);
                assert.isTrue(subject.visible);
            });

            it('is NOT visible when scene is higher than tile zoom and tile is NOT at its max zoom', () => {
                subject.max_zoom = 16;
                scene.setZoom(18);
                subject.update(scene);
                assert.isFalse(subject.visible);
            });

        });

    });
});
