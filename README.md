Tangram: WebGL Maps for Vector Data
===

[![Circle CI](https://circleci.com/gh/tangrams/tangram.png?style=badge&circle-token=2529a88125530794f64ffa1783625b5357456f71)](https://circleci.com/gh/tangrams/tangram)

<a href="http://tangrams.github.io/tangram" target="_blank">
![tangram-header](https://cloud.githubusercontent.com/assets/459970/7569087/8cd14df6-f7d4-11e4-8360-db31790d2bbf.png)
</a>

Tangram is a JavaScript library for rendering 2D & 3D maps live in a web browser with WebGL. It is tuned for OpenStreetMap but supports any source of GeoJSON/TopoJSON or binary vector data, including tilesets and single files.

Here's a [simple demo](https://tangrams.github.io/simple-demo/) ([repo here](https://github.com/tangrams/simple-demo)) with a basic example of a Tangram map. 

_[Tangram-ES](https://github.com/tangrams/tangram-es) is a native mobile version of the Tangram library._

## Quickstart

The current version of Tangram can be included in your page with:

```
<script src="https://mapzen.com/tangram/tangram.min.js"></script>
```

The library includes a [Leaflet](http://leafletjs.com) plugin, `Tangram.LeafletLayer`, to provide basic web map pan/zoom functionality.

Data sources, layers, and styling rules are written in a *scene file* ([here's an example](https://github.com/tangrams/simple-demo/blob/gh-pages/scene.yaml)). Armed with a scene file like `scene.yaml`, you can create a Tangram scene and add it to a Leaflet map like so:

```
var map = L.map('map');
var layer = Tangram.leafletLayer({ scene: 'scene.yaml' });
layer.addTo(map);
```

Read on for more info, or see the [documentation](https://mapzen.com/documentation/tangram/).

## Demos

[**simple-demo**](http://github.com/tangrams/tangram-demo) - A minimal demo showing the basic setup

[**highways-demo**](http://github.com/tangrams/highways-demo) - Zoom-dependent styles and contextual filtering rules

[**gui-demo**](http://github.com/tangrams/gui-demo) - Control styles in real-time with a gui

[**shaders-demo**](http://github.com/tangrams/shaders-demo) - Simple glsl shaders

[**Tangram-sandbox**](http://github.com/tangrams/tangram-sandbox) - More complex glsl shaders

More examples are available on our documentation's [Demos](https://mapzen.com/documentation/tangram/Demos/) page.

## Vector Tiles

Instead of loading traditional bitmap tiles, Tangram draws its own tiles from scratch, based on *vector tiles* that contain the source data.

Mapzen provides a free [vector tile service](http://mapzen.com/vector/) extracted from OpenStreetMap and Natural Earth data, with worldwide coverage updated continuously -- [sign up for an API key here](https://mapzen.com/developers). There is also an [OSM.US-hosted](http://openstreetmap.us/~migurski/vector-datasource/) alternative.

Tangram currently supports [GeoJSON](http://geojson.org/) & [TopoJSON](https://github.com/mbostock/topojson)-based tiles, as well as Mapbox's [binary format](https://github.com/mapbox/vector-tile-spec), all of which are available from the [Mapzen vector tile service](http://mapzen.com/vector/). (Here's an [example GeoJSON tile](http://vector.mapzen.com/osm/all/14/4826/6161.json).)

## Styling

The *scene file* is where you specify data sources and layers, filter the data, and define and apply styles. (In our demos, this file is named scene.yaml.) The rules for doing these things are many and various, but the basics are pretty easy, and they are all meticulously documented in the [Tangram Documentation](https://mapzen.com/documentation/tangram/).

The scene file is written in YAML, which is a data-serialization format like JSON, but with less punctuation. Instead, data structures are specified with whitespace, like Python. One neat side benefit is that the format is super friendly to strings, which means you can write inline JavaScript and GLSL code straight into the scene file, without needing to wrap it in quotes or concatenate anything.

## Documentation

👉 [Tangram Documentation](https://mapzen.com/documentation/tangram) 👈

For questions, comments, suggestions, or to report a bug, please open a [new issue](https://github.com/tangrams/tangram/issues).

## Contributions Welcome

Tangram is open-source, and we eagerly welcome feedback, feature requests, and contributions. We’re especially interested to see your maps, no matter how simple! Send screenshots, links, and any questions to tangram@mapzen.com.

For instructions, see [CONTRIBUTING.md](CONTRIBUTING.md).

Tangram is an open-source project sponsored by [Mapzen](http://mapzen.com).
