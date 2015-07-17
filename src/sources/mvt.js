import DataSource, {NetworkTileSource} from './data_source';
import Geo from '../geo';

import Pbf from 'pbf';
import {VectorTile, VectorTileFeature} from 'vector-tile';

/**
 Mapbox Vector Tile format
 @class MVTSource
*/
export class MVTSource extends NetworkTileSource {

    constructor (source) {
        super(source);
        this.response_type = "arraybuffer"; // binary data
        this.pad_scale = source.pad_scale || 0.001; // scale tile up by this factor (0.1%) to cover seams
    }

    parseSourceData (tile, source, response) {
        // Convert Mapbox vector tile to GeoJSON
        var data = new Uint8Array(response);
        var buffer = new Pbf(data);
        source.data = new VectorTile(buffer);
        source.layers = this.toGeoJSON(source.data);
        delete source.data; // comment out to save raw data for debugging

        // Post-processing
        for (var t in source.layers) {
            var num_features = source.layers[t].features.length;
            for (var f=0; f < num_features; f++) {
                var feature = source.layers[t].features[f];

                // Copy OSM id
                Geo.transformGeometry(feature.geometry, coord => {
                    // Slightly scale up tile to cover seams
                    coord[0] = Math.round(coord[0] * (1 + this.pad_scale) - (4096 * this.pad_scale/2));
                    coord[1] = Math.round(coord[1] * (1 + this.pad_scale) - (4096 * this.pad_scale/2));
                });
            }
        }
    }

    // Loop through layers/features using Mapbox lib API, convert to GeoJSON features
    // Returns an object with keys for each layer, e.g. { layer: geojson }
    toGeoJSON (tile) {
        var layers = {};
        for (var l in tile.layers) {
            var layer = tile.layers[l];
            var layer_geojson = {
                type: 'FeatureCollection',
                features: []
            };

            for (var f=0; f < layer.length; f++) {
                var feature = layer.feature(f);
                var feature_geojson = {
                    type: 'Feature',
                    geometry: {},
                    properties: feature.properties
                };

                var geometry = feature_geojson.geometry;
                var coordinates = feature.loadGeometry();
                for (var r=0; r < coordinates.length; r++) {
                    var ring = coordinates[r];
                    for (var c=0; c < ring.length; c++) {
                        ring[c] = [
                            ring[c].x,
                            ring[c].y
                        ];
                    }
                }
                geometry.coordinates = coordinates;

                if (VectorTileFeature.types[feature.type] === 'Point') {
                    geometry.type = 'Point';
                    geometry.coordinates = geometry.coordinates[0][0];
                }
                else if (VectorTileFeature.types[feature.type] === 'LineString') {
                    if (coordinates.length === 1) {
                        geometry.type = 'LineString';
                        geometry.coordinates = geometry.coordinates[0];
                    }
                    else {
                        geometry.type = 'MultiLineString';
                    }
                }
                else if (VectorTileFeature.types[feature.type] === 'Polygon') {
                    geometry.type = 'Polygon';
                }

                layer_geojson.features.push(feature_geojson);
            }
            layers[l] = layer_geojson;
        }
        return layers;
    }

}

DataSource.register(MVTSource, 'MVT');
