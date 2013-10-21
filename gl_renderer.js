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

GLRenderer.prototype.addTile = function GLRendererAddTile (tile, tileDiv)
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
        // buildings: [0.5, 0.5, 0.5],
        buildings: function () { return [0.5, 0.5, 0.5].map(function(c) { return c *= Math.random(); }); }, // random color
        // buildings: function (f) { return [0.5, 0.5, 0.5].map(function(c) { return c += ((parseInt(f.id) || 0) % 16) * 2 / 256; }); }, // slight grayscale striping
        default: [1.0, 0, 0]
    };

    // Build triangles
    var triangles = [], count = 0;
    var layer, polygons, vertices;
    var z, color;
    var height, wall_vertices, shade;
    var brighten = 1.3, darken = 0.7;
    var t, p, w;

    for (var layer_num=0; layer_num < layers.length; layer_num++) {
        layer = layers[layer_num];
        if (tile.layers[layer.key] != null) {
            tile.layers[layer.key].features.forEach(function(feature) {
                if (feature.geometry.type == 'Polygon') {
                    polygons = [feature.geometry.coordinates];
                }
                else if (feature.geometry.type == 'MultiPolygon') {
                    polygons = feature.geometry.coordinates;
                }

                z = (feature.properties && feature.properties.sort_key) || layer_num;

                color = colors[layer.name] || colors.default;
                if (typeof color == 'function') { // dynamic/function-based color
                    color = color(feature);
                }

                polygons.forEach(function (polygon) {
                    // Use libtess.js port of gluTesselator for complex OSM polygons
                    vertices = triangulate(polygon);

                    // 3D buildings
                    // TODO: try moving this into a style-specific post-processing/filter function?
                    if (layer.name == 'buildings' && tile.coords.z >= 16) {
                        height = 20; // TODO: add this to vector tiles

                        for (t=0; t < vertices.length; t++) {
                            triangles.push(
                                vertices[t][0],
                                vertices[t][1] + height,
                                z + height,
                                Math.min(color[0]*1.2, 1), Math.min(color[1]*1.2, 1), Math.min(color[2]*1.2, 1)
                            );
                        }
                        count += vertices.length;

                        for (p=0; p < polygon.length; p++) {
                            for (w=0; w < polygon[p].length - 1; w++) {
                                wall_vertices = [];

                                // Two triangles for the quad formed by each vertex pair, going from ground to building height
                                wall_vertices.push(
                                    // Triangle
                                    [polygon[p][w+1][0], polygon[p][w+1][1] + height, z + height],
                                    [polygon[p][w+1][0], polygon[p][w+1][1], z],
                                    [polygon[p][w][0], polygon[p][w][1], z],
                                    // Triangle
                                    [polygon[p][w][0], polygon[p][w][1], z],
                                    [polygon[p][w][0], polygon[p][w][1] + height, z + height],
                                    [polygon[p][w+1][0], polygon[p][w+1][1] + height, z + height]
                                );

                                shade = polygon[p][w][1] < polygon[p][w+1][1] ? brighten : darken;
                                for (t=0; t < wall_vertices.length; t++) {
                                    triangles.push(
                                        wall_vertices[t][0],
                                        wall_vertices[t][1],
                                        wall_vertices[t][2],
                                        Math.min(color[0] * shade, 1), Math.min(color[1] * shade, 1), Math.min(color[2] * shade, 1)
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
                                color[0], color[1], color[2]
                            );
                        }
                        count += vertices.length;
                    }
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
    //     var feature = selection.colors[color];
    //     if (feature != null) {
    //         context.canvas.style.cursor = 'crosshair';
    //         selection_info.style.left = (/*parseInt(context.canvas.style.left) + */ event.offsetX + 5) + 'px';
    //         selection_info.style.top = (/*parseInt(context.canvas.style.top) + */ event.offsetY + 5) + 'px';
    //         selection_info.innerHTML = '<span class="labelInner">' + feature.properties.name + ' [' + feature.properties.kind + ']'</span>';
    //         selection_info.style.display = 'block';
    //         context.canvas.parentNode.appendChild(selection_info);
    //     }
    //     else {
    //         context.canvas.style.cursor = null;
    //         selection_info.style.display = 'none';
    //         if (selection_info.parentNode == context.canvas.parentNode) {
    //             context.canvas.parentNode.removeChild(selection_info);
    //         }
    //     }
    // };
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
    gl.uniform2f(gl.getUniformLocation(program, 'resolution'), canvas.width, canvas.height);

    var center = map.getCenter(); // TODO: move map center tracking/projection to central class?
    center = latLngToMeters(Point(center.lng, center.lat));
    gl.uniform2f(gl.getUniformLocation(program, 'map_center'), center.x, center.y);
    gl.uniform1f(gl.getUniformLocation(program, 'map_zoom'), map.getZoom());

    // gl.clearColor(200 / 255, 200 / 255, 200 / 255, 1.0);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

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
