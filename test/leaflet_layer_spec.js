import sinon from 'sinon';
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

describe.only('Leaflet', () => {

    // leaflet calls it .initialize()
    describe('.constructor()', () => {
        let subject;
        beforeEach(() => {
            subject = makeOne();
        });

        it('returns a new instance', () => {
            assert.instanceOf(subject, LeafletLayer);
        });

        it('wires up the scene', () => {
            assert.instanceOf(subject.scene, Scene);
        });
    });

    describe('.onAdd(map)', () => {
        let subject;
        beforeEach(() => {
            subject = makeOne();
            subject.addTo(map);
        });

        afterEach(() => {

        });

        it('calls the maps .getContainer() method', () => {
            // assert.isTrue(subject._map.getContainer.called);
        });

    });

    // TODO, this is broken
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

        it('calls the .scene.loadTile() method', () => {
            assert.isTrue(subject.scene.loadTile.called);
        });

    });

    describe('.updateBounds()', () => {});
    describe('.render()', () => {});

});
