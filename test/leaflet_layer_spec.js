import chai from 'chai';
import Scene from '../src/scene';
import {LeafletLayer} from '../src/leaflet_layer';
import sampleScene from './fixtures/sample-scene';
let assert = chai.assert;

let map = L.map(
    document.createElement('div'),
    { maxZoom: 20, inertia: false, keyboard: false}
);
map.setView([0, 0], 0); // required to put leaflet in a "ready" state, or it will never call the layer's onAdd() method

let makeOne = () => {
    let layer = new LeafletLayer({
        source: sampleScene.tile_source,
        scene: sampleScene.config,
        disableRenderLoop: true,
        workerUrl: 'http://localhost:9876/tangram.debug.js'
    });

    sinon.stub(layer.scene, 'findVisibleTiles').returns([]);
    return layer;
};

describe('Leaflet plugin', () => {

    describe('.constructor()', () => {
        let subject;

        beforeEach(() => {
            subject = makeOne();
        });

        afterEach(() => {
            subject.scene.destroy();
        });

        it('returns a new instance', () => {
            assert.instanceOf(subject, LeafletLayer);
        });

        it('wires up the scene', () => {
            assert.instanceOf(subject.scene, Scene);
        });
    });

    describe('.addTo(map)', () => {
        let subject;

        beforeEach(function (done) {
            subject = makeOne();
            sinon.spy(map, 'getContainer');
            sinon.spy(subject.scene, 'init');

            subject.on('init', () => {
                done();
            });

            subject.addTo(map);
        });


        afterEach(() => {
            subject.remove();
            map.getContainer.restore();
        });

        it('calls the map\'s .getContainer() method', () => {
            sinon.assert.called(map.getContainer);
        });

        it('initializes the scene', () => {
            sinon.assert.called(subject.scene.init);
        });

    });

    describe('.remove()', () => {
        let subject, scene;

        beforeEach((done) => {
            subject = makeOne();
            scene = subject.scene;
            sinon.spy(L.GridLayer.prototype, 'onRemove');
            sinon.spy(scene, 'destroy');


            subject.on('init', () => {
                subject.remove();
            });
            subject.on('remove', () => {
                done();
            });

            subject.addTo(map);
        });

        afterEach(() => {
            L.GridLayer.prototype.onRemove.restore();
        });

        it('calls the .super', () => {
            sinon.assert.called(L.GridLayer.prototype.onRemove);
        });

        it('destroys the scene', () => {
            sinon.assert.called(scene.destroy);
            assert.isNull(subject.scene);
        });
    });

    describe('removing and then re-adding to a map', () => {
        let subject, scene;

        beforeEach((done) => {
            var counter = 0;
            subject = makeOne();
            scene  = subject.scene;
            sinon.spy(subject.scene, 'destroy');
            subject.on('init', () => {
                counter += 1;
                if (counter === 2) {
                    done();
                }
            });
            subject.addTo(map);
            subject.remove();
            subject.addTo(map);
        });

        it('destroys the initial scene', () => {
            sinon.assert.called(scene.destroy);
        });

        it('re-initializes a new scene', () => {
            assert.isTrue(subject.scene.initialized);
        });
    });

});
