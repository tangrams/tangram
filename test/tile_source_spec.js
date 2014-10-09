import chai from 'chai';
let assert = chai.assert;
import {Geo} from '../src/geo';
import sampleTile from './fixtures/sample-tile';
import TileSource from '../src/tile_source';
import {
    NetworkTileSource,
    GeoJSONTileSource,
    TopoJSONTileSource,
    MapboxFormatTileSource
} from '../src/tile_source';

import {MethodNotImplemented} from '../src/errors';

describe('TileSource', () => {

    let url = 'http://localhost:8080/stuff';
    let max_zoom = 12;
    let options = {url, max_zoom};

    describe('.constructor(options)', () => {
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
        it('sets the url', () => {
            assert.equal(subject.url_template, url);
        });
    });

    describe('.loadTile(tile, cb)', () => {
        let subject = new TileSource(options);
        describe('when the .loadTile method is not overridden', () => {
            it('throws a MethodNotImplemented error', () => {
                assert.throws(
                    () => { subject.loadTile({}, () => {}); },
                    MethodNotImplemented
                );
            });
        });
    });

    describe('TileSource.create(type, url_template, options)', () => {

        describe('when I ask for a GeoJSONTileSource', () => {
            let subject = TileSource.create(_.merge({type: 'GeoJSONTileSource'}, options));
            it('returns a new GeoJSONTileSource', () => {
                assert.instanceOf(subject, GeoJSONTileSource);
            });
        });

        describe('when I ask for a TopoJSONTileSource', () => {
            let subject = TileSource.create(_.merge({type: 'TopoJSONTileSource'}, options));
            it('returns a new TopoJSONTileSource', () => {
                assert.instanceOf(subject, TopoJSONTileSource);
            });
        });

        describe('when I ask for a MapboxFormatTileSource', () => {
            let subject = TileSource.create(_.merge({type: 'MapboxFormatTileSource'}, options));
            it('returns a new MapboxFormatTileSource', () => {
                assert.instanceOf(subject, MapboxFormatTileSource);
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
            sinon.assert.callCount(Geo.transformGeometry, 3);
        });

        it('calls the .latLngToMeters() method', () => {
            sinon.assert.callCount(Geo.latLngToMeters, 3);
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


    describe('NetworkTileSource', () => {

        describe('.getDefaultHeaders()', () => {
            let subject;
            beforeEach(() => {
                subject = new NetworkTileSource(options);
            });

            it('returns a default hash of headers', () => {
                assert.deepEqual(
                    subject.getDefaultHeaders(),
                    {'Content-Type': 'application/json'}
                );
            });
        });

        describe('.parseTile(tile)', () => {
            let subject;
            beforeEach(() => {
                subject = new NetworkTileSource(options);
            });

            describe('when not overriden by a subclass', () => {
                it('throws an error', () => {
                    assert.throws(
                        () => { subject.parseTile({}); },
                        MethodNotImplemented,
                        'Method parseTile must be implemented in subclass'
                    );
                });
            });
        });


    });

    describe('GeoJSONTileSource', () => {
        let mockHTTP = JSON.stringify(require('./fixtures/sample-http-response.json'));
        describe('.loadTile(tile, callback)', () => {
            describe('when there are no http errors', () => {
                let subject, xhr, request, mockTile;

                beforeEach(() => {
                    mockTile = _.clone(require('./fixtures/sample-tile.json'));
                    xhr = sinon.useFakeXMLHttpRequest();
                    xhr.onCreate = (req) => {
                        request = req;
                    };
                    subject = new GeoJSONTileSource(options);
                });
                afterEach(() => {
                    xhr.restore();
                    request = undefined;
                    subject = undefined;
                });

                it('calls back with the tile object', (done) => {
                    subject.loadTile(mockTile, (tile) => {
                        assert.isObject(tile);
                        done();
                    });
                    request.respond(200, {}, mockHTTP);
                });
            });

            describe('when there are http errors', () => {
                it('calls back with an error object');
            });
        });
    });

});
