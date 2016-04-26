import DataSource from './data_source';
import {GeoJSONSource, GeoJSONTileSource} from './geojson';

import topojson from 'topojson';

/**
 TopoJSON standalone (non-tiled) source
 Uses geojson-vt split into tiles client-side
*/

export class TopoJSONSource extends GeoJSONSource {

    parseSourceData (tile, source, response) {
        let data = JSON.parse(response);
        data = this.toGeoJSON(data);

        let layers = this.getLayers(data);
        super.preprocessLayers(layers);
        source.layers = layers;
    }

    toGeoJSON (data) {
        // Single layer
        if (data.objects &&
            Object.keys(data.objects).length === 1) {
            let layer = Object.keys(data.objects)[0];
            data = getTopoJSONFeature(data, data.objects[layer]);
        }
        // Multiple layers
        else {
            let layers = {};
            for (let key in data.objects) {
                layers[key] = getTopoJSONFeature(data, data.objects[key]);
            }
            data = layers;
        }
        return data;
    }

}

function getTopoJSONFeature (topology, object) {
    let feature = topojson.feature(topology, object);

    // Convert single feature to a feature collection
    if (feature.type === 'Feature') {
        feature = {
            type: 'FeatureCollection',
            features: [feature]
        };
    }
    return feature;
}


/**
 Mapzen/OSM.US-style TopoJSON vector tiles
 @class TopoJSONTileSource
*/
export class TopoJSONTileSource extends GeoJSONTileSource {

    constructor(source) {
        let _this = super(source);

        // Replace with non-tiled source if tiled source failed to instantiate
        if (_this !== this) {
            return new TopoJSONSource(source);
        }
    }

    parseSourceData (tile, source, response) {
        let data = JSON.parse(response);
        data = TopoJSONSource.prototype.toGeoJSON(data);
        this.prepareGeoJSON(data, tile, source);
    }

}

DataSource.register(TopoJSONTileSource, 'TopoJSON');        // prefered shorter name
DataSource.register(TopoJSONTileSource, 'TopoJSONTiles');   // for backwards-compatibility

