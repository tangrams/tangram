GLRenderer.prototype = Object.create(VectorRenderer.prototype);
GLRenderer.debug = false;

function GLRenderer (leaflet, layers)
{
    VectorRenderer.apply(this, arguments);

    // Defines the vertex buffer layout for the program
    // this.program_layout = {
    //     attribs: [
    //         {
    //             name: 'position',
    //             components: 3,
    //             type: WebGLRenderingContext.FLOAT,
    //             normalized: false
    //         },
    //         {
    //             name: 'normal',
    //             components: 3,
    //             type: WebGLRenderingContext.FLOAT,
    //             normalized: false
    //         },
    //         {
    //             name: 'color',
    //             components: 3,
    //             type: WebGLRenderingContext.FLOAT,
    //             normalized: false
    //         }
    //     ]
    // };
}

GLRenderer.prototype.init = function GLRendererInit ()
{
    this.gl = GL.getContext();
    this.program = GL.createProgramFromURLs(this.gl, 'vertex.glsl', 'fragment.glsl');
    // this.program_layout = GL.makeProgramLayout(this.gl, this.program, this.program_layout);
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
            gl_renderer.program = GL.updateProgramFromURLs(gl_renderer.gl, gl_renderer.program,'vertex.glsl', 'fragment.glsl');
        }
    });

    document.addEventListener('keyup', function (event) {
        gl_renderer.key = null;
    });
};

GLRenderer.prototype.buildPolygons = function GLRendererBuildPolygons (polygons, feature, layer, style, tile, vertex_data, options)
{
    options = options || {};
    options.z_offset = options.z_offset || 0;

    var z = layer.number / 16;
    z += (1 - (1 / (tile.feature_count + 1))) / 16;
    z += options.z_offset;

    var color = (style.color && (style.color[feature.properties.kind] || style.color.default)) || [1.0, 0, 0];
    if (typeof color == 'function') { // dynamic/function-based color
        color = color(feature);
    }

    var height, wall_vertices;

    var num_polygons = polygons.length;
    for (var p=0; p < num_polygons; p++) {
        var polygon = polygons[p];

        // Polygon outlines & edge detection - experimental
        // for (t=0; t < polygon.length; t++) {
        //     for (p=0; p < polygon[t].length - 1; p++) {
        //         // Point A to B
        //         var pa = polygon[t][p];
        //         var pb = polygon[t][p+1];

        //         // Edge detection
        //         var edge = null;
        //         var pointTest = GLRenderer.aboutEqual;
        //         var tol = 2;

        //         if (pointTest(pa[0], tile.min.x, tol) && pointTest(pb[0], tile.min.x, tol)) {
        //             edge = 'left';
        //         }
        //         else if (pointTest(pa[0], tile.max.x, tol) && pointTest(pb[0], tile.max.x, tol)) {
        //             edge = 'right';
        //         }
        //         else if (pointTest(pa[1], tile.min.y, tol) && pointTest(pb[1], tile.min.y, tol)) {
        //             edge = 'top';
        //         }
        //         else if (pointTest(pa[1], tile.max.y, tol) && pointTest(pb[1], tile.max.y, tol)) {
        //             edge = 'bottom';
        //         }

        //         if (edge != null) {
        //             console.log("tile " + tile.key + " edge detected: " + edge);
        //             continue;
        //         }

        //         lines.push(
        //             // Point A
        //             pa[0],
        //             pa[1],
        //             z + 0,
        //             0, 0, 1, // flat surfaces point straight up
        //             1, 1, 1, // white
        //             // Point B
        //             pb[0],
        //             pb[1],
        //             z + 0,
        //             0, 0, 1, // flat surfaces point straight up
        //             1, 1, 1 // white
        //         );
        //     }
        // }

        // Use libtess.js port of gluTesselator for complex OSM polygons
        var vertices = GL.triangulate(polygon);

        // 3D buildings
        // TODO: try moving this into a style-specific post-processing/filter function?
        height = (feature.properties && feature.properties.height) || 20;
        if (layer.name == 'buildings' &&
            ((tile.coords.z >= 15 && height > 20) || tile.coords.z >= 16)) {

            for (var t=0; t < vertices.length; t++) {
                vertex_data.push(
                    vertices[t][0],
                    vertices[t][1],
                    z + height,
                    0, 0, 1, // flat surfaces point straight up
                    color[0], color[1], color[2]
                );
            }

            for (var q=0; q < polygon.length; q++) {
                var contour = polygon[q];

                for (var w=0; w < contour.length - 1; w++) {
                    wall_vertices = [];

                    // Two triangles for the quad formed by each vertex pair, going from ground to building height
                    wall_vertices.push(
                        // Triangle
                        [contour[w+1][0], contour[w+1][1], z + height],
                        [contour[w+1][0], contour[w+1][1], z],
                        [contour[w][0], contour[w][1], z],
                        // Triangle
                        [contour[w][0], contour[w][1], z],
                        [contour[w][0], contour[w][1], z + height],
                        [contour[w+1][0], contour[w+1][1], z + height]
                    );

                    // Calc the normal of the wall from up vector and one segment of the wall triangles
                    var normal = Vector.cross(
                        [0, 0, 1],
                        Vector.normalize([contour[w+1][0] - contour[w][0], contour[w+1][1] - contour[w][1], 0])
                    );

                    for (var t=0; t < wall_vertices.length; t++) {
                        vertex_data.push(
                            wall_vertices[t][0],
                            wall_vertices[t][1],
                            wall_vertices[t][2],
                            normal[0], normal[1], normal[2],
                            color[0], color[1], color[2]
                        );
                    }
                }
            }
        }
        // Regular polygon
        else {
            for (var t=0; t < vertices.length; t++) {
                vertex_data.push(
                    vertices[t][0],
                    vertices[t][1],
                    z,
                    0, 0, 1, // flat surfaces point straight up
                    color[0], color[1], color[2]
                );
            }
        }
    }

    return vertex_data;
};

// Build tessellated triangles for a polyline
// Basically following the method described here for miter joints:
// http://artgrammer.blogspot.co.uk/2011/07/drawing-polylines-by-tessellation.html
GLRenderer.prototype.buildPolylines = function GLRendererBuildPolylines (lines, feature, layer, style, tile, vertex_data, vertex_lines, options)
{
    options = options || {};
    options.z_offset = options.z_offset || 0;
    options.closed_polygon = options.closed_polygon || false;
    options.remove_tile_edges = options.remove_tile_edges || false;

    var renderer = this;

    var z = layer.number / 16;
    z += (1 - (1 / (tile.feature_count + 1))) / 16;
    z += options.z_offset;

    var color = (style.color && (style.color[feature.properties.kind] || style.color.default)) || [1.0, 0, 0];
    if (typeof color == 'function') {
        color = color(feature);
    }

    var width = (style.width && (style.width[feature.properties.kind] || style.width.default)) || 1;
    if (typeof width == 'function') {
        width = width(feature, tile);
    }
    width *= tile.units_per_meter;

    // Line center - debugging
    if (GLRenderer.debug) {
        var num_lines = lines.length;
        for (var ln=0; ln < num_lines; ln++) {
            var line = lines[ln];

            for (var p=0; p < line.length - 1; p++) {
                // Point A to B
                var pa = line[p];
                var pb = line[p+1];

                vertex_lines.push(
                    pa[0], pa[1], z + 0.001, 0, 0, 1, 1.0, 0, 0,
                    pb[0], pb[1], z + 0.001, 0, 0, 1, 1.0, 0, 0
                );
            }
        };
    }

    // Build triangles
    var vertices = [];
    var num_lines = lines.length;
    for (var ln=0; ln < num_lines; ln++) {
        var line = lines[ln];
        // Multiple line segments
        if (line.length > 2) {
            // Build anchors for line segments:
            // anchors are 3 points, each connecting 2 line segments that share a joint (start point, joint point, end point)

            var anchors = [];

            if (line.length > 3) {
                // Find midpoints of each line segment
                // For closed polygons, calculate all midpoints since segments will wrap around to first midpoint
                var mid = [];
                var p, pmax;
                if (options.closed_polygon == true) {
                    p = 0; // start on first point
                    pmax = line.length - 1;
                }
                // For open polygons, skip first midpoint and use line start instead
                else {
                    p = 1; // start on second point
                    pmax = line.length - 2;
                    mid.push(line[0]); // use line start instead of first midpoint
                }

                // Calc midpoints
                for (; p < pmax; p++) {
                    var pa = line[p];
                    var pb = line[p+1];
                    mid.push([(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2]);
                }

                // Same closed/open polygon logic as above: keep last midpoint for closed, skip for open
                var mmax;
                if (options.closed_polygon == true) {
                    mmax = mid.length;
                }
                else {
                    mid.push(line[line.length-1]); // use line end instead of last midpoint
                    mmax = mid.length - 1;
                }

                // Make anchors by connecting midpoints to line joints
                for (p=0; p < mmax; p++)  {
                    anchors.push([mid[p], line[(p+1) % line.length], mid[(p+1) % mid.length]]);
                }
            }
            else {
                // Degenerate case, a 3-point line is just a single anchor
                anchors = [[line[0], line[1], line[2]]];
            }

            for (var p=0; p < anchors.length; p++) {
                if (!options.remove_tile_edges) {
                    buildAnchor(anchors[p][0], anchors[p][1], anchors[p][2]);
                    // buildSegment(anchors[p][0], anchors[p][1]); // use these to draw extruded segments w/o join, for debugging
                    // buildSegment(anchors[p][1], anchors[p][2]);
                }
                else {
                    var edge1 = renderer.isOnTileEdge(anchors[p][0], anchors[p][1]);
                    var edge2 = renderer.isOnTileEdge(anchors[p][1], anchors[p][2]);
                    if (!edge1 && !edge2) {
                        buildAnchor(anchors[p][0], anchors[p][1], anchors[p][2]);
                    }
                    else if (!edge1) {
                        buildSegment(anchors[p][0], anchors[p][1]);
                    }
                    else if (!edge2) {
                        buildSegment(anchors[p][1], anchors[p][2]);
                    }
                }
            }
        }
        // Single 2-point segment
        else if (line.length == 2) {
            buildSegment(line[0], line[1]); // TODO: replace buildSegment with a degenerate form of buildAnchor? buildSegment is still useful for debugging
        }
    };

    // Add normals and colors
    for (var v=0; v < vertices.length; v++) {
        var vertex = vertices[v];
        vertex_data.push(
            vertex[0], vertex[1], z,
            0, 0, 1, // flat surfaces point straight up
            color[0], color[1], color[2]
        );
    }

    // Build triangles for a single line segment, extruded by the provided width
    function buildSegment (pa, pb) {
        var slope = Vector.normalize([(pb[1] - pa[1]) * -1, pb[0] - pa[0], 0]);

        var pa_outer = [pa[0] + slope[0] * width/2, pa[1] + slope[1] * width/2, 0];
        var pa_inner = [pa[0] - slope[0] * width/2, pa[1] - slope[1] * width/2, 0];

        var pb_outer = [pb[0] + slope[0] * width/2, pb[1] + slope[1] * width/2, 0];
        var pb_inner = [pb[0] - slope[0] * width/2, pb[1] - slope[1] * width/2, 0];

        vertices.push(
            pb_inner, pb_outer, pa_inner,
            pa_inner, pb_outer, pa_outer
        );
    }

    // Build triangles for a 3-point 'anchor' shape, consisting of two line segments with a joint
    // TODO: move these functions out of closures?
    function buildAnchor (pa, joint, pb) {
        // Inner and outer line segments for [pa, joint] and [joint, pb]
        var pa_slope = Vector.normalize([(joint[1] - pa[1]) * -1, joint[0] - pa[0], 0]);
        var pa_outer = [
            [pa[0] + pa_slope[0] * width/2, pa[1] + pa_slope[1] * width/2, 0],
            [joint[0] + pa_slope[0] * width/2, joint[1] + pa_slope[1] * width/2, 0]
        ];
        var pa_inner = [
            [pa[0] - pa_slope[0] * width/2, pa[1] - pa_slope[1] * width/2, 0],
            [joint[0] - pa_slope[0] * width/2, joint[1] - pa_slope[1] * width/2, 0]
        ];

        var pb_slope = Vector.normalize([(pb[1] - joint[1]) * -1, pb[0] - joint[0], 0]);
        var pb_outer = [
            [joint[0] + pb_slope[0] * width/2, joint[1] + pb_slope[1] * width/2, 0],
            [pb[0] + pb_slope[0] * width/2, pb[1] + pb_slope[1] * width/2, 0]
        ];
        var pb_inner = [
            [joint[0] - pb_slope[0] * width/2, joint[1] - pb_slope[1] * width/2, 0],
            [pb[0] - pb_slope[0] * width/2, pb[1] - pb_slope[1] * width/2, 0]
        ];

        // Miter join
        // Solve for the intersection between the two outer line segments
        // http://en.wikipedia.org/wiki/Line-line_intersection
        // http://en.wikipedia.org/wiki/Cramer's_rule
        // a1*x + b1*y = c1 for line (x1, y1) to (x2, y2)
        // a2*x + b2*y = c2 for line (x3, y3) to (x4, y4)
        var a1 = pa_outer[0][1] - pa_outer[1][1]; // y1 - y2
        var b1 = pa_outer[0][0] - pa_outer[1][0]; // x1 - x2
        var a2 = pb_outer[0][1] - pb_outer[1][1]; // y3 - y4
        var b2 = pb_outer[0][0] - pb_outer[1][0]; // x3 - x4
        var c1 = (pa_outer[0][0] * pa_outer[1][1]) - (pa_outer[0][1] * pa_outer[1][0]); // x1*y2 - y1*x2
        var c2 = (pb_outer[0][0] * pb_outer[1][1]) - (pb_outer[0][1] * pb_outer[1][0]); // x3*y4 - y3*x4
        var denom = (b1 * a2) - (a1 * b2);

        // Find the intersection point
        var line_debug = null;
        if (Math.abs(denom) > 0.01) {
            var intersect_outer, intersect_inner;

            intersect_outer = [
                ((c1 * b2) - (b1 * c2)) / denom,
                ((c1 * a2) - (a1 * c2)) / denom
            ];

            // Cap the intersection point to a reasonable distance (as join angle becomes sharper, miter joint distance would approach infinity)
            var len_sq = Vector.lengthSq([intersect_outer[0] - joint[0], intersect_outer[1] - joint[1], 0]);
            var miter_len_max = 3; // multiplier on line width for max distance miter join can be from joint
            if (len_sq > (width * width * miter_len_max * miter_len_max)) {
                line_debug = 'distance';
                intersect_outer = Vector.normalize([intersect_outer[0] - joint[0], intersect_outer[1] - joint[1], 0]);
                intersect_outer = [
                    joint[0] + intersect_outer[0] * miter_len_max,
                    joint[1] + intersect_outer[1] * miter_len_max
                ]
            }

            intersect_inner = [
                (joint[0] - intersect_outer[0]) + joint[0],
                (joint[1] - intersect_outer[1]) + joint[1]
            ];

            vertices.push(
                intersect_inner, intersect_outer, pa_inner[0],
                pa_inner[0], intersect_outer, pa_outer[0],

                pb_inner[1], pb_outer[1], intersect_inner,
                intersect_inner, pb_outer[1], intersect_outer
            );
        }
        else {
            // Line segments are parallel, use the first outer line segment as join instead
            line_debug = 'parallel';
            pa_inner[1] = pb_inner[0];
            pa_outer[1] = pb_outer[0];

            vertices.push(
                pa_inner[1], pa_outer[1], pa_inner[0],
                pa_inner[0], pa_outer[1], pa_outer[0],

                pb_inner[1], pb_outer[1], pb_inner[0],
                pb_inner[0], pb_outer[1], pb_outer[0]
            );
        }

        // Extruded inner/outer edges - debugging
        if (GLRenderer.debug) {
            vertex_lines.push(
                pa_inner[0][0], pa_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pa_inner[1][0], pa_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pb_inner[0][0], pb_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pb_inner[1][0], pb_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pa_outer[0][0], pa_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pa_outer[1][0], pa_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pb_outer[0][0], pb_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pb_outer[1][0], pb_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pa_inner[0][0], pa_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pa_outer[0][0], pa_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pa_inner[1][0], pa_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pa_outer[1][0], pa_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pb_inner[0][0], pb_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pb_outer[0][0], pb_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pb_inner[1][0], pb_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pb_outer[1][0], pb_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0
            );
        }

        if (GLRenderer.debug && line_debug) {
            var dcolor;
            if (line_debug == 'parallel') {
                // console.log("!!! lines are parallel !!!");
                dcolor = [0, 1, 0];
            }
            else if (line_debug == 'distance') {
                // console.log("!!! miter intersection point exceeded allowed distance from joint !!!");
                dcolor = [1, 0, 0];
            }
            // console.log('OSM id: ' + feature.id); // TODO: if this function is moved out of a closure, this feature debug info won't be available
            // console.log([pa, joint, pb]);
            // console.log(feature);
            vertex_lines.push(
                pa[0], pa[1], z + 0.002,
                0, 0, 1, dcolor[0], dcolor[1], dcolor[2],
                joint[0], joint[1], z + 0.002,
                0, 0, 1, dcolor[0], dcolor[1], dcolor[2],
                joint[0], joint[1], z + 0.002,
                0, 0, 1, dcolor[0], dcolor[1], dcolor[2],
                pb[0], pb[1], z + 0.002,
                0, 0, 1, dcolor[0], dcolor[1], dcolor[2]
            );

            var num_lines = lines.length;
            for (var ln=0; ln < num_lines; ln++) {
                var line2 = lines[ln];

                for (var p=0; p < line2.length - 1; p++) {
                    // Point A to B
                    var pa = line2[p];
                    var pb = line2[p+1];

                    vertex_lines.push(
                        pa[0], pa[1], z + 0.0005,
                        0, 0, 1, 0, 0, 1.0,
                        pb[0], pb[1], z + 0.0005,
                        0, 0, 1, 0, 0, 1.0
                    );
                }
            };
        }
    }

    return vertex_data;
};

// Build native GL lines for a polyline
GLRenderer.prototype.buildLines = function GLRendererBuildLines (lines, feature, layer, style, tile, vertex_data, options)
{
    options = options || {};
    options.z_offset = options.z_offset || 0;

    var z = layer.number / 16;
    z += (1 - (1 / (tile.feature_count + 1))) / 16;
    z += options.z_offset;

    var color = (style.color && (style.color[feature.properties.kind] || style.color.default)) || [1.0, 0, 0];
    if (typeof color == 'function') { // dynamic/function-based color
        color = color(feature);
    }

    var width = (style.width && (style.width[feature.properties.kind] || style.width.default)) || 1;
    if (typeof width == 'function') {
        width = width(feature, tile);
    }
    width *= tile.units_per_meter;

    var num_lines = lines.length;
    for (var ln=0; ln < num_lines; ln++) {
        var line = lines[ln];

        for (var p=0; p < line.length - 1; p++) {
            // Point A to B
            var pa = line[p];
            var pb = line[p+1];

            vertex_data.push(
                // Point A
                pa[0],
                pa[1],
                z + 0,
                0, 0, 1, // flat surfaces point straight up
                color[0], color[1], color[2],
                // Point B
                pb[0],
                pb[1],
                z + 0,
                0, 0, 1, // flat surfaces point straight up
                color[0], color[1], color[2]
            );
        }
    };

    return vertex_data;
};

GLRenderer.prototype.addTile = function GLRendererAddTile (tile, tileDiv)
{
    var renderer = this;
    var layer, style;
    var triangles = [];
    var lines = [];

    // Miter join line test pattern
    // if (GLRenderer.debug) {
    //     var min = Point(0, 0); // tile.min;
    //     var max = Point(4096, 4096); // tile.max;
    //     var g = {
    //         id: 123,
    //         geometry: {
    //             type: 'LineString',
    //             coordinates: [
    //                 [min.x * 0.75 + max.x * 0.25, min.y * 0.75 + max.y * 0.25],
    //                 [min.x * 0.75 + max.x * 0.25, min.y * 0.5 + max.y * 0.5],
    //                 [min.x * 0.25 + max.x * 0.75, min.y * 0.75 + max.y * 0.25],
    //                 [min.x * 0.25 + max.x * 0.75, min.y * 0.25 + max.y * 0.75],
    //                 [min.x * 0.4 + max.x * 0.6, min.y * 0.5 + max.y * 0.5],
    //                 [min.x * 0.5 + max.x * 0.5, min.y * 0.25 + max.y * 0.75],
    //                 [min.x * 0.75 + max.x * 0.25, min.y * 0.25 + max.y * 0.75],
    //                 [min.x * 0.75 + max.x * 0.25, min.y * 0.4 + max.y * 0.6]
    //             ]
    //         },
    //         properties: {
    //             kind: 'debug'
    //         }
    //     };
    //     // console.log(g.geometry.coordinates);
    //     tile.layers['buildings'].features.push(g);
    // }

    // Build raw geometry arrays
    tile.feature_count = 0;
    for (var ln=0; ln < this.layers.length; ln++) {
        layer = this.layers[ln];
        style = this.styles[layer.name] || {};

        if (tile.layers[layer.name] != null) {
            var num_features = tile.layers[layer.name].features.length;
            for (var f=0; f < num_features; f++) {
                var feature = tile.layers[layer.name].features[f];

                if (feature.geometry.type == 'Polygon') {
                    renderer.buildPolygons([feature.geometry.coordinates], feature, layer, style, tile, triangles);
                    // renderer.buildPolylines(feature.geometry.coordinates, feature, layer, { color: { default: [1, 0, 0] /*[Math.random(), Math.random(), Math.random()]*/ }, width: { default: function (f, t) { return Style.width.pixels(2, f, t); } } }, tile, triangles, lines, { z_offset: 0.01, closed_polygon: true, remove_tile_edges: true });
                }
                else if (feature.geometry.type == 'MultiPolygon') {
                    renderer.buildPolygons(feature.geometry.coordinates, feature, layer, style, tile, triangles);
                    // for (var mpc=0; mpc < feature.geometry.coordinates.length; mpc++) {
                    //     renderer.buildPolylines(feature.geometry.coordinates[mpc], feature, layer, { color: { default: [1, 0, 0] [Math.random(), Math.random(), Math.random()] }, width: { default: function (f, t) { return Style.width.pixels(2, f, t); } } }, tile, triangles, lines, { z_offset: 0.01, closed_polygon: true, remove_tile_edges: true });
                    // }
                }
                else if (feature.geometry.type == 'LineString') {
                    // renderer.buildLines([feature.geometry.coordinates], feature, layer, style, tile, lines);
                    renderer.buildPolylines([feature.geometry.coordinates], feature, layer, style, tile, triangles, lines);
                }
                else if (feature.geometry.type == 'MultiLineString') {
                    // renderer.buildLines(feature.geometry.coordinates, feature, layer, style, tile, lines);
                    renderer.buildPolylines(feature.geometry.coordinates, feature, layer, style, tile, triangles, lines);
                }

                tile.feature_count++;
            }
        }
    }

    // Create GL geometry objects
    tile.gl_geometry = [];
    if (triangles.length > 0) {
        tile.gl_geometry.push(new GLTriangles(this.gl, this.program, new Float32Array(triangles)));
    }
    if (lines.length > 0) {
        tile.gl_geometry.push(new GLLines(this.gl, this.program, new Float32Array(lines), { line_width: 1 /*5 / Geo.meters_per_pixel[Math.floor(this.zoom)]*/ }));
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

// Tests if a line segment (from point A to B) is nearly coincident with the edge of a tile
GLRenderer.prototype.isOnTileEdge = function (pa, pb, options)
{
    options = options || {};

    var tolerance_function = options.tolerance_function || GLRenderer.valuesWithinTolerance;
    var tolerance = options.tolerance || 1; // tweak this adjust if catching too few/many line segments near tile edges
    var tile_min = Point(0, 0);
    var tile_max = Point(this.tile_scale, -this.tile_scale);
    var edge = null;

    if (tolerance_function(pa[0], tile_min.x, tolerance) && tolerance_function(pb[0], tile_min.x, tolerance)) {
        edge = 'left';
    }
    else if (tolerance_function(pa[0], tile_max.x, tolerance) && tolerance_function(pb[0], tile_max.x, tolerance)) {
        edge = 'right';
    }
    else if (tolerance_function(pa[1], tile_min.y, tolerance) && tolerance_function(pb[1], tile_min.y, tolerance)) {
        edge = 'top';
    }
    else if (tolerance_function(pa[1], tile_max.y, tolerance) && tolerance_function(pb[1], tile_max.y, tolerance)) {
        edge = 'bottom';
    }
    return edge;
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
    center = Geo.latLngToMeters(Point(center.lng, center.lat));
    gl.uniform2f(gl.getUniformLocation(this.program, 'map_center'), center.x, center.y);
    gl.uniform1f(gl.getUniformLocation(this.program, 'map_zoom'), this.zoom);
    // gl.uniform1f(gl.getUniformLocation(this.program, 'map_zoom'), Math.floor(this.zoom) + (Math.log((this.zoom % 1) + 1) / Math.LN2)); // scale fractional zoom by log

    var meters_per_pixel = Geo.min_zoom_meters_per_pixel / Math.pow(2, this.zoom);
    var meter_zoom = Point(gl.canvas.width / 2 * meters_per_pixel, gl.canvas.height / 2 * meters_per_pixel);
    gl.uniform2f(gl.getUniformLocation(this.program, 'meter_zoom'), meter_zoom.x, meter_zoom.y);

    gl.uniform1f(gl.getUniformLocation(this.program, 'tile_scale'), this.tile_scale);

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

/* Utility functions */

GLRenderer.valuesWithinTolerance = function (a, b, tolerance)
{
    tolerance = tolerance || 1;
    return (Math.abs(a - b) < tolerance);
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
