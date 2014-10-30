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

    describe('.sendBuild(scene, key)', () => {
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
        });

        describe('when the tile is already cached', () => {});

    });

    describe('.isInZoom(scene, zoom)', () => {});

    describe('.updateVisibility(scene)', () => {});

});
