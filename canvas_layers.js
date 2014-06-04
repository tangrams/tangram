[
    {
        name: 'land_unlabeled',
        data: function (json) {
            if (!json['landuse'] || !json['landuse'].features) {
                return null;
            }

            // Only land features WITHOUT names
            return {
                type: 'FeatureCollection',
                features: json['landuse'].features.filter(function (feature) {
                    return !(feature.properties.name != null && feature.properties.name != '');
                })
            };
        },
        selection: true
    },
    {
        name: 'land_labeled',
        data: function (json) {
            if (!json['landuse'] || !json['landuse'].features) {
                return null;
            }

            // Only land features WITH names
            return {
                type: 'FeatureCollection',
                features: json['landuse'].features.filter(function (feature) {
                    return (feature.properties.name != null && feature.properties.name != '');
                })
            };
        },
        selection: true
    },
    {
        name: 'water',
        data: 'water',
        selection: true
    },
    {
        name: 'roads',
        data: function (json) {
            if (!json['roads'] || !json['roads'].features) {
                return null;
            }

            // Order roads using provided 'sort_key'
            return {
                type: 'FeatureCollection',
                features: json['roads'].features.sort(function(a, b) {
                    return (a.properties.sort_key > b.properties.sort_key);
                })
            };
        }
    },
    // {
    //     name: 'road_labels',
    //     data: function (json) {
    //         if (!json['skeletron'] || !json['skeletron'].features) {
    //             return null;
    //         }

    //         // Order roads using provided 'sort_key'
    //         return {
    //             type: 'FeatureCollection',
    //             features: json['skeletron'].features.sort(function(a, b) {
    //                 return (a.properties.sort_key > b.properties.sort_key);
    //             })
    //         };
    //     },
    //     visible: false,
    //     selection: true
    // },
    {
        name: 'buildings_unlabeled',
        data: function (json) {
            if (!json['buildings'] || !json['buildings'].features) {
                return null;
            }

            return {
                type: 'FeatureCollection',
                features: json['buildings'].features.filter(function (feature) {
                    return !(feature.properties.name != null && feature.properties.name != '');
                })
            };
        },
        selection: true
    },
    {
        name: 'buildings_labeled',
        data: function (json) {
            if (!json['buildings'] || !json['buildings'].features) {
                return null;
            }

            return {
                type: 'FeatureCollection',
                features: json['buildings'].features.filter(function (feature) {
                    return (feature.properties.name != null && feature.properties.name != '');
                })
            };
        },
        selection: true
    },
    {
        name: 'pois',
        data: function (json) {
            if (!json['pois'] || !json['pois'].features) {
                return null;
            }

            // Only features WITH names
            return {
                type: 'FeatureCollection',
                features: json['pois'].features.filter(function (feature) {
                    return (feature.properties.name != null && feature.properties.name != '');
                })
            };
        },
        selection: true
    }
]
