function GLRenderer ()
{
}

GLRenderer.prototype.init = function GLRendererInit ()
{
    this.gl = GL.getContext();
    this.program = GL.createProgramFromElements(this.gl, 'vertex-shader', 'fragment-shader');
    // this.background = new GLBackground(this.gl, this.program); // TODO: passthrough vertex shader needed for background (no map translation)
    this.last_render_count = null;
};

GLRenderer.prototype.addTile = function GLRendererAddTile (tile)
{
    this.removeTile(tile); // addTile may be called multiple times on existing tile, clean-up first

    // TODO: unify w/canvas style object
    var layers = [
        { name: 'land', key: 'land-usages' },
        { name: 'water', key: 'water-areas' },
        { name: 'buildings', key: 'buildings' }
    ];

    var colors = {
        land: [0.5, 0.875, 0.5],
        water: [0.5, 0.5, 0.875],
        buildings: [0.5, 0.5, 0.5],
        default: [1.0, 0, 0]
    };

    // Build triangles
    var triangles = [];
    var count = 0;
    var z, color;

    for (var layer_num=0; layer_num < layers.length; layer_num++) {
        var layer = layers[layer_num];
        if (tile[layer.key] != null) {
            tile[layer.key].features.forEach(function(feature) {
                var polygons;
                if (feature.geometry.type == 'Polygon') {
                    polygons = [feature.geometry.coordinates];
                }
                else if (feature.geometry.type == 'MultiPolygon') {
                    polygons = feature.geometry.coordinates;
                }

                z = (feature.properties && feature.properties.sort_key) || layer_num;
                z = (-z + 32768) / 65536; // reverse and scale to 0-1

                color = colors[layer.name] || colors.default;

                polygons.forEach(function (polygon) {
                    // Use libtess,js to tesselate complex OSM polygons
                    var tess = triangulate(polygon);

                    for (var p=0; p < tess.length; p++) {
                        triangles.push(
                            tess[p][0],
                            tess[p][1],
                            z,
                            color[0], color[1], color[2]
                        );
                    }
                    count += tess.length;
                });
            });
        }
    }

    if (tiles[tile.key].gl_geometry != null) {
        tiles[tile.key].gl_geometry.destroy();
        tiles[tile.key].gl_geometry = null;
    }
    tiles[tile.key].gl_geometry = new GLTriangles(this.gl, this.program, new Float32Array(triangles), count);
    console.log("created " + count + " triangles for tile " + tile.key);
};

GLRenderer.prototype.removeTile = function GLRendererRemoveTile (tile)
{
    if (tile.gl_geometry) {
        tile.gl_geometry.destroy();
        tile.gl_geometry = null;
    }
};

GLRenderer.prototype.render = function GLRendererRender ()
{
    var canvas = this.gl.canvas;
    var gl = this.gl;
    var program = this.program;

    if (!program) {
        return;
    }
    gl.useProgram(program);

    // Set values to program variables
    // gl.uniform1f(gl.getUniformLocation(program, 'seed'), seed);
    // gl.uniform1f(gl.getUniformLocation(program, 'start_time'), start_time / 1000);
    // gl.uniform1f(gl.getUniformLocation(program, 'time'), ((new Date().getTime()) - start_time) / 1000);
    gl.uniform2f(gl.getUniformLocation(program, 'resolution'), canvas.width, canvas.height);

    gl.uniform2f(gl.getUniformLocation(program, 'map_center'), map.getCenter().lng, map.getCenter().lat);
    gl.uniform2f(gl.getUniformLocation(program, 'map_zoom'),
        map.getBounds().getNorthEast().lng - map.getBounds().getCenter().lng,
        map.getBounds().getSouthWest().lat - map.getBounds().getCenter().lat
    ); // 300
    // gl.uniform1f(gl.getUniformLocation(program, 'map_zoom'), map.getZoom());

    // gl.clearColor(200 / 255, 200 / 255, 200 / 255, 1.0);
    // gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // this.background.render();

    // Render tile GL geometries
    var count = 0;
    for (var t in tiles) {
        if (tiles.hasOwnProperty(t)) {
            if (tiles[t].gl_geometry != null) {
                tiles[t].gl_geometry.render();
                count += tiles[t].gl_geometry.count;
            }
        }
    }

    if (count != this.last_render_count) {
        console.log("rendered " + count + " triangles");
    }
    this.last_render_count = count;
};
