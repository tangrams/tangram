GLRenderer.prototype = Object.create(VectorRenderer.prototype);
GLRenderer.debug = false;

function GLRenderer (leaflet, layers)
{
    VectorRenderer.apply(this, arguments);
    GLBuilders.setTileScale(VectorRenderer.tile_scale);
}

GLRenderer.prototype.init = function GLRendererInit ()
{
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = 0;
    this.canvas.style.left = 0;
    this.canvas.style.zIndex = -1;

    // Insert after map container (leaflet transforms shouldn't be applied to the GL canvas)
    // TODO: find a better way to deal with this? right now GL map only renders correctly as the bottom layer
    var map_container = this.leaflet.map.getContainer();
    map_container.parentNode.insertBefore(this.canvas, map_container.nextSibling);

    this.gl = GL.getContext(this.canvas);
    this.program = GL.createProgramFromURLs(this.gl, 'vertex.glsl', 'fragment.glsl');
    this.last_render_count = null;

    this.zoom = this.leaflet.map.getZoom();
    this.zoom_step = 0.02; // for fractional zoom user adjustment
    this.map_last_zoom = this.leaflet.map.getZoom();
    this.map_zooming = false;
    this.start_time = +new Date();

    this.initMapHandlers();
    this.initInputHandlers();
};

// Leaflet map/layer handlers
GLRenderer.prototype.initMapHandlers = function GLRendererInitMapHandlers ()
{
    var renderer = this;

    this.leaflet.map.on('zoomstart', function () {
        console.log("map.zoomstart " + renderer.leaflet.map.getZoom());
        renderer.map_last_zoom = renderer.leaflet.map.getZoom();
        renderer.map_zooming = true;
    });

    this.leaflet.map.on('zoomend', function () {
        console.log("map.zoomend " + renderer.leaflet.map.getZoom());
        renderer.map_zooming = false;

        // Schedule GL tiles for removal on zoom
        // console.log("renderer.map_last_zoom: " + renderer.map_last_zoom);
        var map_zoom = renderer.leaflet.map.getZoom();
        var below = map_zoom;
        var above = map_zoom;
        if (Math.abs(map_zoom - renderer.map_last_zoom) == 1) {
            if (map_zoom > renderer.map_last_zoom) {
                below = map_zoom - 1;
            }
            else {
                above = map_zoom + 1;
            }
        }
        renderer.removeTilesOutsideZoomRange(below, above);
        renderer.map_last_zoom = map_zoom;
    });

    this.leaflet.layer.on('tileunload', function (event) {
        var tile = event.tile;
        var key = tile.getAttribute('data-tile-key');
        if (key && renderer.tiles[key]) {
            if (renderer.map_zooming == false) {
                console.log("unload " + key);
                renderer.removeTile(key);
            }
        }
    });
};

// User input
GLRenderer.prototype.initInputHandlers = function GLRendererInitInputHandlers ()
{
    var gl_renderer = this;
    gl_renderer.key = null;

    document.addEventListener('keydown', function (event) {
        if (event.keyCode == 37) {
            gl_renderer.key = 'left';
        }
        else if (event.keyCode == 39) {
            gl_renderer.key = 'right';
        }
        else if (event.keyCode == 38) {
            gl_renderer.key = 'up';
        }
        else if (event.keyCode == 40) {
            gl_renderer.key = 'down';
        }
        else if (event.keyCode == 82) { /* r */
            console.log("reloading shaders");
            gl_renderer.program = GL.updateProgramFromURLs(gl_renderer.gl, gl_renderer.program, 'vertex.glsl', 'fragment.glsl');
        }
    });

    document.addEventListener('keyup', function (event) {
        gl_renderer.key = null;
    });
};

// Determine a Z value that will stack features in a "painter's algorithm" style, first by layer, then by draw order within layer
// Features are assumed to be already sorted in desired draw order by the layer pre-processor
GLRenderer.prototype.calculateZ = function (layer, tile, offset)
{
    offset = offset || 0;
    var z = layer.number / 16;
    z += (1 - (1 / (tile.feature_count + 1))) / 16;
    z += offset;
    return z;
};

GLRenderer.prototype.addTile = function GLRendererAddTile (tile, tileDiv)
{
    var renderer = this;
    var layer, style, feature, z;
    var vertex_triangles = [];
    var vertex_lines = [];

    // Join line test pattern
    // if (GLRenderer.debug) {
    //     tile.layers['roads'].features.push(GLRenderer.buildZigzagLineTestPattern());
    // }

    // Build raw geometry arrays
    tile.feature_count = 0;
    for (var ln=0; ln < this.layers.length; ln++) {
        layer = this.layers[ln];
        style = this.styles[layer.name] || {};

        if (tile.layers[layer.name] != null) {
            var num_features = tile.layers[layer.name].features.length;
            for (var f=0; f < num_features; f++) {
                feature = tile.layers[layer.name].features[f];
                style = this.parseStyleForFeature(feature, layer, tile);
                z = this.calculateZ(layer, tile);

                var vertex_constants = [
                    style.color[0], style.color[1], style.color[2]
                    // TODO: add layer, material info, etc.
                ];

                var polygons = null;
                if (feature.geometry.type == 'Polygon') {
                    polygons = [feature.geometry.coordinates];
                }
                else if (feature.geometry.type == 'MultiPolygon') {
                    polygons = feature.geometry.coordinates;
                }

                var lines = null;
                if (feature.geometry.type == 'LineString') {
                    lines = [feature.geometry.coordinates];
                }
                else if (feature.geometry.type == 'MultiLineString') {
                    lines = feature.geometry.coordinates;
                }

                if (polygons != null) {
                    // Regular polygons
                    if (!style.extrude) {
                        GLBuilders.buildPolygons(polygons, z, vertex_triangles, { vertex_constants: vertex_constants });
                    }
                    // Extruded polygons (e.g. 3D buildings)
                    else {
                        GLBuilders.buildExtrudedPolygons(polygons, z, style.height, vertex_triangles, { vertex_constants: vertex_constants });
                    }

                    // Polygon outlines
                    // for (var mpc=0; mpc < polygons.length; mpc++) {
                    //     GLBuilders.buildPolylines(polygons[mpc], feature, layer, { color: [1, 0, 0], width: Style.width.pixels(1, tile) }, tile, z + 0.01, vertex_triangles, vertex_lines, { closed_polygon: true, remove_tile_edges: true });
                    // }
                }

                if (lines != null) {
                    // GLBuilders.buildLines(lines, feature, layer, style, tile, z, vertex_lines);
                    GLBuilders.buildPolylines(lines, feature, layer, style, tile, z, vertex_triangles, vertex_lines);
                }

                tile.feature_count++;
            }
        }
    }

    // Create GL geometry objects
    tile.gl_geometry = [];
    if (vertex_triangles.length > 0) {
        tile.gl_geometry.push(new GLTriangles(this.gl, this.program, new Float32Array(vertex_triangles)));
    }
    if (vertex_lines.length > 0) {
        tile.gl_geometry.push(new GLLines(this.gl, this.program, new Float32Array(vertex_lines), { line_width: 1 /*5 / Geo.meters_per_pixel[Math.floor(this.zoom)]*/ }));
    }
    tile.geometry_count = tile.gl_geometry.reduce(function(sum, geom) { return sum + geom.geometry_count; }, 0);
    tile.debug.geometries = tile.geometry_count;
    tile.debug.features = tile.feature_count;
    tile.debug.geom_ratio = (tile.debug.geometries / tile.debug.features).toFixed(1);
    // console.log("created " + tile.geometry_count + " primitives for tile " + tile.key);

    // Selection - experimental/future
    // var gl_renderer = this;
    // var pixel = new Uint8Array(4);
    // tileDiv.onmousemove = function (event) {
    //     // console.log(event.offsetX + ', ' + event.offsetY + ' | ' + parseInt(tileDiv.style.left) + ', ' + parseInt(tileDiv.style.top));
    //     var p = Point(
    //         event.offsetX + parseInt(tileDiv.style.left),
    //         event.offsetY + parseInt(tileDiv.style.top)
    //     );
    //     gl_renderer.gl.readPixels(p.x, p.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    //     console.log(p.x + ', ' + p.y + ': (' + pixel[0] + ', ' + pixel[1] + ', ' + pixel[2] + ', ' + pixel[3] + ')');
    // };
};

GLRenderer.prototype.removeTile = function GLRendererRemoveTile (key)
{
    if (this.tiles[key] != null && this.tiles[key].gl_geometry != null) {
        this.tiles[key].gl_geometry.forEach(function (gl_geometry) { gl_geometry.destroy(); });
        this.tiles[key].gl_geometry = null;
    }
    VectorRenderer.prototype.removeTile.apply(this, arguments);
};

GLRenderer.prototype.removeTilesOutsideZoomRange = function (below, above)
{
    console.log("removeTilesOutsideZoomRange [" + below + ", " + above + "])");
    var remove_tiles = [];
    for (var t in this.tiles) {
        var tile = this.tiles[t];
        if (tile.coords.z < below || tile.coords.z > above) {
            remove_tiles.push(t);
        }
    }
    for (var r=0; r < remove_tiles.length; r++) {
        var key = remove_tiles[r];
        console.log("removed " + key + " (outside range [" + below + ", " + above + "])");
        this.removeTile(key);
    }
};

// Continuous zoom: maintains a floating point zoom and syncs with leaflet to set an integer zoom
GLRenderer.prototype.setZoom = function (z) {
    var base = Math.floor(z);
    var fraction = z % 1.0;
    var map = this.leaflet.map;
    if (base != map.getZoom()) {
        if (base > map.getMaxZoom()) {
            base = map.getMaxZoom();
            fraction = 0.99;
        }
        else if (base < map.getMinZoom()) {
            base = map.getMinZoom();
        }
        this.zoom = base + fraction;
        map.setZoom(base, { animate: false });
    }
    else {
        this.zoom = z;
    }
};

GLRenderer.prototype.render = function GLRendererRender ()
{
    var gl = this.gl;

    this.input();

    if (!this.program) {
        return;
    }
    gl.useProgram(this.program);

    // Sync zoom w/leaflet
    if (Math.floor(this.zoom) != this.leaflet.map.getZoom()) {
        this.zoom = this.leaflet.map.getZoom();
    }

    // Set values to this.program variables
    gl.uniform2f(gl.getUniformLocation(this.program, 'resolution'), gl.canvas.width, gl.canvas.height);
    gl.uniform1f(gl.getUniformLocation(this.program, 'time'), ((+new Date()) - this.start_time) / 1000);

    var center = this.leaflet.map.getCenter(); // TODO: move map center tracking/projection to central class?
    center = Geo.latLngToMeters(Point(center.lng, center.lat));
    gl.uniform2f(gl.getUniformLocation(this.program, 'map_center'), center.x, center.y);
    gl.uniform1f(gl.getUniformLocation(this.program, 'map_zoom'), this.zoom);
    // gl.uniform1f(gl.getUniformLocation(this.program, 'map_zoom'), Math.floor(this.zoom) + (Math.log((this.zoom % 1) + 1) / Math.LN2)); // scale fractional zoom by log

    var meters_per_pixel = Geo.min_zoom_meters_per_pixel / Math.pow(2, this.zoom);
    var meter_zoom = Point(gl.canvas.width / 2 * meters_per_pixel, gl.canvas.height / 2 * meters_per_pixel);
    gl.uniform2f(gl.getUniformLocation(this.program, 'meter_zoom'), meter_zoom.x, meter_zoom.y);

    gl.uniform1f(gl.getUniformLocation(this.program, 'tile_scale'), VectorRenderer.tile_scale);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Render tile GL geometries
    var count = 0;
    for (var t in this.tiles) {
        var tile = this.tiles[t];
        if (tile.loaded == true && tile.coords.z == (this.zoom << 0)) {
            if (tile.gl_geometry != null) {
                gl.uniform2f(gl.getUniformLocation(this.program, 'tile_min'), tile.min.x, tile.min.y);
                gl.uniform2f(gl.getUniformLocation(this.program, 'tile_max'), tile.max.x, tile.max.y);

                tile.gl_geometry.forEach(function (gl_geometry) {
                    gl_geometry.render();
                    count += gl_geometry.geometry_count;
                });
            }
        }
    }

    if (count != this.last_render_count) {
        console.log("rendered " + count + " primitives");
    }
    this.last_render_count = count;
};

GLRenderer.prototype.input = function GLRendererInput ()
{
    // Fractional zoom scaling
    if (this.key == 'up') {
        this.setZoom(this.zoom + this.zoom_step);
    }
    else if (this.key == 'down') {
        this.setZoom(this.zoom - this.zoom_step);
    }
};
