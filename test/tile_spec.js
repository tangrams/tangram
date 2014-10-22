import chai from 'chai';
let assert = chai.assert;

import Tile from '../src/tile';
import Scene from '../src/scene';

import mockScene from './fixtures/sample-scene';
import samples from './fixtures/samples';

let nyc_bounds = samples.nyc_bounds;

describe('Tile', () => {
    let subject,
        scene,
        div    = document.createElement('div');

    beforeEach((done) => {
        scene = Scene.create(_.clone(mockScene));
        scene.init(() => {
            scene.setBounds(nyc_bounds.south_west, nyc_bounds.north_east);
            subject = Tile.create({tile_source: mockScene.tile_source});
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
            assert.property(subject, 'max');
            assert.property(subject, 'min');
            assert.property(subject, 'debug');
            assert.property(subject, 'bounds');
            assert.property(subject, 'loading');
            assert.property(subject, 'loaded');
            assert.property(subject, 'key');
        });
    });

    describe('Tile.create(spec)', () => {
        it('returns a new instance', () => {
            assert.instanceOf(Tile.create({}), Tile);
        });
    });

    describe('Tile.build(scene, key)', () => {
        beforeEach(() => {
            sinon.stub(scene, 'workerPostMessageForTile');
        });

        afterEach(() => {
            scene.workerPostMessageForTile.restore();
        });

        it('calls scene.workerPostMessageForTile()', () => {
           subject.build(scene);
           sinon.assert.called(scene.workerPostMessageForTile);
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

            it.skip('sets the key value', (done) => {
                doLoad((error, el) => {
                    assert.propertyVal(subject, 'key', '524288/524288/20');
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

            it.skip('calculates the min', (done) => {
                doLoad((error, el) => {
                    assert.deepPropertyVal(subject, 'min.x', 0);
                    assert.deepPropertyVal(subject, 'min.y', 0);
                    done();
                });
            });

            it.skip('calculates the max', (done) => {
                doLoad((error, el) => {
                    assert.deepPropertyVal(subject, 'max.x', 38.218514144420624);
                    assert.deepPropertyVal(subject, 'max.y', -38.218514144420624);
                    done();
                });
            });

            it('marks the tile a loading', (done) => {
                doLoad((error, el) => {
                    assert.propertyVal(subject, 'loading', true);
                    done();
                });
            });
        });

        describe('when the tile is already cached', () => {
            it('calls back with the div');
            it('does not build the tile');
            it('does not update the html element');
            it('does not update the visiblility');
        });
    });

    describe('.isInZoom(scene, zoom)', () => {});
    describe('.updateVisibility(scene)', () => {});

});
