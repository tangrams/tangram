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

let makeOne = ({tile_source = exampleTileSource, layers = exampleLayers, styles = exampleStyles }) => {
    return new Scene(tile_source, layers, styles, {});
};

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
        let scene;

        beforeEach(() => {
            scene = Scene.create({
                tile_source: exampleTileSource,
                layers: exampleLayers,
                styles: exampleStyles
            });
        });

        afterEach( () => {
            scene = undefined;
        });

        it('returns a new instance', () => {
            assert.instanceOf(scene, Scene);
        });

        it('correctly sets the value of the tile source', () => {
            assert.equal(scene.tile_source, exampleTileSource);
        });

        it('correctly sets the value of the layers object', () => {
            assert.equal(scene.layers, exampleLayers);
        });

        it('correctly sets the value of the styles object', () => {
            assert.equal(scene.styles, exampleStyles);
        });

    });

    describe('#init', () => {
        let scene;
        beforeEach(() => {
            scene = makeOne({});
        });

        afterEach(() => {
            scene = undefined;
        });

        describe('when the scene is not initialized', () => {
            it('calls back', (done) => {
                scene.init(() => {
                    assert.ok(true);
                    done();
                });
            });

            it('sets the initialized property', (done) => {
                scene.init(() => {
                    assert.isTrue(scene.initialized);
                    done();
                });
            });

            it('sets the container property', (done) => {
                scene.init(() => {
                    assert.isObject(scene.container);
                    done();
                });
            });

            it('sets the canvas property', (done) => {
                scene.init(() => {
                    assert.isObject(scene.canvas);
                    done();
                });
            });

            it('sets the gl property', (done) => {
                scene.init(() => {
                    assert.isObject(scene.gl);
                    done();
                });
            });

        });


        describe('when the scene is already initialized', () => {
            it('returns false', (done) => {
                scene.init(() => {
                    assert.isFalse(scene.init());
                    done();
                });
            });
        });

    });

    describe('#resizeMap', () => {
        let scene;
        let height = 100;
        let width = 200;

        beforeEach((done) => {
            scene = makeOne({});
            scene.init(() => {
                scene.resizeMap(width, height);
                done();
            })
        })
        afterEach(() => {
            scene = undefined;
        });

        it('marks the scene as dirty', () => {
            assert.isTrue(scene.dirty);
        });

        it('sets the device size property', () => {
            assert.deepEqual(scene.device_size, {
                height: height,
                width: width
            });
        });

        describe('canvas style', () => {
            it('sets the height', () => {
                assert.equal(scene.canvas.style.height, height + 'px');
            });

            it('sets the width', () => {
                assert.equal(scene.canvas.style.width, width + 'px');
            });
        });

        describe('canvas', () => {
            it('sets the height property', () => {
                assert.equal(scene.canvas.height, height);
            });

            it('sets the width property', () => {
                assert.equal(scene.canvas.width, width);
            });
        })


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
