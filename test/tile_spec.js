import chai from 'chai';
let assert = chai.assert;
import Tile from '../src/tile';

import {makeScene} from './utils';
import samples from './fixtures/samples';


let nyc_bounds = samples.nyc_bounds;

describe('Tile', () => {
    let subject,
        scene,
        div    = document.createElement('div');

    beforeEach((done) => {
        scene = makeScene({});
        scene.init(() => {
            scene.setBounds(nyc_bounds.south_west, nyc_bounds.north_east);
            subject = Tile.create({tile_source: scene.tile_source});
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

    describe('Tile.create(spec)', () => {
        it('returns a new instance', () => {
            assert.instanceOf(Tile.create({}), Tile);
        });
    });

    describe('Tile.sendBuild(scene, key)', () => {
        beforeEach(() => {
            sinon.stub(scene, 'workerPostMessageForTile');
        });

        afterEach(() => {
            scene.workerPostMessageForTile.restore();
        });

        it('calls scene.workerPostMessageForTile()', () => {
            subject.sendBuild(scene);
            sinon.assert.called(scene.workerPostMessageForTile);
        });
    });

    describe('.load(scene, coords, div, cb)', () => {

        function doLoad(cb) {
            subject.load(scene, _.clone(samples.nyc_coords), div, cb);
        }

        beforeEach(() => {
            sinon.stub(subject, 'sendBuild');
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

            it('calculates the min', (done) => {
                doLoad((error, el) => {
                    assert.deepPropertyVal(subject, 'min.x', -8296780.798186172);
                    assert.deepPropertyVal(subject, 'min.y', 5009377.085697312);
                    done();
                });
            });

            it('calculates the max', (done) => {
                doLoad((error, el) => {
                    assert.deepPropertyVal(subject, 'max.x', -8218509.281222152);
                    assert.deepPropertyVal(subject, 'max.y', 4931105.56873329);
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
