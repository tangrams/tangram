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
       data: function (json) { return json['land-usages']; }
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
            // Order roads using provided 'sort_key'
            var data = {
                type: 'FeatureCollection',
                features: json['highroad'].features.sort(function(a, b) {
                    return (a.properties.sort_key > b.properties.sort_key);
                })
            };

            // Normalize sort keys (there are some really high and low values that cause too much spatial separation of layers)
            var i = 0, last_sort_key = null;
            for (var f in data.features) {
                var sort_key = data.features[f].properties.sort_key;
                if (sort_key != last_sort_key) {
                    i = i++ || 0;
                    last_sort_key = sort_key;
                }
                data.features[f].properties.sort_key = i;
            };

            return data;
        }
    },
    {
        name: 'buildings',
        data: function (json) { return json['buildings']; }
    }
]
