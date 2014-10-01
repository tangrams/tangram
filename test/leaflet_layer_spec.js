import sinon from 'sinon';
import chai from 'chai';
import {LeafletLayer} from '../src/leaflet_layer';
import sampleScene from './fixtures/sample-scene';
let assert = chai.assert;

describe.only('Leaflet', () => {

    // leaflet calls it .initialize()
    describe('.constructor()', () => {
        let subject;
        beforeEach(() => {
            subject = new LeafletLayer();
        });

        it('returns a new instance', () => {
            assert.instanceOf(subject, LeafletLayer);
        });
    });

    describe('.onAdd(map)', () => {});
    describe('.onRemove(map)', () => {});
    describe('.createTile(coords, done)', () => {});
    describe('.updateBounds()', () => {});
    describe('.render()', () => {});

});
