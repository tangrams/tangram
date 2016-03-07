import chai from 'chai';
let assert = chai.assert;
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import Geo from '../src/geo';
import sampleTile from './fixtures/sample-tile';
import DataSource, {NetworkTileSource} from '../src/sources/data_source';
import {
    GeoJSONTileSource,
    GeoJSONSource
} from '../src/sources/geojson';
import {
    TopoJSONTileSource,
    TopoJSONSource
} from '../src/sources/topojson';
import {MVTSource} from '../src/sources/mvt';

import Utils from '../src/utils/utils';
import {MethodNotImplemented} from '../src/utils/errors';

function getMockTile() {
    return _.clone(require('./fixtures/sample-tile.json'));
}

function getMockJSONResponse() {
    return JSON.stringify(_.clone(require('./fixtures/sample-json-response.json')));
}

function getMockTopoResponse() {
    return JSON.stringify(_.clone(require('./fixtures/sample-topojson-response.json')));
}


describe('DataSource', () => {

    let url      = 'http://localhost:8080/{z}/{y}/{x}';
    let max_zoom = 12;
    let name     = 'test-source';
    let options  = {url, max_zoom, name};

    describe('.constructor(options)', () => {
        let subject;
        beforeEach(() => {
            subject = new DataSource(options);
        });

        it('returns a new instance', () => {
            assert.instanceOf(subject, DataSource);
        });
        it('sets the max_zoom level', () => {
            assert.equal(subject.max_zoom, max_zoom);
        });
    });

    describe('DataSource.create(options)', () => {

        describe('when I ask for a GeoJSON source with a tile template URL', () => {
            let subject = DataSource.create(_.merge({type: 'GeoJSON'}, options));
            it('returns a new GeoJSONTileSource', () => {
                assert.instanceOf(subject, GeoJSONTileSource);
            });
        });

        describe('when I ask for a TopoJSON source with a tile template URL', () => {
            let subject = DataSource.create(_.merge({type: 'TopoJSON'}, options));
            it('returns a new TopoJSONTileSource', () => {
                assert.instanceOf(subject, TopoJSONTileSource);
            });
        });

        describe('when I ask for a GeoJSONTiles source (backwards compatibility', () => {
            let subject = DataSource.create(_.merge({type: 'GeoJSONTiles'}, options));
            it('returns a new GeoJSONTileSource', () => {
                assert.instanceOf(subject, GeoJSONTileSource);
            });
        });

        describe('when I ask for a TopoJSONTiles source (backwards compatibility', () => {
            let subject = DataSource.create(_.merge({type: 'TopoJSONTiles'}, options));
            it('returns a new TopoJSONTileSource', () => {
                assert.instanceOf(subject, TopoJSONTileSource);
            });
        });

        describe('when I ask for a GeoJSON source without a tile template URL', () => {
            let subject = DataSource.create(_.merge({type: 'GeoJSON'}, options, {url: 'http://localhost:8080/'}));
            it('returns a new GeoJSONSource', () => {
                assert.instanceOf(subject, GeoJSONSource);
            });
        });

        describe('when I ask for a TopoJSON source without a tile template URL', () => {
            let subject = DataSource.create(_.merge({type: 'TopoJSON'}, options, {url: 'http://localhost:8080/'}));
            it('returns a new TopoJSONSource', () => {
                assert.instanceOf(subject, TopoJSONSource);
            });
        });

        describe('when I ask for a MVTSource', () => {
            let subject = DataSource.create(_.merge({type: 'MVT'}, options));
            it('returns a new MVTSource', () => {
                assert.instanceOf(subject, MVTSource);
            });
        });
    });

    describe('DataSource.projectData(tile)', () => {
        let subject;
        beforeEach(() => {
            sinon.spy(Geo, 'transformGeometry');
            sinon.spy(Geo, 'latLngToMeters');
            subject = DataSource.projectData(sampleTile);
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

    describe('DataSource.scaleData(tile)', () => {

        beforeEach(() => {
            sinon.spy(Geo, 'transformGeometry');
        });

        afterEach(() => {
            Geo.transformGeometry.restore();
        });

        it('calls the .transformGeometry() method', () => {

            DataSource.scaleData(sampleTile, sampleTile);
            assert.strictEqual(Geo.transformGeometry.callCount, 3);
        });

        // This test seems flaky
        it.skip('scales the coordinates', () => {
            let subject = DataSource.scaleData(sampleTile, sampleTile.layers);
            let firstFeature = subject.layers.water.features[0];

            assert.deepEqual(firstFeature.geometry.coordinates, [-0.006075396068253094,-0.006075396068253094]);
        });
    });

    describe('NetworkSource', () => {

        describe('when creating an instance of a subclass of NetworkSource', () => {
            let subject = DataSource.create(_.merge({type: 'GeoJSON'}, options));
            it('sets the url', () => {
                assert.equal(subject.url, url);
            });
        });

    });

    describe('NetworkTileSource', () => {

        describe('.parseSourceData(dest, source, reponse)', () => {
            let subject;
            beforeEach(() => {
                subject = new NetworkTileSource(options);
            });

            describe('when not overriden by a subclass', () => {
                it('throws an error', () => {
                    assert.throws(
                        () => { subject.parseSourceData({}); },
                        MethodNotImplemented,
                        'Method parseSourceData must be implemented in subclass'
                    );
                });
            });
        });
    });

    describe('GeoJSONTileSource', () => {

        describe('.load(tile)', () => {

            describe('when there are no http errors', () => {
                let subject, mockTile;

                beforeEach(() => {
                    mockTile = getMockTile();
                    sinon.stub(Utils, 'io').returns(Promise.resolve(getMockJSONResponse()));
                    subject = new GeoJSONTileSource(options);
                    return subject.load(mockTile);
                });

                afterEach(() => {
                    Utils.io.restore();
                    subject = undefined;
                });

                it('calls back with the tile object', () => {
                    assert(!mockTile.source_data.error);
                    assert.isFulfilled(subject.load(mockTile));
                });
            });

            describe('when there are http errors', () => {
                let subject, mockTile;
                beforeEach(() => {
                    mockTile = getMockTile();
                    sinon.stub(Utils, 'io').returns(Promise.reject(new Error('I am an error')));
                    subject = new GeoJSONTileSource(options);
                    return subject.load(mockTile);
                });

                afterEach(() => {
                    Utils.io.restore();
                    subject = undefined;
                });

                it('resolves the promise but includes an error', () => {
                    assert(mockTile.source_data.error);
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

        describe('.parseSourceData(dest, source, reponse)', () => {

            beforeEach(() => {
                sinon.spy(DataSource, 'projectData');
                sinon.spy(DataSource, 'scaleData');
            });

            afterEach(() => {
                DataSource.projectData.restore();
                DataSource.scaleData.restore();
            });

            it('calls .projectData()', () => {
                subject.parseSourceData(getMockTile(), {}, getMockTopoResponse());
                sinon.assert.called(DataSource.projectData);
            });

            it('calls .scaleData()', () => {
                subject.parseSourceData(getMockTile(), {},getMockTopoResponse());
                sinon.assert.called(DataSource.scaleData);
            });

            it('attaches the response to the tile object', () => {
                let tile = getMockTile();
                let source = {};

                subject.parseSourceData(tile, source, getMockTopoResponse());
                assert.property(source, 'layers');
                assert.deepProperty(source, 'layers.buildings');
                assert.deepProperty(source, 'layers.water');
            });
        });
    });

    describe('MVTSource', () => {
        let subject;
//            tile   = getMockTile();

        beforeEach(() => {
            subject = new MVTSource(options);
        });

        describe('.constructor()', () => {
            it('returns a new instance', () => {
                assert.instanceOf(subject, MVTSource);
            });
        });

        // this is failing because of an isssue with either the mapbox
        // example tile, or the protobuffer library
        describe.skip('.parseSourceData(dest, source, reponse)', (done) => {
            it('attaches the response to the tile object', () => {

                // getMockMapboxResponse((body) => {
                //     subject.parseTile(tile, body);
                //     assert.property(tile, 'layers');
                //     assert.deepProperty(tile, 'layers.buildings');
                //     assert.deepProperty(tile, 'layers.water');
                //     done();
                // });

            });
        });
    });
});
