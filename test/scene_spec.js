import chai from 'chai';
let assert = chai.assert;
import Utils from '../src/utils';
import Scene from '../src/scene';
import Tile from '../src/tile';
import TileSource from '../src/tile_source';
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
let midtownTile = { x: 38603, y: 49255, z: 17 };
let midtownTileKey = `${midtownTile.x}/${midtownTile.y}/${midtownTile.z}`;

describe('Scene', () => {

    describe('.constructor()', () => {
        it('returns a new instance', () => {
            let scene = new Scene();
            assert.instanceOf(scene, Scene);
            scene.destroy();
        });

        describe('when given sensible defaults', () => {
            let scene = makeScene({});
            it('returns a instance', () => {
                assert.instanceOf(scene, Scene);
                scene.destroy();
            });
        });
    });

    describe('.loadQueuedTiles()', () => {
        let subject;

        beforeEach((done) => {
            let coords = midtownTile;

            subject = makeScene({});

            sinon.spy(subject, '_loadTile');

            subject.setCenter(...nycLatLng);
            subject.init().then(() => {
                subject.loadTile(coords);
                subject.loadQueuedTiles();
                done();
            });
        });

        afterEach(() => {
            subject.destroy();
            subject = null;
        });

        it('calls _loadTile with the queued tile', () => {
            sinon.assert.calledOnce(subject._loadTile);
        });
    });

    describe('._loadTile(coords, options)', () => {
        let subject,
            coord = midtownTile,
            div = document.createElement('div');

        beforeEach((done) => {
            subject = makeScene({});
            subject.setCenter(...nycLatLng);
            subject.init().then(done);
        });

        afterEach(() => {
            subject.destroy();
            subject = null;
        });

        describe('when the scene has not loaded the tile', () => {

            it('loads the tile', () => {
                let tile = subject._loadTile(coord, { debugElement: div });
                assert.instanceOf(tile, Tile);
            });

            it('caches the result in the scene object', () => {
                let tile = subject._loadTile(coord, { debugElement: div });
                let tiles = subject.tiles;
                assert.instanceOf(tiles[tile.key], Tile);
            });
        });

        describe('when the scene already have the tile', () => {
            let key = midtownTileKey;
            let tile;

            beforeEach(() => {
                subject.tiles[key] = {};
                sinon.spy(subject, 'cacheTile');
                tile = subject._loadTile(coord, { debugElement: div });
            });

            afterEach(() => {
                subject.cacheTile.restore();
                subject.tiles[key] = undefined;
            });

            it('updates the div', () => {
                assert.equal(div.getAttribute('data-tile-key'), key);
            });
        });

    });

    describe('.create(options)', () => {
        let subject;

        beforeEach(() => {
            subject = makeScene({});

        });

        afterEach( () => {
            subject.destroy();
            subject = null;
        });

        it('returns a new instance', () => {
            assert.instanceOf(subject, Scene);
        });

        it('correctly sets the value of the tile source', () => {
            assert.instanceOf(subject.tile_source, TileSource);
        });

        it('correctly sets the value of the layers object', () => {
            assert.equal(subject.layer_source, sampleScene.layers);
        });

        it('correctly sets the value of the styles object', () => {
            assert.equal(subject.style_source, sampleScene.styles);
        });


    });

    describe('.init()', () => {

        describe('when the scene is not initialized', () => {
            let subject;
            beforeEach((done) => {
                subject = makeScene({});
                subject.init().then(done);

            });

            afterEach(() => {
                subject.destroy();
                subject = null;
            });

            it('correctly sets the value of the tile source', () => {
                assert.deepPropertyVal(subject, 'tile_source.max_zoom', 20);
                assert.deepPropertyVal(
                    subject,
                    'tile_source.url_template',
                    'http://vector.mapzen.com/osm/all/{z}/{x}/{y}.json'
                );
            });

            it('sets the initialized property', () => {
                assert.isTrue(subject.initialized);
            });

            it('sets the container property', () => {
                assert.instanceOf(subject.container, HTMLBodyElement);
            });

            it('sets the canvas property', () => {
                assert.instanceOf(subject.canvas, HTMLCanvasElement);
            });

            it('sets the gl property', () => {
                assert.instanceOf(subject.gl, WebGLRenderingContext);
            });

            it('compiles render modes', () => {
                assert.isTrue(subject.modes.rainbow.compiled);
                assert.ok(subject.modes.rainbow.program);
            });
        });

        describe('when the scene is already initialized', () => {
            let subject;
            beforeEach(() => {
                subject = makeScene({});
            });

            afterEach(() => {
                subject.destroy();
                subject = null;
            });

            it('handles second init() call', (done) => {
                subject.init().then(() => {
                    subject.init().then(done);
                });
            });

        });
    });

    describe('.resizeMap()', () => {
        let subject;
        let height = 100;
        let width = 200;
        let devicePixelRatio = 2;
        let computedHeight = Math.round(height * devicePixelRatio);
        let computedWidth  = Math.round(width * devicePixelRatio);

        beforeEach((done) => {
            subject = makeScene({});
            subject.device_pixel_ratio = devicePixelRatio;
            subject.init().then(() => {
                sinon.spy(subject.gl, 'bindFramebuffer');
                sinon.spy(subject.gl, 'viewport');
                subject.resizeMap(width, height);
                done();
            });
        });

        afterEach(() => {
            subject.destroy();
            subject = null;
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

    describe('.setCenter(lng, lat)', () => {
        let subject;
        let [lng, lat] = nycLatLng;

        beforeEach(() => {
            subject = makeScene({});
            subject.setCenter(...nycLatLng);
        });

        afterEach(() => {
            subject.destroy();
            subject = null;
        });

        it('sets the center scene?', () => {
            assert.deepEqual(subject.center, {lng, lat});
        });

        it('marks the scene as dirty', () => {
            assert.isTrue(subject.dirty);
        });
    });

    describe('.startZoom()', () => {
        let subject;

        beforeEach(() => {
            subject = makeScene({});
            subject.startZoom();
        });

        afterEach(() => {
            subject.destroy();
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
    describe('.setZoom(zoom)', () => {
        let subject;
        beforeEach(() => {
            subject = makeScene({});
            sinon.spy(subject, 'removeTilesOutsideZoomRange');
            subject.setZoom(10);
        });

        afterEach(() => {
            subject.destroy();
            subject = null;
        });
        it('calls the removeTilesOutsideZoomRange method', () =>  {
            assert.isTrue(subject.removeTilesOutsideZoomRange.called);
        });

        it('marks the scene as dirty', () => {
            assert.isTrue(subject.dirty);
        });
    });

    describe('.loadTile(tile)', () => {
        let subject;
        let tile = { coords: null };

        beforeEach(() => {
            subject = makeScene({});
            subject.loadTile(tile);
        });
        afterEach(() => {
            subject.destroy();
            subject = null;
        });

        it('appends the queued_tiles array', () => {
            assert.include(subject.queued_tiles[0], tile);
        });

    });

    describe('.render()', () => {
        let subject;

        beforeEach((done) => {
            subject = makeScene({});
            sinon.spy(subject, 'loadQueuedTiles');
            sinon.spy(subject, 'renderGL');

            subject.setCenter(...nycLatLng);
            subject.init().then(done);
        });

        afterEach(() => {
            subject.destroy();
            subject = null;
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

    describe('.updateModes()', () => {
        let subject;

        beforeEach((done) => {
            subject = makeScene();
            subject.init().then(done);
        });

        afterEach(() => {
            subject.destroy();
            subject = undefined;
        });

        it('adds a new mode', () => {
            subject.styles.modes.elevator = {
                "extends": "polygons",
                "animated": true,
                "shaders": {
                    "transforms": {
                        "vertex": "position.z *= (sin(position.z + u_time) + 1.0); // elevator buildings"
                    }
                }
            };

            subject.updateModes();
            assert.isTrue(subject.modes.elevator.compiled);
            assert.ok(subject.modes.elevator.program);
        });

        it('adds properties to an existing mode', () => {
            subject.styles.modes.rainbow.shaders.uniforms = { u_test: 10 };
            subject.styles.modes.rainbow.properties = { test: 20 };
            subject.updateModes();

            assert.ok(subject.modes.rainbow);
            assert.isTrue(subject.modes.rainbow.compiled);
            assert.ok(subject.modes.rainbow.program);
            assert.deepPropertyVal(subject, 'modes.rainbow.shaders.uniforms.u_test', 10);
            assert.deepPropertyVal(subject, 'modes.rainbow.properties.test', 20);
        });
    });

    describe('.rebuildGeometry()', () => {
        let subject;
        let div = document.createElement('div');

        beforeEach((done) => {
            subject = makeScene({});
            subject.setCenter(...nycLatLng);
            subject.init().then(() => {
                subject.loadTile(midtownTile, div);
                subject.loadQueuedTiles();

                var tile = subject.tiles['38603/49255/17'];
                var check = setInterval(() => {
                    if (tile.loaded) {
                        clearInterval(check);
                        done();
                    }
                }, 50);
            });
        });

        afterEach(() => {
            subject.destroy();
            subject = undefined;
        });

        it('calls back', (done) => {
            subject.rebuildGeometry().then(done);
        });

        it('queues the second call & then runs it when the first call is complete', (done) => {
            subject.rebuildGeometry();
            subject.rebuildGeometry().then(done);
        });

        it('runs first call, queues second call, then rejects second call when third call is made', (done) => {
            let rejectedSecond;
            subject.rebuildGeometry();
            subject.rebuildGeometry().catch((error) => {
                rejectedSecond = (error.message === 'Scene.rebuildGeometry: request superceded by a newer call');
            });
            subject.rebuildGeometry().then(() => {
                assert.isTrue(rejectedSecond);
                done();
            });
        });
    });

    describe('.createWorkers()', () => {
        let subject;
        beforeEach(() => {
            subject = makeScene({num_workers: 2});
            sinon.spy(subject, 'makeWorkers');
            sinon.spy(subject, 'createObjectURL');
            sinon.spy(Utils, 'io');
        });

        afterEach(() => {
            subject.destroy();
            subject = null;
            Utils.io.restore();
        });

        it('calls the makeWorkers method', (done) => {
            subject.createWorkers().then(() => {
                sinon.assert.called(subject.makeWorkers);
                done();
            });
        });

        it('calls the xhr method', (done) => {
            subject.createWorkers().then(() => {
                sinon.assert.called(Utils.io);
                done();
            });
        });

        it('calls the createObjectUrl', (done) => {
            subject.createWorkers().then(() => {
                sinon.assert.called(subject.createObjectURL);
                done();
            });
        });
    });

    describe('.makeWorkers(url)', () => {
        let subject,
            numWorkers = 2,
            url = '/tangram-worker.debug.js';

        beforeEach(() => {
            subject = makeScene({options: {numWorkers}});
            subject.makeWorkers(url);
        });

        afterEach(() => {
            subject.destroy();
            subject = null;
        });

        describe('when given a url', () => {

            it('creates the correct number of workers', () => {
                assert.equal(subject.workers.length, 2);
            });

            it('creates the correct type of workers', () => {
                assert.instanceOf(subject.workers[0], Worker);
            });
        });
    });


});
