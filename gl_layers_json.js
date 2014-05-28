[
    {
        name: 'water_ocean',
        data: function (json) {
            if (!json['water'] || !json['water'].features) {
                return null;
            }

            return {
                type: 'FeatureCollection',
                features: json['water'].features.filter(function (feature) {
                    return feature.properties.kind == 'ocean';
                })
            };
        }
    },
    {
        name: 'earth',
        data: 'earth'
    },
    {
        name: 'landuse',
        data: function (json) {
            if (!json['landuse'] || !json['landuse'].features) {
                return null;
            }

            return {
                type: 'FeatureCollection',
                features: json['landuse'].features.sort(function(a, b) {
                    return (b.properties.area - a.properties.area);
                })
            };
        }
    },
    {
        name: 'water_areas',
        data: function (json) {
            if (!json['water'] || !json['water'].features) {
                return null;
            }

            return {
                type: 'FeatureCollection',
                features: json['water'].features.filter(function (feature) {
                    return feature.properties.kind != 'ocean';
                })
            };
        }
    },
    {
        name: 'roads',
        data: function (json) {
            if (!json['roads'] || !json['roads'].features) {
                return null;
            }

            return {
                type: 'FeatureCollection',
                features: json['roads'].features.sort(function(a, b) {
                  return (a.properties.sort_key - b.properties.sort_key);
                })
            };
        }
    },
    {
        name: 'buildings',
        data: 'buildings'
    },
    {
        name: 'pois',
        // data: 'pois'
        data: function (json) {
            // Only features WITH names
            return {
                type: 'FeatureCollection',
                features: json['pois'].features.filter(function (feature) {
                    return (feature.properties.name != null && feature.properties.name != '');
                })
            };
        }
    }
]
