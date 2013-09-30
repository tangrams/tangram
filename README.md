canvas-map
==========

This is a demo of dynamic client-side map rendering using GeoJSON vector tiles and the HTML Canvas API (as opposed to static tile images created server-side with a renderer such as Mapnik).

It's available here:

http://vector.io/canvas-map

It uses Michal Migurski's experimental GeoJSON vector tile service of OpenStreetMap data:

http://openstreetmap.us/~migurski/vector-datasource/

The popular [Leaflet](http://leafletjs.com) library is used for standard web slippy map functionality (map pan & zoom, manage the tile positions and network calls). 
The demo hooks into Leaflet's canvas tile layer type, which allows for custom drawing of each tile via a user-defined function. 
The tile draw function loads the GeoJSON tile, then processes and draws the geometry using standard Canvas lines and polygons.

Stylistically, it aims for a sparse look with a few, contrasting colors (bright colors with grayscale), and tightly packed geometry, similar to dense linework in illustration or comics.
