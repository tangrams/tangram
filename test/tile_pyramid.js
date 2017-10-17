import chai from 'chai';
let assert = chai.assert;
import TilePyramid from '../src/tile_pyramid';
import Tile from '../src/tile';

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
                coords: Tile.coord(coords),
                style_zoom,
                source,
                loaded: true
            };
        });

        it('creates one entry per zoom', () => {
            pyramid.addTile(tile);
            assert.equal(Object.keys(pyramid.coords).length, coords.z + 1);
        });

        it('creates one entry for non-overzoomed tile', () => {
            pyramid.addTile(tile);

            let entries = pyramid.coords[tile.coords.key].sources[tile.source.name];
            assert.equal(Object.keys(entries).length, 1);
        });

        it('creates one entry for an overzoomed tile', () => {
            tile = Object.assign({}, tile);
            tile.coords = Tile.coordinateAtZoom(coords, 18);
            tile.style_zoom = 20;
            pyramid.addTile(tile);

            let entries = pyramid.coords[tile.coords.key].sources[tile.source.name];
            assert.equal(Object.keys(entries).length, 1);
        });

        it('creates additional entries for overzoomed tiles', () => {
            tile = Object.assign({}, tile);
            tile.coords = Tile.coordinateAtZoom(coords, 18);
            tile.style_zoom = 19;
            pyramid.addTile(tile);

            tile = Object.assign({}, tile);
            tile.style_zoom = 20;
            pyramid.addTile(tile);

            let entries = pyramid.coords[tile.coords.key].sources[tile.source.name];
            assert.equal(Object.keys(entries).length, 2);
        });

        it('removes all entries for single tile', () => {
            pyramid.addTile(tile);
            pyramid.removeTile(tile);
            assert.equal(Object.keys(pyramid.coords).length, 0);
        });

        it('gets tile ancestor', () => {
            pyramid.addTile(tile);
            tile = Object.assign({}, tile);
            tile.coords = Tile.coordinateAtZoom(tile.coords, tile.coords.z + 2);
            tile.style_zoom = tile.coords.z;
            let ancestor = pyramid.getAncestor(tile);
            assert.isNotNull(ancestor);
        });

        it('gets tile descendant', () => {
            pyramid.addTile(tile);
            tile = Object.assign({}, tile);
            tile.coords = Tile.coordinateAtZoom(tile.coords, tile.coords.z - 2);
            tile.style_zoom = tile.coords.z;
            let descendants = pyramid.getDescendants(tile);
            assert.equal(descendants.length, 1);
        });

    });

});
