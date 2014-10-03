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

        describe('.loadTile(tile, cb)', () => {

            describe('when there are no http errors', () => {
                let subject, xhr, request, mockTile;
                let runAjax = (content) => {
                    request.respond(
                        200, { 'Content-Type': 'application/json' },
                        JSON.stringify(require('./fixtures/sample-http-response.json'))
                    );
                };

                beforeEach(() => {
                    mockTile = _.clone(require('./fixtures/sample-tile.json'));
                    xhr = sinon.useFakeXMLHttpRequest();
                    xhr.onCreate = (req) => {
                        request = req;
                    };
                    subject = TileSource.create({url: '', max_zoom: 12});
                    sinon.spy(subject, 'parseTile');
                });

                afterEach(() => {
                    xhr.restore();
                    subject = undefined;
                    request = undefined;
                });

                it('calls back with the tile', (done) => {
                    subject.loadTile(mockTile, (tile) => {
                        assert.isObject(tile);
                        done();
                    });
                    runAjax();
                });

                it('calls the .parseTile() method', (done) => {
                    subject.loadTile(mockTile, (tile) => {
                        assert.isTrue(subject.parseTile.called);
                        done();
                    });
                    runAjax();
                });
            });

            describe('when there are http errors', () => {
                let subject, request, xhr, mockTile;

                beforeEach(() => {
                    mockTile = _.clone(require('./fixtures/sample-tile.json'));
                    xhr = sinon.useFakeXMLHttpRequest();
                    xhr.onCreate = (req) => {
                        request = req;
                    };
                    subject = TileSource.create({url: '', max_zoom: 12});
                });
                afterEach(() => { });

                it('calls back with an error', (done) => {
                    subject.loadTile(mockTile, (error, tile) => {
                        // assert.instanceOf(error, Error);
                        assert.isObject(error);
                        done();
                    });
                    request.respond(404, {}, '{}');
                });
            });

        });

    });

});
