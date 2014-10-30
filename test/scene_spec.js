import chai from 'chai';
let assert = chai.assert;
import Utils from '../src/utils';
import Scene from '../src/scene';
import sampleScene from './fixtures/sample-scene';

let makeOne;
makeOne = ({options}) => {
    options = options || {};
    // options.disableRenderLoop = (options.disableRenderLoop === undefined) ? true : options.disableRenderLoop;
    options.disableRenderLoop = true;
    return new Scene(sampleScene.tileSource, sampleScene.layers, sampleScene.styles, options);
};

describe('Scene', () => {

    describe('.constructor()', () => {
        it('returns a new instance', () => {
            let scene = new Scene();
            assert.instanceOf(scene, Scene);
            scene.destroy();
        });
    });

    describe('.create(options)', () => {
        let subject;

        beforeEach(() => {
            subject = Scene.create({
                tile_source: sampleScene.tileSource,
                layers: sampleScene.layers,
                styles: sampleScene.styles
            });
        });

        afterEach( () => {
            subject.destroy();
            subject = undefined;
        });

        it('returns a new instance', () => {
            assert.instanceOf(subject, Scene);
        });
    });

    describe('.init(callback)', () => {
        let subject;
        beforeEach(() => {
            subject = makeOne({});
        });

        afterEach(() => {
            subject.destroy();
            subject = undefined;
        });

        describe('when the scene is not initialized', () => {
            it('calls back', (done) => {
                subject.init(() => {
                    assert.ok(true);
                    done();
                });
            });

            it('sets the initialized property', (done) => {
                subject.init(() => {
                    assert.isTrue(subject.initialized);
                    done();
                });
            });
        });

        describe('when the scene is already initialized', () => {
            it('returns false', (done) => {
                subject.init(() => {
                    assert.isFalse(subject.init());
                    done();
                });
            });
        });
    });

    describe('.loadTile(tile)', () => {
        let subject;
        let tile = { coords: null, div: null, callback: () => {}};

        beforeEach(() => {
            subject = makeOne({}); subject.loadTile(tile);
        });
        afterEach(() => {
            subject.destroy();
            subject = undefined;
        });

        it('appends the queued_tiles array', () => {
            assert.include(subject.queued_tiles[0], tile);
        });

    });

    describe('.render()', () => {
        let subject;
        beforeEach((done) => {
            subject = makeOne({});
            sinon.spy(subject, 'loadQueuedTiles');
            sinon.spy(subject, 'renderGL');
            subject.init(() => {
                subject.setCenter({lng: 10, lat: 10});
                done();
            });
        });

        afterEach(() => {
            subject.destroy();
            subject = undefined;
        });

        it('calls the loadQueuedTiles method', () => {
            subject.render();
            assert.isTrue(subject.loadQueuedTiles.called);
        });

        describe('when the scene is not dirty', () => {
            it('returns false', () => {
                subject.dirty = false;
                assert.isFalse(subject.render());
            });
        });

        describe('when the scene is not initialized', () => {
            it('returns false', () => {
                subject.initialized = false;
                assert.isFalse(subject.render());
            });
        });

        describe('when the scene is dirty', () => {
            beforeEach(() => { subject.dirty = true; });
            it('calls the renderGL method', () => {
                subject.render();
                assert.isTrue(subject.renderGL.called);
            });
        });

        it('increments the frame property', () => {
            let old = subject.frame;
            subject.render();
            assert.operator(subject.frame, '>', old);
        });

        it('returns true', () => {
            assert.isTrue(subject.render());
        });

    });

    describe('.createWorkers(cb)', () => {
        let subject;
        beforeEach(() => {
            sinon.stub(Utils, 'xhr').callsArgWith(1, null, {}, '(function () { return this; })');
            subject = makeOne({});
            sinon.spy(subject, 'makeWorkers');
            sinon.spy(subject, 'createObjectURL');
        });

        afterEach(() => {
            subject.destroy();
            subject = undefined;
            Utils.xhr.restore();
        });

        it('calls the makeWorkers method', (done) => {
            subject.createWorkers(() => {
                sinon.assert.called(subject.makeWorkers);
                done();
            });
        });

        it('calls the xhr method', (done) => {
            subject.createWorkers(() => {
                sinon.assert.called(Utils.xhr);
                done();
            });
        });

        it('calls the createObjectUrl', (done) => {
            subject.createWorkers(() => {
                sinon.assert.called(subject.createObjectURL);
                done();
            });
        });
    });
});
