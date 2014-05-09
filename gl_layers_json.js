[
    {
        name: 'water_ocean',
        data: function (json) {
            if (!json['water-areas'] || !json['water-areas'].features) {
                return null;
            }

            return {
                type: 'FeatureCollection',
                features: json['water-areas'].features.filter(function (feature) {
                    return feature.properties.kind == 'ocean';
                })
            };
        }
    },
    {
        name: 'land_areas',
        data: 'land-areas'
    },
    {
        name: 'land_usages',
        data: function (json) {
            if (!json['land-usages'] || !json['land-usages'].features) {
                return null;
            }

            return {
                type: 'FeatureCollection',
                features: json['land-usages'].features.sort(function(a, b) {
                    return (b.properties.area - a.properties.area);
                })
            };
        }
    },
    {
        name: 'water_areas',
        data: function (json) {
            if (!json['water-areas'] || !json['water-areas'].features) {
                return null;
            }

            return {
                type: 'FeatureCollection',
                features: json['water-areas'].features.filter(function (feature) {
                    return feature.properties.kind != 'ocean';
                })
            };
        }
    },
    {
        name: 'roads',
        data: function (json) {
            if (!json['highroad'] || !json['highroad'].features) {
                return null;
            }

            return {
                type: 'FeatureCollection',
                features: json['highroad'].features.sort(function(a, b) {
                  return (a.properties.sort_key - b.properties.sort_key);
                })
            };
        }
    },
    {
        name: 'buildings',
        data: 'buildings'
    }
]
