import chai from 'chai';
let assert = chai.assert;
import {TileID} from '../src/tile_id';

describe('Tile', function() {

    let coords = { x: 38603, y: 49255, z: 17 };

    describe('overzooming', () => {

        it('does NOT overzoom a coordinate at the max zoom', () => {
            let coords2 = TileID.coordWithMaxZoom(coords, coords.z);

            assert.deepEqual(coords2.x, coords.x);
            assert.deepEqual(coords2.y, coords.y);
            assert.deepEqual(coords2.z, coords.z);
        });

        it('does NOT overzoom a coordinate below the max zoom', () => {
            let coords2 = TileID.coordWithMaxZoom(coords, coords.z + 1);

            assert.deepEqual(coords2.x, coords.x);
            assert.deepEqual(coords2.y, coords.y);
            assert.deepEqual(coords2.z, coords.z);
        });

        it('does overzoom a coordinate above the max zoom', () => {
            let unzoomed = { x: Math.floor(coords.x*2), y: Math.floor(coords.y*2), z: coords.z + 1 };
            let overzoomed = { x: Math.floor(coords.x/4), y: Math.floor(coords.y/4), z: coords.z - 2 };

            let coords2 = TileID.coordWithMaxZoom(unzoomed, coords.z - 2);

            assert.deepEqual(coords2.x, overzoomed.x);
            assert.deepEqual(coords2.y, overzoomed.y);
            assert.deepEqual(coords2.z, overzoomed.z);
        });

    });

});
