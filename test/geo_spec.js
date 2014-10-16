import chai from 'chai';
let assert = chai.assert;

import {Geo} from '../src/geo';

describe('Geo', () => {

    describe('Geo.setTileScale(scale)', () => {});
    describe('Geo.metersForTile(tile)', () => {});
    describe('Geo.metersToLatLng(meters)', () => {});
    describe('Geo.latLngToMeters(latlng)', () => {});
    describe('Geo.transformGeometry(geometry, transformGeometry)', () => {});

    describe('Geo.findBoundingBox(polygon)', () => {
        let min = { x: 2, y: 4 };
        let max = { x: 10, y: 20 };
        let polygon = [[
            [min.x * 0.75 + max.x * 0.25, min.y * 0.75 + max.y * 0.25],
            [min.x * 0.75 + max.x * 0.25, min.y * 0.5 + max.y * 0.5],
            [min.x * 0.25 + max.x * 0.75, min.y * 0.75 + max.y * 0.25],
            [min.x * 0.25 + max.x * 0.75, min.y * 0.25 + max.y * 0.75],
            [min.x * 0.4 + max.x * 0.6, min.y * 0.5 + max.y * 0.5],
            [min.x * 0.5 + max.x * 0.5, min.y * 0.25 + max.y * 0.75],
            [min.x * 0.75 + max.x * 0.25, min.y * 0.25 + max.y * 0.75],
            [min.x * 0.75 + max.x * 0.25, min.y * 0.4 + max.y * 0.6]
        ]];

        let bbox;
        beforeEach(() => {
            bbox = Geo.findBoundingBox(polygon);
        });

        it('calculates the expected bounding box', () => {
            assert.deepEqual(bbox, [4, 8, 8, 16]);
        });
    });

});
