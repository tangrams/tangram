import chai from 'chai';
let assert = chai.assert;
import Tile from '../src/tile';
import samples from './fixtures/samples';

let nycLatLng = [-73.97229909896852, 40.76456761707639, 17];

describe('Tile', () => {
    let subject,
        scene;

    beforeEach((done) => {
        scene = makeScene({});
        scene.setCenter(...nycLatLng);
        scene.init().then(() => {
            subject = Tile.create({tile_source: scene.tile_source, coords: { x: 10, y: 10, z: 10 }, worker: scene.nextWorker()});
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
            let overzoom_source = TileSource.create(_.clone(sampleScene.tile_source));
            overzoom_source.max_zoom = 15;

            let unzoomed_coords = { x: 77202, y: 98506, z: 18 };
            let overzoomed_coords = { x: 9650, y: 12313, z: 15 };

            let overzoom_tile = new Tile ({
                coords: unzoomed_coords,
                tile_source: overzoom_source
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
            sinon.spy(subject,  'updateVisibility');

            subject.load(scene);
        });

        afterEach(() => {
            subject.updateVisibility.restore();
        });

        it('sets the key value', () => {
            assert.propertyVal(subject, 'key', '150/192/9');
        });

        it('updates the visiblility', () => {
            sinon.assert.called(subject.updateVisibility);
        });

    });
});
