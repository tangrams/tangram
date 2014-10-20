import chai from 'chai';
import Scene from '../src/scene';
import {LeafletLayer} from '../src/leaflet_layer';
import sampleScene from './fixtures/sample-scene';
let assert = chai.assert;

let map = L.map(
    document.createElement('div'),
    { maxZoom: 20, inertia: false, keyboard: false}
);
map.setView([0, 0], 0);

let makeOne = () => {
    return new LeafletLayer({
        vectorTileSource: sampleScene.tileSource,
        vectorLayers: sampleScene.layers,
        vectorStyles: sampleScene.styles
    });
};

describe('Leaflet plugin', () => {

    // leaflet calls it .initialize()
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

        beforeEach((done) => {
            subject = makeOne();
            sinon.spy(map, 'getContainer');
            subject.on('init', function() {
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

            map.on('layerremove', () => {
                done();
            });

            subject.addTo(map);
        });

        afterEach(() => {
            L.GridLayer.prototype.onRemove.restore();
        });

        // it('calls the .super', () => {
        //     assert.isTrue(L.GridLayer.prototype.onRemove.called);
        // });

        it('destroys the scene', () => {
            assert.isTrue(scene.destroy.called);
            assert.isNull(subject.scene);
        });
    });

    describe('.createTile(coords, done)', () => {
        let subject;
        let coords = { x: 9647, y: 12320, z: 15 };

        beforeEach(() => {
            subject = makeOne();
            sinon.spy(subject.scene, 'loadTile');
            subject.createTile(coords);
        });

        afterEach(() => {
            subject.remove();
        });

        it('calls the .scene.loadTile() method', () => {
            assert.isTrue(subject.scene.loadTile.called);
        });

    });

    describe('.updateBounds()', () => {});
    describe('.render()', () => {});

});
