[
    {
       name: 'water_ocean',
       data: function (json) { return json['water']; }
    },
    {
        name: 'land_usages',
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
    }
    // {
    //    name: 'water_ocean',
    //    data: function (json) {
    //        return {
    //            type: 'FeatureCollection',
    //            features: json['water-areas'].features.filter(function (feature) {
    //                return feature.properties.kind == 'ocean';
    //            })
    //        };
    //    }
    // },
    // {
    //    name: 'land_areas',
    //    data: function (json) { return json['land-areas']; }
    // },
    // {
    //     name: 'land_usages',
    //     data: function (json) {
    //         return {
    //             type: 'FeatureCollection',
    //             features: json['land-usages'].features.sort(function(a, b) {
    //                 return (b.properties.area - a.properties.area);
    //             })
    //         };
    //     }
    // },
    // {
    //    name: 'water_areas',
    //    data: function (json) {
    //        return {
    //            type: 'FeatureCollection',
    //            features: json['water-areas'].features.filter(function (feature) {
    //                return feature.properties.kind != 'ocean';
    //            })
    //        };
    //    }
    // },
    // {
    //     name: 'roads',
    //     data: function (json) {
    //         return {
    //             type: 'FeatureCollection',
    //             features: json['highroad'].features.sort(function(a, b) {
    //                 return (a.properties.sort_key - b.properties.sort_key);
    //             })
    //         };
    //     }
    // },
    // {
    //     name: 'buildings',
    //     data: function (json) { return json['buildings']; }
    // }
]
