import log from '../utils/log';
import DataSource, {NetworkSource, NetworkTileSource} from './data_source';
import {decodeMultiPolygon} from './mvt';
import Geo from '../geo';

// For tiling GeoJSON client-side
import geojsonvt from 'geojson-vt';

/**
 GeoJSON standalone (non-tiled) source
 Uses geojson-vt split into tiles client-side
*/

export class GeoJSONSource extends NetworkSource {

    constructor(source, sources) {
        super(source, sources);
        this.load_data = null;
        this.tile_indexes = {}; // geojson-vt tile indices, by layer name
        this.max_zoom = Math.max(this.max_zoom || 0, 15); // TODO: max zoom < 15 causes artifacts/no-draw at 20, investigate
        this.setTileSize(512); // auto-tile to 512px tiles for fewer internal tiles
        this.pad_scale = 0; // we don't want padding on auto-tiled sources
    }

    _load(dest) {
        if (!this.load_data) {
            this.load_data = super._load({ source_data: { layers: {} } }).then(data => {
                // Warn and continue on data source error
                if (data.source_data.error) {
                    log('warn', `data source load error(s) for source '${this.name}', URL '${this.url}': ${data.source_data.error}`);
                }

                let layers = data.source_data.layers;
                for (let layer_name in layers) {
                    this.tile_indexes[layer_name] = geojsonvt(layers[layer_name], {
                        maxZoom: this.max_zoom,  // max zoom to preserve detail on
                        tolerance: 1.5, // simplification tolerance (higher means simpler) NB: half the default to accomodate 512px tiles
                        extent: Geo.tile_scale, // tile extent (both width and height)
                        buffer: 0.0001     // tile buffer on each side
                    });
                }

                this.loaded = true;
                return data;
            });
        }

        return this.load_data.then(() => {
            for (let layer_name in this.tile_indexes) {
                dest.source_data.layers[layer_name] = this.getTileFeatures(dest, layer_name);
            }
            return dest;
        });
    }

    getTileFeatures(tile, layer_name) {
        let coords = Geo.wrapTile(tile.coords, { x: true });

        // request a particular tile
        let t = this.tile_indexes[layer_name].getTile(coords.z, coords.x, coords.y);

        // Convert from MVT-style JSON struct to GeoJSON
        let collection;
        if (t && t.features) {
            collection = {
                type: 'FeatureCollection',
                features: []
            };

            for (let i=0; i < t.features.length; i++) {
                const feature = t.features[i];

                // GeoJSON feature
                let f = {
                    type: 'Feature',
                    geometry: {},
                    properties: feature.tags
                };

                if (feature.type === 1) {
                    f.geometry.coordinates = feature.geometry.map(coord => [coord[0], coord[1]]);
                    f.geometry.type = 'MultiPoint';
                }
                else if (feature.type === 2 || feature.type === 3) {
                    f.geometry.coordinates = feature.geometry.map(ring =>
                        ring.map(coord => [coord[0], coord[1]])
                    );

                    if (feature.type === 2) {
                        f.geometry.type = 'MultiLineString';
                    }
                    else  {
                        f.geometry = decodeMultiPolygon(f.geometry); // un-flatten rings
                        if (f.geometry == null) { // skip polys that couldn't be decoded (e.g. degenerate)
                            continue;
                        }
                    }
                }
                else {
                    continue;
                }

                collection.features.push(f);
            }
        }

        return collection;
    }

    formatURL () {
        return this.url;
    }

    parseSourceData (tile, source, response) {
        let data = typeof response === 'string' ? JSON.parse(response) : response;
        let layers = this.getLayers(data);
        source.layers = this.preprocessLayers(layers, tile);
    }

    preprocessLayers (layers, tile){
        for (let key in layers) {
            let layer = layers[key];
            layer.features = this.preprocessFeatures(layer.features);
        }

        // Apply optional data transform
        if (typeof this.transform === 'function') {
            const tile_data = {
                min: Object.assign({}, tile.min),
                max: Object.assign({}, tile.max),
                coords: Object.assign({}, tile.coords)
            };
            if (Object.keys(layers).length === 1 && layers._default) {
                layers._default = this.transform(layers._default, this.extra_data, tile_data); // single-layer
            }
            else {
                layers = this.transform(layers, this.extra_data, tile_data); // multiple layers
            }
        }

        return layers;
    }

    // Preprocess features. Currently used to add a new "centroid" feature for polygon labeling
    preprocessFeatures (features) {
        // Remove features without geometry (which is valid GeoJSON)
        features = features.filter(f => f.geometry != null);

        // Define centroids for polygons for centroid label placement
        // Avoids redundant label placement for each generated tile at higher zoom levels
        if (this.config.generate_label_centroids){
            let features_centroid = [];
            let centroid_properties = {'label_placement' : true};

            features.forEach(feature => {
                let coordinates, centroid_feature;
                if (feature.geometry.type === 'Polygon') {
                    coordinates = feature.geometry.coordinates;
                    centroid_feature = getCentroidFeatureForPolygon(coordinates, feature.properties, centroid_properties);
                    features_centroid.push(centroid_feature);
                }
                else if (feature.geometry.type === 'MultiPolygon') {
                    // Add centroid feature for largest polygon
                    coordinates = feature.geometry.coordinates;
                    let max_area = -Infinity;
                    let max_area_index = 0;
                    for (let index = 0; index < coordinates.length; index++) {
                        let area = Geo.polygonArea(coordinates[index]);
                        if (area > max_area) {
                            max_area = area;
                            max_area_index = index;
                        }
                    }
                    centroid_feature = getCentroidFeatureForPolygon(coordinates[max_area_index], feature.properties, centroid_properties);
                    features_centroid.push(centroid_feature);
                }
            });

            // append centroid features to features array
            features_centroid = features_centroid.filter(x => x); // remove null features
            Array.prototype.push.apply(features, features_centroid);
        }

        return features;
    }

    // Detect single or multiple layers in returned data
    getLayers (data) {
        if (data.type === 'Feature') {
            return {
                _default: {
                    type: 'FeatureCollection',
                    features: [data]
                }
            };
        }
        else if (data.type === 'FeatureCollection') {
            return {
                _default: data
            };
        }
        else {
            return data;
        }
    }

}

/**
 GeoJSON vector tiles
 @class GeoJSONTileSource
*/
export class GeoJSONTileSource extends NetworkTileSource {

    constructor(source, sources) {
        super(source, sources);
    }

    parseSourceData (tile, source, response) {
        let data = typeof response === 'string' ? JSON.parse(response) : response;
        this.prepareGeoJSON(data, tile, source);
    }

    prepareGeoJSON (data, tile, source) {
        // Apply optional data transform
        if (typeof this.transform === 'function') {
            const tile_data = {
                min: Object.assign({}, tile.min),
                max: Object.assign({}, tile.max),
                coords: Object.assign({}, tile.coords)
            };
            data = this.transform(data, this.extra_data, tile_data);
        }

        source.layers = GeoJSONSource.prototype.getLayers(data);

        // A "synthetic" tile that adjusts the tile min anchor to account for tile longitude wrapping
        let anchor = {
            coords: tile.coords,
            min: Geo.metersForTile(Geo.wrapTile(tile.coords, { x: true }))
        };

        DataSource.projectData(source); // mercator projection
        DataSource.scaleData(source, anchor); // re-scale from meters to local tile coords
    }

}

// Check for URL tile pattern, if not found, treat as standalone GeoJSON/TopoJSON object
DataSource.register('GeoJSON', source => {
    return GeoJSONTileSource.urlHasTilePattern(source.url) ? GeoJSONTileSource : GeoJSONSource;
});


// Helper function to create centroid point feature from polygon coordinates and provided feature meta-data
function getCentroidFeatureForPolygon (coordinates, properties, newProperties) {
    let centroid = Geo.centroid(coordinates);
    if (!centroid) {
        return;
    }

    // clone properties and mixix newProperties
    let centroid_properties = {};
    Object.assign(centroid_properties, properties, newProperties);

    return {
        type: 'Feature',
        properties: centroid_properties,
        geometry: {
            type: 'Point',
            coordinates: centroid
        }
    };
}
