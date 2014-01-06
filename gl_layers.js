[
    {
       name: 'water_ocean',
       data: function (json) {
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
       data: function (json) { return json['land-areas']; }
    },
    {
        name: 'land_usages',
        data: function (json) {
            return {
                type: 'FeatureCollection',
                features: json['land-usages'].features.sort(function(a, b) {
                    return (b.properties.area - a.properties.area); // order roads by prodivded polygon area
                })
            };
        }
    },
    {
       name: 'water_areas',
       data: function (json) {
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
            return {
                type: 'FeatureCollection',
                features: json['highroad'].features.sort(function(a, b) {
                    return (a.properties.sort_key - b.properties.sort_key); // order roads by prodivded 'sort_key'
                })
            };
        }
    },
    {
        name: 'buildings',
        data: function (json) { return json['buildings']; }
    }
]
