import chai from 'chai';
import Scene from '../src/scene';
import {LeafletLayer} from '../src/leaflet_layer';
import sampleScene from './fixtures/sample-scene';
let assert = chai.assert;

let map = L.map(
    document.createElement('div'),
    { maxZoom: 20, inertia: false, keyboard: false}
);

let makeOne = () => {
    return new LeafletLayer({
        vectorTileSource: sampleScene.tileSource,
        vectorLayers: sampleScene.layers,
        vectorStyles: sampleScene.styles
    });
};

describe('Leaflet', () => {

    // leaflet calls it .initialize()
    describe('.constructor()', () => {
        let subject;
        beforeEach(() => {
            subject = makeOne();
        });
        afterEach(() => { subject.scene.destroy(); });
        it('returns a new instance', () => {
            assert.instanceOf(subject, LeafletLayer);
        });

        it('wires up the scene', () => {
            assert.instanceOf(subject.scene, Scene);
        });
    });

    describe.skip('.onAdd(map)', () => {
        let subject;
        beforeEach(() => {
            subject = makeOne();
            subject.addTo(map);
        });

        afterEach(() => {
            subject.scene.destroy();
        });

        it('calls the maps .getContainer() method', () => {
            sinon.assert.called(subject.map.getContainer);
        });

    });

    describe.skip('.onRemove(map)', () => {
        let subject;
        beforeEach(() => {
            subject = makeOne();
            subject.addTo(map);
            sinon.spy(L.GridLayer.prototype, 'onRemove');
            subject.onRemove();
        });
        afterEach(() => {
            subject.removeFrom(map);
            subject.scene.destroy();
            L.GridLayer.prototype.onRemove.restore();
        });

        it('calls the .super', () => {
            assert.isTrue(L.GridLayer.prototype.onRemove.called);
        });
    });

    describe('.createTile(coords, done)', () => {
        let subject;
        let coords = {x: 1, y: 1};

        beforeEach(() => {
            subject = makeOne();
            sinon.spy(subject.scene, 'loadTile');
            subject.createTile(coords);
        });

        afterEach(() => {
            subject.scene.destroy();
        });

        it('calls the .scene.loadTile() method', () => {
            assert.isTrue(subject.scene.loadTile.called);
        });

    });

    describe('.updateBounds()', () => {});
    describe('.render()', () => {});

});
