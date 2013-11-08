var gl_layers = [
    {
        name: 'land',
        data: function (geojson) { return geojson['land-usages']; }
    },
    {
        name: 'water',
        data: function (geojson) { return geojson['water-areas']; }
    },
    {
        name: 'buildings',
        data: function (geojson) { return geojson['buildings']; }
    }
];

var canvas_layers = [
    {
        name: 'land',
        data: function (geojson) { return geojson['land-usages']; }
    },
    {
        name: 'water',
        data: function (geojson) { return geojson['water-areas']; }
    },
    {
        name: 'roads',
        data: function (geojson) { return geojson['highroad']; }
    },
    {
        name: 'road_labels',
        data: function (geojson) { return geojson['skeletron']; }
    },
    {
        name: 'buildings',
        data: function (geojson) { return geojson['buildings']; }
    },
    {
        name: 'pois',
        data: function (geojson) { return geojson['pois']; }
    }
];
