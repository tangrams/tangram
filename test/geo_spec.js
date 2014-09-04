/*global describe, it, assert */
'use strict';
var Geo = require('../src/geo');

describe('.setTileScale', function () {
    var subject = Geo.setTileScale;
    describe('when given a scale', function () {
        // TODO how do we clean up after each pass?
        it('sets the tile_scale', function () {
            subject(10);
            assert.equal(Geo.tile_scale, 10);
        });

        it('sets the units per pixel', function () {
            subject(10);
            assert.equal(Geo.units_per_pixel, 10 / 256);
        });
    });
});
