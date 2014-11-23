import chai from 'chai';
let assert = chai.assert;
import Tile from '../src/tile';
import samples from './fixtures/samples';
import TileSource  from '../src/tile_source';
import Scene       from '../src/scene';
import sampleScene from './fixtures/sample-scene';

function makeScene(options) {
    options = options || {};
    options.disableRenderLoop = true;
    return new Scene(
        TileSource.create(_.clone(sampleScene.tile_source)),
        sampleScene.layers,
        sampleScene.styles,
        options
    );
}

let nycLatLng = [-73.97229909896852, 40.76456761707639, 17];

describe('Tile', () => {
    let subject,
        scene,
        div    = document.createElement('div');

    beforeEach((done) => {
        scene = makeScene({});
        scene.setCenter(...nycLatLng);
        scene.init().then(() => {
            subject = Tile.create({tile_source: scene.tile_source, coords: { x: 10, y: 10, z: 10 }});
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
    });

    describe('.create(spec)', () => {
        it('returns a new instance', () => {
            assert.instanceOf(Tile.create({}), Tile);
        });
    });

    describe('.build(scene, key)', () => {
        beforeEach(() => {
            sinon.stub(subject, 'workerMessage');
        });

        afterEach(() => {
            subject.workerMessage.restore();
        });

        it('calls .workerMessage()', () => {
            subject.build(scene);
            sinon.assert.called(subject.workerMessage);
        });
    });

    describe('.load(scene, coords, div, cb)', () => {

        function doLoad(cb) {
            subject.load(scene, _.clone(samples.nyc_coords), div, cb);
        }

        beforeEach(() => {
            sinon.stub(subject, 'build');
            sinon.spy(subject,  'updateElement');
            sinon.spy(subject,  'updateVisibility');
        });

        describe('when the tile was not already loaded', () => {

            it('calls back with the div', (done) => {
                doLoad((error, el) => {
                    assert.instanceOf(el, HTMLElement);
                    done();
                });
            });

            it('sets the key value', (done) => {
                doLoad((error, el) => {
                    assert.propertyVal(subject, 'key', '150/192/9');
                    done();
                });
            });

            it('updates the html element', (done) => {
                doLoad((error, el) => {
                    sinon.assert.called(subject.updateElement);
                    done();
                });
            });

            it('updates the visiblility', (done) => {
                doLoad((error, el) => {
                    sinon.assert.called(subject.updateVisibility);
                    done();
                });
            });
        });

    });

    describe('.isInZoom(scene, zoom)', () => {});

    describe('.updateVisibility(scene)', () => {});

});
