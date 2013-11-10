GLRenderer.prototype = Object.create(VectorRenderer.prototype);

function GLRenderer (leaflet, layers)
{
    VectorRenderer.apply(this, arguments);
}

GLRenderer.prototype.init = function GLRendererInit ()
{
    this.gl = GL.getContext();
    this.program = GL.createProgramFromElements(this.gl, 'vertex-shader', 'fragment-shader');
    // this.background = new GLBackground(this.gl, this.program); // TODO: passthrough vertex shader needed for background (no map translation)
    this.last_render_count = null;

    this.zoom = this.leaflet.map.getZoom();
    this.zoom_step = 0.02; // for fractional zoom user adjustment
    this.map_last_zoom = this.leaflet.map.getZoom();
    this.map_zooming = false;

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
        renderer.map_last_zoom = renderer.leaflet.map.getZoom();
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
    });

    document.addEventListener('keyup', function (event) {
        gl_renderer.key = null;
    });
};

GLRenderer.prototype.addTile = function GLRendererAddTile (tile, tileDiv)
{
    // TODO: unify w/canvas style object
    var colors = {
        land: [0.5, 0.875, 0.5],
        water: [0.5, 0.5, 0.875],
        // buildings: [0.5, 0.5, 0.5],
        // buildings: function () { return [0.7, 0.7, 0.7].map(function(c) { return c *= Math.random(); }); }, // random color
        buildings: function (f) { return [0.7 * (parseInt(f.id, 16) / 100 % 1), 0.7 * (parseInt(f.id, 16) / 10000 % 1), 0.7 * (parseInt(f.id, 16) / 1000000 % 1)]; }, // pseudo-random color by geometry id
        // buildings: function (f) { var c = Math.max((parseInt(f.id, 16) % 100) / 100, 0.4); return [0.7 * c, 0.7 * c, 0.7 * c]; }, // random grayscale
        // buildings: function (f) { return [0.5, 0.5, 0.5].map(function(c) { return c += ((parseInt(f.id) || 0) % 16) * 2 / 256; }); }, // slight grayscale striping
        default: [1.0, 0, 0]
    };

    // Build triangles
    var triangles = [], count = 0;
    var layer, polygons, vertices;
    var z, color;
    var height, wall_vertices;
    var t, p, w;

    for (var layer_num=0; layer_num < this.layers.length; layer_num++) {
        layer = this.layers[layer_num];
        if (tile.layers[layer.name] != null) {
            tile.layers[layer.name].features.forEach(function(feature) {
                if (feature.geometry.type == 'Polygon') {
                    polygons = [feature.geometry.coordinates];
                }
                else if (feature.geometry.type == 'MultiPolygon') {
                    polygons = feature.geometry.coordinates;
                }

                // To ensure layers draw in order, offset z coordinate by one centimeter per layer
                // TODO: use glPolygonOffset instead of modifying z coord in geom? or store as separate field that doesn't affect y coord in vertex shader
                z = (feature.properties && feature.properties.sort_key) || layer_num;
                z /= 100;

                color = colors[layer.name] || colors.default;
                if (typeof color == 'function') { // dynamic/function-based color
                    color = color(feature);
                }

                polygons.forEach(function (polygon) {
                    // Use libtess.js port of gluTesselator for complex OSM polygons
                    vertices = GL.triangulate(polygon);

                    // 3D buildings
                    // TODO: try moving this into a style-specific post-processing/filter function?
                    if (layer.name == 'buildings' && tile.coords.z >= 16) {
                        height = 20; // TODO: add this to vector tiles

                        for (t=0; t < vertices.length; t++) {
                            triangles.push(
                                vertices[t][0],
                                vertices[t][1],
                                z + height,
                                0, 0, 1, // flat surfaces point straight up
                                color[0], color[1], color[2]
                            );
                        }
                        count += vertices.length;

                        for (p=0; p < polygon.length; p++) {
                            for (w=0; w < polygon[p].length - 1; w++) {
                                wall_vertices = [];

                                // Two triangles for the quad formed by each vertex pair, going from ground to building height
                                wall_vertices.push(
                                    // Triangle
                                    [polygon[p][w+1][0], polygon[p][w+1][1], z + height],
                                    [polygon[p][w+1][0], polygon[p][w+1][1], z],
                                    [polygon[p][w][0], polygon[p][w][1], z],
                                    // Triangle
                                    [polygon[p][w][0], polygon[p][w][1], z],
                                    [polygon[p][w][0], polygon[p][w][1], z + height],
                                    [polygon[p][w+1][0], polygon[p][w+1][1], z + height]
                                );

                                // Calc the normal of the wall from up vector and one segment of the wall triangles
                                var normal = Vector.cross(
                                    [0, 0, 1],
                                    Vector.normalize([polygon[p][w+1][0] - polygon[p][w][0], polygon[p][w+1][1] - polygon[p][w][1], 0])
                                );

                                for (t=0; t < wall_vertices.length; t++) {
                                    triangles.push(
                                        wall_vertices[t][0],
                                        wall_vertices[t][1],
                                        wall_vertices[t][2],
                                        normal[0], normal[1], normal[2],
                                        color[0], color[1], color[2]
                                    );
                                }
                                count += wall_vertices.length;
                            }
                        }
                    }
                    // Regular polygon
                    else {
                        for (t=0; t < vertices.length; t++) {
                            triangles.push(
                                vertices[t][0],
                                vertices[t][1],
                                z,
                                0, 0, 1, // flat surfaces point straight up
                                color[0], color[1], color[2]
                            );
                        }
                        count += vertices.length;
                    }
                });
            });
        }
    }

    this.tiles[tile.key].gl_geometry = new GLTriangles(this.gl, this.program, new Float32Array(triangles), count);
    console.log("created " + count + " triangles for tile " + tile.key);

    // Selection
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
        this.tiles[key].gl_geometry.destroy();
        this.tiles[key].gl_geometry = null;
    }
    VectorRenderer.prototype.removeTile.apply(this, arguments);
};

GLRenderer.prototype.removeTilesOutsideZoomRange = function (below, above)
{
    console.log("removeTilesOutsideZoomRange [" + below + ", " + above + "])");
    for (var t in this.tiles) {
        if (this.tiles[t].coords.z < below || this.tiles[t].coords.z > above) {
            console.log("removed " + this.tiles[t].key + " (outside range [" + below + ", " + above + "])");
            this.removeTile(t);
        }
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

    var center = this.leaflet.map.getCenter(); // TODO: move map center tracking/projection to central class?
    center = latLngToMeters(Point(center.lng, center.lat));
    gl.uniform2f(gl.getUniformLocation(this.program, 'map_center'), center.x, center.y);
    gl.uniform1f(gl.getUniformLocation(this.program, 'map_zoom'), this.zoom);
    // gl.uniform1f(gl.getUniformLocation(this.program, 'map_zoom'), Math.floor(this.zoom) + (Math.log((this.zoom % 1) + 1) / Math.LN2)); // scale fractional zoom by log

    // gl.clearColor(200 / 255, 200 / 255, 200 / 255, 1.0);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // this.background.render();

    // Render tile GL geometries
    var count = 0;
    for (var t in this.tiles) {
        if (this.tiles[t].coords.z == (this.zoom << 0) && this.tiles[t].gl_geometry != null) {
            this.tiles[t].gl_geometry.render();
            count += this.tiles[t].gl_geometry.count;
        }
        // else {
        //     console.log("didn't render " + this.tiles[t].key);
        // }
    }

    if (count != this.last_render_count) {
        console.log("rendered " + count + " triangles");
    }
    this.last_render_count = count;
};
