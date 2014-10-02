import sinon from 'sinon';
import chai from 'chai';
let assert = chai.assert;
import TileSource from '../src/tile_source';
import sampleTile from './fixtures/sample-tile';

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

        describe('when I ask for a NetworkTileSource', () => {
            let subject = makeOneOf('NetworkTileSource');
            it('returns a new NetworkTileSource', () => {
                assert.instanceOf(subject, TileSource.NetworkTileSource);
            });
        });

        describe('when I ask for a GeoJSONTileSource', () => {
            let subject = makeOneOf('GeoJSONTileSource');
            it('returns a new GeoJSONTileSource', () => {
                assert.instanceOf(subject, TileSource.GeoJSONTileSource);
            });
        });

        describe('when I ask for a TopoJSONTileSource', () => {
            let subject = makeOneOf('TopoJSONTileSource');
            it('returns a new TopoJSONTileSource', () => {
                assert.instanceOf(subject, TileSource.TopoJSONTileSource);
            });
        });

        describe('when I ask for a MapboxTileSource', () => {
            let subject = makeOneOf('MapboxTileSource');
            it('returns a new MapboxTileSource', () => {
                assert.instanceOf(subject, TileSource.MapboxTileSource);
            });
        });
    });

    describe('TileSource.projectTile(tile)', () => {
        beforeEach(() => {});

        it('returns the tile in a mercator projection', () => {
            let subject = TileSource.projectTile(sampleTile);
            assert.equal(subject.layers.water.features[0].geometry.coordinates[0], 1113194.9079327357);
            assert.equal(subject.layers.water.features[0].geometry.coordinates[1], 1118889.9748579597);
        });

    });

    describe('TileSource.scaleTile(tile)', () => {});

    describe('NetworkTileSource', () => {
        describe('.constructor', () => {});
        describe('.loadTile(tile, cb)', () => {});
    });

});
