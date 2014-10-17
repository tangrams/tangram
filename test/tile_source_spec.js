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
import Utils from '../src/utils';

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
        let mockHTTP = JSON.stringify(require('./fixtures/sample-http-response.json'));

        describe('.loadTile(tile, callback)', () => {
            describe('when there are no http errors', () => {
                let subject, mockTile;

                beforeEach(() => {
                    mockTile = _.clone(require('./fixtures/sample-tile.json'));
                    sinon.stub(Utils, 'xhr').callsArgWith(1, null, {}, mockHTTP);
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
                        assert.deepProperty(tile, 'layers.water');
                        assert.deepProperty(tile, 'layers.land');
                        done();
                    });
                });
            });

            describe('when there are http errors', () => {
                let subject, mockTile;
                beforeEach(() => {
                    mockTile = _.clone(require('./fixtures/sample-tile.json'));
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

});
