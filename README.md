WebGL & Canvas for OpenStreetMap
===

This library provides dynamic client-side map rendering with WebGL (and to a lesser extent, Canvas), from GeoJSON or binary vector tiles.

## Vector Tiles

Instead of using traditional image tiles, we render from **vector tiles** that contain the underlying source geometry for each tile's bounding box. The following tile formats are currently supported:

- **GeoJSON**: available from Mapzen or the OpenStreetMap.US server, roughly following the format defined [here](http://openstreetmap.us/~migurski/vector-datasource/) by Mike Migurski. Here's an [example GeoJSON tile](http://vector.test.mapzen.com/vector/all/14/4826/6161.json).
- **Mapbox vector tiles**: in the binary format defined [here](https://github.com/mapbox/vector-tile-spec).

The library also includes a [Leaflet](http://leafletjs.com) plugin, ` leaflet_vector_tile_layer.js`, to provide basic web map pan/zoom functionality.

## Installation

```
npm install
make
```

The library will be minified in `dist/`, and `index.html` provides an example for rendering from different sources and simple Leaflet integration.

## Examples

- [**NYC / Lower Manhattan**](http://vector.io/vector-map/#mapzen,40.70479834544056,-74.0057945251465,15)
- [**NYC / Central Park**](http://vector.io/vector-map/#mapzen,40.78004586258099,-73.96652698516847,16)
- [**Berlin**](http://vector.io/vector-map/#mapzen,52.52177659937554,13.373343944549562,16)
- [**Colosseum & Roman ruins**](http://vector.io/vector-map/#mapzen,41.889367479706124,12.488912343978884,17)
