Tangram: WebGL Maps for Vector Data
===

[![Circle CI](https://circleci.com/gh/tangrams/tangram.png?style=badge&circle-token=2529a88125530794f64ffa1783625b5357456f71)](https://circleci.com/gh/tangrams/tangram)

<a href="http://tangrams.github.io/tangram" target="_blank">
<img alt="tangram-header" src="https://cloud.githubusercontent.com/assets/459970/7569087/8cd14df6-f7d4-11e4-8360-db31790d2bbf.png">
</a>

Tangram is a JavaScript library for rendering 2D & 3D maps live in a web browser with WebGL. It is tuned for OpenStreetMap but supports any source of GeoJSON/TopoJSON or binary vector data, including tilesets and single files.

Here's a [simple demo](https://tangrams.github.io/simple-demo/) ([repo here](https://github.com/tangrams/simple-demo)) with a basic example of a Tangram map.

Tangram is instantiated as a [Leaflet](http://leafletjs.com/) plugin for integration with standard web maps. [Tangram ES](https://github.com/tangrams/tangram-es) is a native mobile version of the Tangram library, written in C++.

## Getting Started

Tangram is published in two build flavors: one for current browsers (bundled as an ES module, using modern JS and web platform features), and one for older browsers (specifically IE11, with modern JS transpiled to older ES5 syntax). You can use this snippet to automatically load the best one for your browser, using the [`module`/`nomodule` pattern](https://developers.google.com/web/fundamentals/primers/modules#browser):

```html
<!-- modern browsers load the optimized .mjs file, older browsers (IE11) load the transpiled .js file -->
<script type="module" src="https://unpkg.com/tangram/dist/tangram.min.mjs"></script>
<script nomodule src="https://unpkg.com/tangram/dist/tangram.min.js"></script>
```

**Note:** Because scripts with the `module` type automatically load in ["deferred" mode](https://flaviocopes.com/javascript-async-defer/), you must make sure to **include the `defer` keyword** for any scripts you load that depend on Tangram (so that they won't run until Tangram is finished loading). For example, if your app code is in `index.js`, load it like this (anywhere after the Tangram `<script>` tag):

`<script defer src="index.js"></script>`

Specific Tangram library versions can also be loaded with `@version` syntax(see [unpkg](https://unpkg.com/) for details). Versions earlier than v0.16.0 do not use the `module` syntax; use a single script tag to load them instead: `<script src="https://unpkg.com/tangram@0.15.5/dist/tangram.min.js"></script>`.

Tangram is [published on NPM](https://www.npmjs.com/package/tangram) and can be [bundled using `import` or `require`](https://github.com/tangrams/tangram-play/wiki/Using-Tangram-with-Bundlers-&-Frameworks).

The library includes a [Leaflet](http://leafletjs.com) plugin, `Tangram.LeafletLayer`, to provide basic web map pan/zoom functionality.

Data sources, layers, and styling rules are written in a *scene file* ([here's an example](https://github.com/tangrams/simple-demo/blob/master/scene.yaml)). Armed with a scene file like `scene.yaml`, you can create a Tangram scene and add it to a Leaflet map like so:

```js
var map = L.map('map');
var layer = Tangram.leafletLayer({ scene: 'scene.yaml' });
layer.addTo(map);
```

Read on for more info, or see the [documentation](https://tangrams.readthedocs.io/) ([github repo](https://github.com/tangrams/tangram-docs/)).

## Demos

[**simple-demo**](http://github.com/tangrams/tangram-demo) - A minimal demo showing the basic setup

[**highways-demo**](http://github.com/tangrams/highways-demo) - Zoom-dependent styles and contextual filtering rules

[**gui-demo**](http://github.com/tangrams/gui-demo) - Control styles in real-time with a gui

[**shaders-demo**](http://github.com/tangrams/shaders-demo) - Simple glsl shaders

[**Tangram-sandbox**](http://github.com/tangrams/tangram-sandbox) - More complex glsl shaders

More examples are [available here](https://github.com/tangrams?utf8=%E2%9C%93&q=demo&type=&language=).

## Vector Tiles

Instead of loading traditional bitmap tiles, Tangram draws its own tiles from scratch, based on *vector tiles* that contain the source data.

[Nextzen](https://www.nextzen.org/) provides a free [vector tile service](https://developers.nextzen.org/about.html) based on open data from [OpenStreetMap](https://openstreetmap.org/), [Natural Earth](http://www.naturalearthdata.com/), [Who's On First](https://whosonfirst.org/) and other projects,  with worldwide coverage updated continuously -- [sign up for an API key here](https://developers.nextzen.org/).

Tangram currently supports [GeoJSON](http://geojson.org/) & [TopoJSON](https://github.com/mbostock/topojson)-based tiles, as well as Mapbox's [binary format](https://github.com/mapbox/vector-tile-spec).

## Styling

The *scene file* is where you specify data sources and layers, filter the data, and define and apply styles. (In our demos, this file is named scene.yaml.) The rules for doing these things are many and various, but the basics are pretty easy, and they are all meticulously documented in the [Tangram Documentation](https://tangrams.readthedocs.io/).

The scene file is written in YAML, which is a data-serialization format like JSON, but with less punctuation. Instead, data structures are specified with whitespace, like Python. One neat side benefit is that the format is super friendly to strings, which means you can write inline JavaScript and GLSL code straight into the scene file, without needing to wrap it in quotes or concatenate anything.

## Support

For technical reference and concept overviews, see the [Tangram Documentation](https://tangrams.readthedocs.io/).

For questions, comments, suggestions, or to report a bug, please open a [new issue](https://github.com/tangrams/tangram/issues).

You can also find us in the Tangram-chat gitter room: https://gitter.im/tangrams/tangram-chat

## Browser Support

Tangram JS is officially supported and tested on the last two versions of these browsers:

- Mac OS: Chrome, Firefox, and Safari
- Windows: Chrome, Firefox, IE11, and Edge
- iOS: Safari
- Android: Chrome

Tangram JS should also run in any browser with WebGL support.

## Contributions Welcome

Tangram is open-source, and we eagerly welcome feedback, feature requests, and contributions. We’re especially interested to see your maps, no matter how simple! Post screenshots, links, and any questions to our [gitter chat](https://gitter.im/tangrams/tangram-chat).

For instructions, see [CONTRIBUTING.md](CONTRIBUTING.md).

Tangram JS was created by [Mapzen](https://www.mapzen.com/) and is now a [Linux Foundation Project](https://www.linuxfoundation.org/press-release/2019/01/mapzen-open-source-data-and-software-for-real-time-mapping-applications-to-become-a-linux-foundation-project/).
