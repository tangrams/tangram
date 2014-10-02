import chai from 'chai';
let assert = chai.assert;
import TileSource from '../src/tile_source';
import {Geo} from '../src/geo';
import sampleTile from './fixtures/sample-tile';

describe('TileSource', () => {
    let url = 'http://localhost/{x}/{y}/{z}';
    let max_zoom = 12;
    let options = {url, max_zoom};

    describe('.constructor()', () => {
        let subject;
        beforeEach(() => {
            subject = new TileSource(options);

        });

        it('returns a new instance', () => {
            assert.instanceOf(subject, TileSource);
        });
        it('sets the max_zoom level', () => {
            assert.equal(subject.max_zoom, max_zoom);
        });
    });

    describe('TileSource.create(type, url_template, options)', () => {

        describe('when I ask for a GeoJSONTileSource', () => {
            let subject = TileSource.create({type: 'GeoJSONTileSource'});

            it('returns a new GeoJSONTileSource', () => {
                assert.instanceOf(subject, Object);
            });
        });

        describe('when I ask for a TopoJSONTileSource', () => {
            let subject = TileSource.create({type: 'TopoJSONTileSource'});
            it('returns a new TopoJSONTileSource', () => {
                assert.instanceOf(subject, Object);
            });
        });

        describe('when I ask for a MapboxTileSource', () => {
            let subject = TileSource.create({type: 'MapboxTileSource'});
            it('returns a new MapboxTileSource', () => {
                assert.instanceOf(subject, Object);
            });
        });
    });

    describe('TileSource.projectTile(tile)', () => {
        let subject;
        beforeEach(() => {
            sinon.spy(Geo, 'transformGeometry');
            sinon.spy(Geo, 'latLngToMeters');
            subject = TileSource.projectTile(sampleTile);
        });

        afterEach(() => {
            subject = undefined;
            Geo.transformGeometry.restore();
            Geo.latLngToMeters.restore();
        });

        it('calls the .transformGeometry() method', () => {
            assert.strictEqual(Geo.transformGeometry.callCount, 3);
        });

        it('calls the .latLngToMeters() method', () => {
            assert.strictEqual(Geo.latLngToMeters.callCount, 3);
        });

    });

    describe('TileSource.scaleTile(tile)', () => {

        beforeEach(() => {
            sinon.spy(Geo, 'transformGeometry');
        });

        afterEach(() => {
            Geo.transformGeometry.restore();
        });

        it('calls the .transformGeometry() method', () => {
            TileSource.scaleTile(sampleTile);
            assert.strictEqual(Geo.transformGeometry.callCount, 3);
        });

        it('scales the coordinates', () => {
            let subject = TileSource.scaleTile(sampleTile);
            let firstFeature = subject.layers.water.features[0];

            assert.deepEqual(
                firstFeature,
                {"geometry":
                 {"type": "Point",
                  "coordinates":[1357421762.5708044, 12225.065494573035]},
                 "properties":{"name":"bob"}}
            );

        });

    });

    describe('GeoJSONTileSource', () => {

        describe('.constructor()', () => {
            let subject;
            beforeEach(() => {
                subject = TileSource.create({url: '', max_zoom: 12});
            });

            afterEach(() => {
                subject = undefined;
            });

            it('sets the max zoom', () => {
                assert.strictEqual(subject.max_zoom, max_zoom);
            });
        });

        describe.skip('.loadTile(tile, cb)', () => {
            let subject;
            let xhr;
            let request;

            beforeEach(() => {
                xhr = sinon.useFakeXMLHttpRequest();
                xhr.onCreate = (req) => {
                    request = req;
                };

                subject = TileSource.create({url: '', max_zoom: 12});
            });

            afterEach(() => {
                xhr.restore();
                subject = undefined;
                request = undefined;
            });

            it('calls back with the tile', () => {

                subject.loadTile(sampleTile, (tile) => {
                    assert.isDefined(tile);
                });

                request.respond(
                    200, { 'Content-Type': 'application/json' },
                    JSON.stringify(require('./fixtures/sample-tile.json'))
                );

            });

            it('modifies the tile with with the response body', () => {
                assert.isFalse(true);
            });

            it('attaches debugging information to the tile object');
            it('it calls the childs ._loadTile(tile) method');

        });

    });

});
