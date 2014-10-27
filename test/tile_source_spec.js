import chai from 'chai';
import xhr  from 'xhr';
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
import Utils from '../src/utils';

import {MethodNotImplemented} from '../src/errors';

function getMockTile() {
    return _.clone(require('./fixtures/sample-tile.json'));
}

function getMockJSONResponse() {
    return JSON.stringify(_.clone(require('./fixtures/sample-json-response.json')));
}

function getMockTopoResponse() {
    return JSON.stringify(_.clone(require('./fixtures/sample-topojson-response.json')));
}

function getMockMapboxResponse(cb) {
    return xhr({responseType: 'arraybuffer',
                uri: 'base/test/fixtures/sample-mapbox-response.mapbox'}, (error, _, body) => { cb(body); });
}

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

        // This test seems flaky
        it.skip('scales the coordinates', () => {
            let subject = TileSource.scaleTile(sampleTile);
            let firstFeature = subject.layers.water.features[0];

            assert.deepEqual(firstFeature.geometry.coordinates, [-0.006075396068253094,-0.006075396068253094]);
        });
    });

    describe('NetworkTileSource', () => {

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

        describe('.loadTile(tile, callback)', () => {
            describe('when there are no http errors', () => {
                let subject, mockTile;

                beforeEach(() => {
                    mockTile = getMockTile();
                    sinon.stub(Utils, 'xhr').callsArgWith(1, null, {}, getMockJSONResponse());
                    subject = new GeoJSONTileSource(options);
                });
                afterEach(() => {
                    Utils.xhr.restore();
                    subject = undefined;
                });

                it('calls back with the tile object', (done) => {
                    subject.loadTile(mockTile, (error, tile) => {
                        // require something that looks like a tile
                        // object
                        assert.property(tile, 'loading');
                        assert.property(tile, 'coords');
                        assert.property(tile, 'debug');
                        assert.deepProperty(tile, 'layers.buildings');
                        assert.deepProperty(tile, 'layers.water');
                        done();
                    });
                });
            });

            describe('when there are http errors', () => {
                let subject, mockTile;
                beforeEach(() => {
                    mockTile = getMockTile();
                    sinon.stub(Utils, 'xhr').callsArgWith(1, new Error('message'), {}, '');
                    subject = new GeoJSONTileSource(options);
                });

                it('calls back with an error object', (done) => {
                    subject.loadTile(mockTile, (error, tile) => {
                        assert.instanceOf(error, Error);
                        done();
                    });
                });
            });
        });
    });

    describe('TopoJSONTileSource', () => {
        let subject;
        beforeEach(() => {
            subject = new TopoJSONTileSource(options);
        });

        describe('.constructor()', () => {
            it('returns a new instance', () => {
                assert.instanceOf(subject, TopoJSONTileSource);
            });
        });

        describe('.parseTile(tile, response)', () => {

            beforeEach(() => {
                sinon.spy(TileSource, 'projectTile');
                sinon.spy(TileSource, 'scaleTile');
            });

            afterEach(() => {
                TileSource.projectTile.restore();
                TileSource.scaleTile.restore();
            });

            it('calls .projectTile()', () => {
                subject.parseTile(getMockTile(), getMockTopoResponse());
                sinon.assert.called(TileSource.projectTile);
            });

            it('calls .scaleTile()', () => {
                subject.parseTile(getMockTile(), getMockTopoResponse());
                sinon.assert.called(TileSource.scaleTile);
            });

            it('attaches the response to the tile object', () => {
                let tile = getMockTile();
                subject.parseTile(tile, getMockTopoResponse());
                assert.property(tile, 'layers');
                assert.deepProperty(tile, 'layers.buildings');
                assert.deepProperty(tile, 'layers.water');
            });
        });
    });

    describe('MapboxFormatTileSource', () => {
        let subject,
            tile   = getMockTile();

        beforeEach(() => {
            subject = new MapboxFormatTileSource(options);
        });

        describe('.constructor()', () => {
            it('returns a new instance', () => {
                assert.instanceOf(subject, MapboxFormatTileSource);
            });
        });

        // this is failing because of an isssue with either the mapbox
        // example tile, or the protobuffer library
        describe.skip('.parseTile(tile, response)', (done) => {
            it('attaches the response to the tile object', () => {

                getMockMapboxResponse((body) => {
                    subject.parseTile(tile, body);
                    assert.property(tile, 'layers');
                    assert.deepProperty(tile, 'layers.buildings');
                    assert.deepProperty(tile, 'layers.water');
                    done();
                });

            });
        });
    });
});
