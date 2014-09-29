import assert from 'assert';
import sinon  from 'sinon';
import Scene  from '../src/scene';

/*
  These are the scene methods that the leaflet layer calls
*/

let makeOne = () => {
    return new Scene({}, {}, {}, {});
};


describe('Scene', () => {

    describe('#constructor', () => {
        it('returns a new instance', () => {
            let scene = new Scene();
            assert.equal(scene.constructor, Scene);
        });

        describe('when given senable defaults', () => {
            let scene = makeOne();

            it('returns a instance', () => {
                assert.equal(scene.constructor, Scene);
            });
        });
    });

    describe('#create', () => {
        it('');
    });

    describe('#init', () => {
        let scene = makeOne();

        describe('when the scene is not initialized', () => {
            it('calls back with undefined', (done) => {
                scene.init(() => {
                    assert.ok(true);
                    done();
                });
            });
        });

        describe('when the scene is already initialized', () => {
            // should we call back with false?
            it('returns undefined', () => {
                assert.equal(typeof scene.init(), 'undefined');
            });
        });

    });

    describe('#resizeMap', () => {
        let scene = makeOne();

        it.skip('reszies the map/scene?', (done) => {
            scene.init(() =>{
                done();
            });

        });
    });

    describe('#setCenter', () => {
        it('sets the center map/scene?');
    });

    describe('#startZoom', () => {
        it('');
    });

    describe('#setZoom', () => {
        it('');
    });

    describe('#loadTile', () => {
        it('');
    });

    describe('#render', () => {
        it('');
    });

    describe('#set scene.container', () => {
        it('');
    });

    describe('#set scene.panning', () => {
        it('');
    });

    describe('#set  scene.layers.builds.mode', () => {
        it('');
    });

});
