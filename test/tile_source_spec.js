import sinon from 'sinon';
import chai from 'chai';
let assert = chai.assert;
import TileSource from '../src/tile_source';

describe('TileSource', () => {
    describe('.constructor()', () => {
        let subject;
        beforeEach(() => {
            subject = new TileSource();
        });

        it('returns a new instance', () => {
            assert.instanceOf(subject, TileSource);
        });
    });

    describe('TileSource.create(type, url_template, options)', () => {});
    describe('TileSource.projectTile(tile)', () => {});
    describe('TileSource.scaleTile(tile)', () => {});

    describe('NetworkTileSource', () => {
        describe('.constructor', () => {});
        describe('.loadTile(tile, cb)', () => {});
    });

    describe('GeoJSONTileSource', () => {
        describe('.constructor()', () => {});
    });

    describe('TopoJSONTileSource', () => {
        describe('.constructor()', () => {});
    });

    describe('MapboxTileSource', () => {
        describe('.constructor()', () => {});
    });

});
