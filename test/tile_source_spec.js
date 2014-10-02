import sinon from 'sinon';
import chai from 'chai';
let assert = chai.assert;
import TileSource from '../src/tile_source';

describe.only('TileSource', () => {
    let url_template = 'http://localhost/';
    let max_zoom = Math.PI;
    let options = {max_zoom};

    describe('.constructor()', () => {
        let subject;
        beforeEach(() => {
            subject = new TileSource(
                url_template,
                options
            );
        });

        it('returns a new instance', () => {
            assert.instanceOf(subject, TileSource);
        });
        it('sets the max_zoom level', () => {
            assert.equal(subject.max_zoom, max_zoom);
        });
    });

    describe('TileSource.create(type, url_template, options)', () => {
        let makeOne = (url_template, options, type) => {
            return TileSource.create(type, url_template, options);
        };

        let makeOneOf = makeOne.bind(null, url_template, options);

        describe('NetworkTileSource', () => {
            let subject; // = makeOneOf('NetworkTileSource');
            it('returns a new NetworkTileSource', () => {
                assert.isTrue(false, 'FIXME');
                // assert.instanceOf(subject, TileSource.NetworkTileSource);
            });
        });

        describe('GeoJSONTileSource', () => {
            let subject = makeOneOf('GeoJSONTileSource');
            it('returns a new GeoJSONTileSource', () => {
                assert.instanceOf(subject, TileSource.GeoJSONTileSource);
            });
        });

        describe('TopoJSONTileSource', () => {
            let subject = makeOneOf('TopoJSONTileSource');
            it('returns a new TopoJSONTileSource', () => {
                assert.instanceOf(subject, TileSource.TopoJSONTileSource);
            });
        });

        describe('MapboxTileSource', () => {
            let subject = makeOneOf('MapboxTileSource');
            it('returns a new MapboxTileSource', () => {
                assert.instanceOf(subject, TileSource.MapboxTileSource);
            });
        });
    });

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
