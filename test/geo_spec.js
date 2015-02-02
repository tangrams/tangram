import chai from 'chai';
let assert = chai.assert;

import Geo from '../src/geo';
import simplePolygon from './fixtures/simple-polygon.json';

describe('Geo', () => {

    describe('Geo.setTileScale(scale)', () => {});
    describe('Geo.metersForTile(tile)', () => {});
    describe('Geo.metersToLatLng(meters)', () => {});
    describe('Geo.latLngToMeters(latlng)', () => {});
    describe('Geo.transformGeometry(geometry, transformGeometry)', () => {});

    describe('Geo.findBoundingBox(polygon)', () => {
        let bbox;
        beforeEach(() => {
            bbox = Geo.findBoundingBox(simplePolygon.geometry.coordinates);
        });

        it('calculates the expected bounding box', () => {
            assert.deepEqual(bbox, simplePolygon.properties.bounds);
        });
    });

});
