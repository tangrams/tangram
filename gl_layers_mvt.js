[
    {
       name: 'water_ocean',
       data: function (json) { return json['water']; }
    },
    {
        name: 'landuse',
        data: function (json) {
          return {
              type: 'FeatureCollection',
              features: ((json['landuse']||{}).features||[]).filter(function (feature) {
                  feature.properties.kind = feature.properties.class;
                  return feature;
              })
          };
        }
    },
    {
       name: 'water_areas',
       data: function (json) { return json['waterway']; }
    },
    {
        name: 'roads',
        data: function (json) {
            return {
                type: 'FeatureCollection',
                features: (((json['road']||{}).features)||[]).concat(((json['bridge']||{}).features)||[]).filter(function (feature) {
                    if (['motorway', 'motorway_link'].indexOf(feature.properties.class) > 0) {
                        feature.properties.kind = 'highway';
                    }
                    else if (feature.properties.class == 'main') {
                        feature.properties.kind = 'major_road';
                    }
                    else if (['street', 'street_limited'].indexOf(feature.properties.class) > 0) {
                        feature.properties.kind = 'minor_road';
                    }
                    else {
                        feature.properties.kind = feature.properties.type;
                    }
                    return feature;
                })
            };
        }
    },
    {
        name: 'buildings',
        data: function (json) { return json['building']; }
    },
    {
        name: 'pois',
        data: function (json) {
          return {
              type: 'FeatureCollection',
              features: ((json['poi_labels']||{}).features||[]).filter(function (feature) {
                  feature.properties.kind = feature.properties.type;
                  return feature;
              })
          };
        }
    }
]
