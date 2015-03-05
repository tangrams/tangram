import chai from 'chai';
let assert = chai.assert;
import Scene from '../src/scene';
import Tile from '../src/tile';
import sampleScene from './fixtures/sample-scene';


let nycLatLng = { lng: -73.97229909896852, lat: 40.76456761707639, zoom: 17 };
let midtownTile = { x: 38603, y: 49255, z: 17 };
let midtownTileKey = `${midtownTile.x}/${midtownTile.y}/${midtownTile.z}`;


describe('Scene', function () {

    let subject;

    beforeEach(() => {
        subject = makeScene({});
        sinon.stub(subject, 'findVisibleTiles').returns([]);
        subject.setView(nycLatLng);
    });

    afterEach(() => {
        subject.destroy();
        subject = null;
    });

    describe('.constructor()', () => {

        it('returns a new instance', () => {
            assert.instanceOf(subject, Scene);
        });

        it('correctly sets the value of the layers object', () => {
            assert.equal(subject.layer_source, sampleScene.layers);
        });

        it('correctly sets the value of the config object', () => {
            assert.equal(subject.config_source, sampleScene.config);
        });


    });

    describe('.loadTile(coords)', () => {

        let coords = midtownTile;

        beforeEach(() => {
            sinon.spy(subject, '_loadTile');

            return subject.init().then(() => {
                subject.loadTile(coords);
                subject.loadQueuedTiles();
            });
        });

        it('calls _loadTile with the queued tile', () => {
            sinon.assert.calledWith(subject._loadTile, coords);
        });
    });

    // describe('.loadTile(tile)', () => {
    //     let subject;
    //     let tile = { coords: null };

    //     beforeEach(() => {
    //         subject.loadTile(tile);
    //     });

    //     it('appends the queued_tiles array', () => {
    //         assert.include(subject.queued_tiles[0], tile);
    //     });

    // });

    describe('._loadTile(coords, options)', () => {

        let coords = midtownTile;

        beforeEach(() => {
            return subject.init();
        });

        describe('when the scene has not loaded the tile', () => {

            it('loads the tile', () => {
                let tile = subject._loadTile(coords);
                assert.instanceOf(tile, Tile);
            });

            it('caches the result in the scene object', () => {
                let tile = subject._loadTile(coords);
                let tiles = subject.tiles;
                assert.instanceOf(tiles[tile.key], Tile);
            });
        });

        describe('when the scene already has the tile', () => {
            let key = midtownTileKey;
            let tile;

            beforeEach(() => {
                subject._loadTile(coords);
                sinon.spy(subject, 'cacheTile');
                tile = subject._loadTile(coords);
                sinon.spy(tile, 'load');
            });

            afterEach(() => {
                subject.cacheTile.restore();
                tile.load.restore();
                subject.tiles[key] = undefined;
            });

            it('does not load the tile', () => {
                assert.isFalse(tile.load.called);
            });

            it('does not cache the tile', () => {
                assert.isFalse(subject.cacheTile.called);
            });

        });

    });

    describe('.init()', () => {

        describe('when the scene is not initialized', () => {

            beforeEach(() => {
                return subject.init();
            });

            it('correctly sets the value of the tile source', () => {
                let source = subject.sources['osm'];
                assert.propertyVal(source, 'max_zoom', 20);
                assert.propertyVal(source, 'url_template', 'http://vector.mapzen.com/osm/all/{z}/{x}/{y}.json');
            });

            it('sets the initialized property', () => {
                assert.isTrue(subject.initialized);
            });

            it('sets the container property', () => {
                assert.instanceOf(subject.container, HTMLDivElement);
            });

            it('sets the canvas property', () => {
                assert.instanceOf(subject.canvas, HTMLCanvasElement);
            });

            it('sets the gl property', () => {
                assert.instanceOf(subject.gl, WebGLRenderingContext);
            });

            it('compiles render styles', () => {
                assert.isTrue(subject.styles.rainbow.compiled);
                assert.ok(subject.styles.rainbow.program);
            });
        });

        describe('when the scene is already initialized', () => {

            it('handles second init() call', () => {
                return subject.init().then(() => {
                    return subject.init();
                });
            });

        });
    });

    describe('.resizeMap()', () => {
        let height = 100;
        let width = 200;
        let devicePixelRatio = 2;
        let computedHeight = Math.round(height * devicePixelRatio);
        let computedWidth  = Math.round(width * devicePixelRatio);

        beforeEach(() => {
            subject.device_pixel_ratio = devicePixelRatio;
            return subject.init().then(() => {
                sinon.spy(subject.gl, 'bindFramebuffer');
                sinon.spy(subject.gl, 'viewport');
                subject.resizeMap(width, height);
            });
        });

        it('marks the scene as dirty', () => {
            assert.isTrue(subject.dirty);
        });

        it('sets the device size property', () => {
            assert.deepEqual(subject.device_size, {
                height: computedHeight,
                width: computedWidth
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
                assert.equal(subject.canvas.height, computedHeight);
            });

            it('sets the width property', () => {
                assert.equal(subject.canvas.width, computedWidth);
            });
        });


    });

    describe('.setView(lng, lat)', () => {
        let {lng, lat, zoom} = nycLatLng;

        beforeEach(() => {
            subject.setView(nycLatLng);
        });

        it('sets the scene center and zoom', () => {
            assert.deepEqual(subject.center, {lng, lat});
        });

        it('sets the scene zoom', () => {
            assert.equal(subject.zoom, zoom);
        });

        it('marks the scene as dirty', () => {
            assert.isTrue(subject.dirty);
        });
    });

    describe('.startZoom()', () => {

        beforeEach(() => {
            subject.startZoom();
        });

        it('sets the last zoom property with the value of the current zoom', () => {
            assert.equal(subject.last_zoom, subject.zoom);
        });

        it('marks the scene as zooming', () => {
            assert.isTrue(subject.zooming);
        });

    });

    // TODO this method does a lot of stuff
    describe('.setZoom(zoom)', () => {

        beforeEach(() => {
            sinon.spy(subject, 'removeTilesOutsideZoomRange');
            subject.setZoom(10);
        });

        it('calls the removeTilesOutsideZoomRange method', () =>  {
            assert.isTrue(subject.removeTilesOutsideZoomRange.called);
        });

        it('marks the scene as dirty', () => {
            assert.isTrue(subject.dirty);
        });

    });

    describe('.update()', () => {

        beforeEach(() => {
            sinon.spy(subject, 'loadQueuedTiles');
            sinon.spy(subject, 'render');

            subject.setView(nycLatLng);
            return subject.init();
        });

        it('calls the loadQueuedTiles method', () => {
            subject.update();
            assert.isTrue(subject.loadQueuedTiles.called);
        });

        describe('when the scene is not dirty', () => {
            it('returns false', () => {
                subject.dirty = false;
                assert.isFalse(subject.update());
            });
        });

        describe('when the scene is not initialized', () => {
            it('returns false', () => {
                subject.initialized = false;
                assert.isFalse(subject.update());
            });
        });

        describe('when the scene is dirty', () => {
            beforeEach(() => { subject.dirty = true; });
            it('calls the render method', () => {
                subject.update();
                assert.isTrue(subject.render.called);
            });
        });

        it('increments the frame property', () => {
            let old = subject.frame;
            subject.update();
            assert.operator(subject.frame, '>', old);
        });

        it('returns true', () => {
            assert.isTrue(subject.update());
        });

    });

    describe('.updateStyles()', () => {

        beforeEach(() => {
            return subject.init();
        });

        it('adds a new mode', () => {
            subject.config.styles.elevator = {
                "extends": "polygons",
                "animated": true,
                "shaders": {
                    "transforms": {
                        "vertex": "position.z *= (sin(position.z + u_time) + 1.0); // elevator buildings"
                    }
                }
            };

            subject.updateStyles();
            assert.isTrue(subject.styles.elevator.compiled);
            assert.ok(subject.styles.elevator.program);
        });

        it('adds properties to an existing style', () => {
            subject.config.styles.rainbow.shaders.uniforms = { u_test: 10 };
            subject.config.styles.rainbow.properties = { test: 20 };
            subject.updateStyles();

            assert.ok(subject.styles.rainbow);
            assert.isTrue(subject.styles.rainbow.compiled);
            assert.ok(subject.styles.rainbow.program);
            assert.deepPropertyVal(subject, 'styles.rainbow.shaders.uniforms.u_test', 10);
            assert.deepPropertyVal(subject, 'styles.rainbow.properties.test', 20);
        });
    });

    // describe.skip('.rebuildGeometry()', () => {
    //     let subject;
    //     let div = document.createElement('div');

    //     beforeEach((done) => {
    //         subject = makeScene({});
    //         subject.setView(nycLatLng);
    //         subject.init().then(() => {
    //             subject.loadTile(midtownTile, div);
    //             subject.loadQueuedTiles();

    //             var tile = subject.tiles['38603/49255/17'];
    //             var check = setInterval(() => {
    //                 if (tile.loaded) {
    //                     clearInterval(check);
    //                     done();
    //                 }
    //             }, 50);
    //         });
    //     });

    //     afterEach(() => {
    //         subject.destroy();
    //         subject = undefined;
    //     });

    //     it('calls back', (done) => {
    //         subject.rebuildGeometry().then(done);
    //     });

    //     it('queues the second call & then runs it when the first call is complete', (done) => {
    //         subject.rebuildGeometry();
    //         subject.rebuildGeometry().then(done);
    //     });

    //     it('runs first call, queues second call, then rejects second call when third call is made', (done) => {
    //         let rejectedSecond;
    //         subject.rebuildGeometry();
    //         subject.rebuildGeometry().catch((error) => {
    //             rejectedSecond = (error.message === 'Scene.rebuildGeometry: request superceded by a newer call');
    //         });
    //         subject.rebuildGeometry().then(() => {
    //             assert.isTrue(rejectedSecond);
    //             done();
    //         });
    //     });
    // });

    // describe.skip('.createWorkers()', () => {
    //     let subject;
    //     beforeEach(() => {
    //         subject = makeScene({num_workers: 2});
    //         sinon.spy(subject, 'makeWorkers');
    //     });

    //     afterEach(() => {
    //         subject.destroy();
    //         subject = null;
    //     });

    //     it('calls the makeWorkers method', (done) => {
    //         subject.createWorkers().then(() => {
    //             sinon.assert.called(subject.makeWorkers);
    //             done();
    //         });
    //     });

    // });

    // describe.skip('.makeWorkers(url)', () => {
    //     let subject,
    //         numWorkers = 2,
    //         url = '/tangram-worker.debug.js';

    //     beforeEach(() => {
    //         subject = makeScene({numWorkers});
    //         subject.makeWorkers(url);
    //     });

    //     afterEach(() => {
    //         subject.destroy();
    //         subject = null;
    //     });

    //     describe('when given a url', () => {

    //         it('creates the correct number of workers', () => {
    //             assert.equal(subject.workers.length, 2);
    //         });

    //         it('creates the correct type of workers', () => {
    //             assert.instanceOf(subject.workers[0], Worker);
    //         });
    //     });
    // });

});
