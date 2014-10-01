import sinon  from 'sinon';
import Scene  from '../src/scene';
import chai from 'chai';

let assert = chai.assert;

// take from the demo
let exampleTileSource = {
    type: 'GeoJSONTileSource',
    url: 'http://vector.mapzen.com/osm/all/{z}/{x}/{y}.json'
};

let exampleStyles = {
    layers: {
        water: {
            color: {
                'default': [0.5, 0.5, 0.875]
            },
            outline: {
                color: {
                    'default': [0.6, 0.6, 0.975]
                }
            }
        }
    }
};

let exampleLayers = [
    {
        name: 'water',
        data: 'water'
    }
];
let makeOne;
/* jshint ignore:start */
makeOne = ({tile_source = exampleTileSource,
                layers  = exampleLayers,
                styles  = exampleStyles }) => {
    return new Scene(tile_source, layers, styles, {});
};
/* jshint ignore:end */

describe('Scene', () => {

    describe('#constructor', () => {
        it('returns a new instance', () => {
            let scene = new Scene();
            assert.instanceOf(scene, Scene);
        });

        describe('when given senable defaults', () => {
            let scene = makeOne({});
            it('returns a instance', () => {
                assert.instanceOf(scene, Scene);
            });
        });
    });

    describe('.create', () => {
        let subject;

        beforeEach(() => {
            subject = Scene.create({
                tile_source: exampleTileSource,
                layers: exampleLayers,
                styles: exampleStyles
            });
        });

        afterEach( () => {
            subject = undefined;
        });

        it('returns a new instance', () => {
            assert.instanceOf(subject, Scene);
        });

        it('correctly sets the value of the tile source', () => {
            assert.equal(subject.tile_source, exampleTileSource);
        });

        it('correctly sets the value of the layers object', () => {
            assert.equal(subject.layers, exampleLayers);
        });

        it('correctly sets the value of the styles object', () => {
            assert.equal(subject.styles, exampleStyles);
        });

    });

    describe('#init', () => {
        let subject;
        beforeEach(() => {
            subject = makeOne({});
        });

        afterEach(() => {
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

            it('sets the container property', (done) => {
                subject.init(() => {
                    assert.instanceOf(subject.container, HTMLBodyElement);
                    done();
                });
            });

            it('sets the canvas property', (done) => {
                subject.init(() => {
                    assert.instanceOf(subject.canvas, HTMLCanvasElement);
                    done();
                });
            });

            it('sets the gl property', (done) => {
                subject.init(() => {
                    assert.instanceOf(subject.gl, WebGLRenderingContext);
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

    describe('#resizeMap', () => {
        let subject;
        let height = 100;
        let width = 200;

        beforeEach((done) => {
            subject = makeOne({});
            subject.init(() => {
                sinon.spy(subject.gl, 'bindFramebuffer');
                sinon.spy(subject.gl, 'viewport');
                subject.resizeMap(width, height);
                done();
            });
        });

        afterEach(() => {
            subject = undefined;
        });

        it('marks the scene as dirty', () => {
            assert.isTrue(subject.dirty);
        });

        it('sets the device size property', () => {
            assert.deepEqual(subject.device_size, {
                height: height,
                width: width
            });
        });

        it('calls the gl.bindFrameBuffer method', () => {
            assert.ok(subject.gl.bindFramebuffer.called);
        });

        it('calls the gl.viewport method', () => {
            assert.ok(subject.gl.viewport);
        });

        describe('-canvas.style', () => {
            it('sets the height', () => {
                assert.equal(subject.canvas.style.height, height + 'px');
            });

            it('sets the width', () => {
                assert.equal(subject.canvas.style.width, width + 'px');
            });
        });

        describe('-canvas', () => {
            it('sets the height property', () => {
                assert.equal(subject.canvas.height, height);
            });

            it('sets the width property', () => {
                assert.equal(subject.canvas.width, width);
            });
        });


    });

    describe('#setCenter', () => {
        let subject;
        let [lng, lat] = [10, 10];

        beforeEach(() => {
            subject = makeOne({});
            subject.setCenter(lng, lat);
        });
        afterEach(() => {
            subject = undefined;
        });

        it('sets the center scene?', () => {
            assert.deepEqual(subject.center, {lng, lat});
        });

        it('marks the scene as dirty', () => {
            assert.isTrue(subject.dirty);
        });
    });

    describe('#startZoom', () => {
        let subject;

        beforeEach(() => {
            subject = makeOne({});
            subject.startZoom();
        });

        afterEach(() => {
            subject = undefined;
        });

        it('sets the last zoom property with the value of the current zoom', () => {
            assert.equal(subject.last_zoom, subject.zoom);
        });

        it('marks the scene as zooming', () => {
            assert.isTrue(subject.zooming);
        });
    });

    // TODO this method does a lot of stuff
    describe('#setZoom', () => {
        let subject;
        beforeEach(() => {
            subject = makeOne({});
            sinon.spy(subject, 'removeTilesOutsideZoomRange');
            subject.setZoom(10);
        });

        afterEach(() => {
            subject = undefined;
        });
        it('calls the removeTilesOutsideZoomRange method', () =>  {
            assert.isTrue(subject.removeTilesOutsideZoomRange.called);
        });

        it('marks the scene as drity', () => {
            assert.isTrue(subject.dirty);
        });
    });

    describe('#loadTile', () => {
        let subject;
        let tile = { coords: null, div: null, callback: () => {}};

        beforeEach(() => {
            subject = makeOne({}); subject.loadTile(tile);
        });
        afterEach(() => { subject = undefined; });

        it('appends the queued_tiles array', () => {
            assert.include(subject.queued_tiles[0], tile);
        });

    });

    describe('#render', () => {
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

        afterEach(() => { subject = undefined; });

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

    describe('#createWorkers', () => {
        it('');
    });

    describe('#makeWorkers', () => {
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
