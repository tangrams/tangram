import chai from 'chai';
let assert = chai.assert;
import TilePyramid from '../src/tile_pyramid';
import {TileID} from '../src/tile_id';

describe('TilePyramid', function() {

    let coords = { x: 38603, y: 49255, z: 17 };
    let source, style_zoom;
    let tile;
    let pyramid;

    describe('overzooming', () => {

        beforeEach(() => {
            pyramid = new TilePyramid();

            style_zoom = coords.z;
            source = {
                name: 'test',
                max_coord_zoom: 18
            };

            tile = {
                coords: TileID.coord(coords),
                style_zoom,
                source,
                loaded: true
            };
            tile.key = TileID.key(tile.coords, source, style_zoom);
        });

        it('creates one entry per zoom', () => {
            pyramid.addTile(tile);

            assert.equal(Object.keys(pyramid.tiles).length, coords.z + 1);
        });

        it('creates one entry for non-overzoomed tile', () => {
            pyramid.addTile(tile);

            assert.isNotNull(pyramid.tiles[tile.key]);
        });

        it('creates entries for overzoomed tiles', () => {
            tile = Object.assign({}, tile);
            tile.coords = TileID.coordAtZoom(coords, 18);
            tile.style_zoom = 20;
            pyramid.addTile(tile);

            assert.isNotNull(pyramid.tiles[TileID.key(tile.coords, source, tile.style_zoom)]);
        });

        it('removes all entries for single tile', () => {
            pyramid.addTile(tile);
            pyramid.removeTile(tile);

            assert.equal(Object.keys(pyramid.tiles).length, 0);
        });

        it('gets tile ancestor', () => {
            pyramid.addTile(tile);
            let ancestor = pyramid.getAncestor(tile);

            assert.isNotNull(ancestor);
        });

        it('gets tile descendant', () => {
            pyramid.addTile(tile);
            let ancestor = TileID.parent(TileID.parent(tile));
            let descendants = pyramid.getDescendants(ancestor);

            assert.equal(descendants.length, 1);
        });

    });

});
