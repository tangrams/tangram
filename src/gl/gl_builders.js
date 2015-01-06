import {Vector} from '../vector';
import {Geo} from '../geo';
import {GL} from './gl';
export var GLBuilders = {};

GLBuilders.debug = false;

// Re-scale UVs from [0, 1] range to a smaller area within the image
GLBuilders.scaleTexcoordsToSprite = function (uv, area_origin, area_size, tex_size) {
    var area_origin_y = tex_size[1] - area_origin[1] - area_size[1];
    var suv = [];
    suv[0] = (uv[0] * area_size[0] + area_origin[0]) / tex_size[0];
    suv[1] = (uv[1] * area_size[1] + area_origin_y) / tex_size[1];
    return suv;
};

// Tesselate a flat 2D polygon
// x & y coordinates will be set as first two elements of provided vertex_template
GLBuilders.buildPolygons = function (
    polygons,
    vertex_data, vertex_template,
    { texcoord_index, texcoord_scale }) {

    var [[min_u, min_v], [max_u, max_v]] = texcoord_scale || [[0, 0], [1, 1]];
    var num_polygons = polygons.length;
    for (var p=0; p < num_polygons; p++) {
        var polygon = polygons[p];

        // Find polygon extents to calculate UVs, fit them to the axis-aligned bounding box
        if (texcoord_index) {
            var [min_x, min_y, max_x, max_y] = Geo.findBoundingBox(polygon);
            var span_x = max_x - min_x;
            var span_y = max_y - min_y;
            var scale_u = (max_u - min_u) / span_x;
            var scale_v = (max_v - min_v) / span_y;
        }

        // Tessellate
        var vertices = GL.triangulatePolygon(polygon);

        // Add vertex data
        var num_vertices = vertices.length;
        for (var v=0; v < num_vertices; v++) {
            var vertex = vertices[v];
            vertex_template[0] = vertex[0];
            vertex_template[1] = vertex[1];

            // Add UVs
            if (texcoord_index) {
                vertex_template[texcoord_index + 0] = (vertex[0] - min_x) * scale_u + min_u;
                vertex_template[texcoord_index + 1] = (vertex[1] - min_y) * scale_v + min_v;
            }

            vertex_data.addVertex(vertex_template);
        }
    }
};

// Tesselate and extrude a flat 2D polygon into a simple 3D model with fixed height and add to GL vertex buffer
GLBuilders.buildExtrudedPolygons = function (
    polygons,
    z, height, min_height,
    vertex_data, vertex_template,
    normal_index,
    { texcoord_index, texcoord_scale }) {

    var min_z = z + (min_height || 0);
    var max_z = z + height;
    var [[min_u, min_v], [max_u, max_v]] = texcoord_scale || [[0, 0], [1, 1]];

    // Top
    vertex_template[2] = max_z;
    GLBuilders.buildPolygons(polygons, vertex_data, vertex_template, { texcoord_index });

    // Walls
    var num_polygons = polygons.length;
    for (var p=0; p < num_polygons; p++) {
        var polygon = polygons[p];

        for (var q=0; q < polygon.length; q++) {
            var contour = polygon[q];

            for (var w=0; w < contour.length - 1; w++) {
                // Two triangles for the quad formed by each vertex pair, going from bottom to top height
                var wall_vertices = [
                    // Triangle
                    [contour[w+1][0], contour[w+1][1], max_z],
                    [contour[w+1][0], contour[w+1][1], min_z],
                    [contour[w][0], contour[w][1], min_z],
                    // Triangle
                    [contour[w][0], contour[w][1], min_z],
                    [contour[w][0], contour[w][1], max_z],
                    [contour[w+1][0], contour[w+1][1], max_z]
                ];

                // Fit UVs to wall quad
                if (texcoord_index) {
                    var texcoords = [
                        [min_u, max_v],
                        [min_u, min_v],
                        [max_u, min_v],

                        [max_u, min_v],
                        [max_u, max_v],
                        [min_u, max_v]
                    ];
                }

                // Calc the normal of the wall from up vector and one segment of the wall triangles
                var normal = Vector.cross(
                    [0, 0, 1],
                    Vector.normalize([contour[w+1][0] - contour[w][0], contour[w+1][1] - contour[w][1], 0])
                );

                // Update vertex template with current surface normal
                vertex_template[normal_index + 0] = normal[0];
                vertex_template[normal_index + 1] = normal[1];
                vertex_template[normal_index + 2] = normal[2];

                for (var wv=0; wv < wall_vertices.length; wv++) {
                    vertex_template[0] = wall_vertices[wv][0];
                    vertex_template[1] = wall_vertices[wv][1];
                    vertex_template[2] = wall_vertices[wv][2];

                    if (texcoord_index) {
                        vertex_template[texcoord_index + 0] = texcoords[wv][0];
                        vertex_template[texcoord_index + 1] = texcoords[wv][1];
                    }

                    vertex_data.addVertex(vertex_template);
                }
            }
        }
    }
};

// Build tessellated triangles for a polyline
// Basically following the method described here for miter joints:
// http://artgrammer.blogspot.co.uk/2011/07/drawing-polylines-by-tessellation.html
GLBuilders.buildPolylines = function (
    lines,
    z, width,
    vertex_data, vertex_template,
    {
        closed_polygon,
        remove_tile_edges,
        texcoord_index,
        texcoord_scale,
        scaling_index
    }) {

    // Build variables
    var vertices = [],
        scalingVecs = [],   //  vertices directions for then (on GLSL vertex shader) extrude
        texcoords = [],
        halfWidth = width/2,
        num_lines = lines.length,
        i = 0;
    var vertexData_Offset = vertex_data.length;
    var [[min_u, min_v], [max_u, max_v]] = texcoord_scale || [[0, 0], [1, 1]];

    for (var ln = 0; ln < num_lines; ln++) {
        var line = lines[ln];
        var lineSize = line.length;

        if (lineSize < 2) {
            continue;
        }

        //  Initialize variables
        var normPrevCurr = [0.0,0.0,0.0],  // Right normal to segment between previous and current m_points
            normCurrNext = [0.0,0.0,0.0],  // Right normal to segment between current and next m_points
            rightNorm = [0.0,0.0,0.0];     // Right "normal" at current point, scaled for miter joint

        var prevCoord = [], // Previous point coordinates
            currCoord = [], // Current point coordinates
            nextCoord = []; // Next point coordinates

        //  Compute first pair of vertexes based on the second point of the line
        currCoord = Vector.set( line[0] );
        nextCoord = Vector.set( line[1] );

        //  a) Get perpendicular of the vector between first and second point
        normCurrNext = Vector.normalize( Vector.perp( currCoord, nextCoord ) );
        rightNorm = normCurrNext;

        //  b) add the pair vertex into the vertex buffer
        if (scaling_index) {
            //  b.a If scaling is on add the vertex (the currCoord) and the scaling Vecs (normals pointing where to extrude the vertexes)
            vertices.push(currCoord);
            vertices.push(currCoord);
            scalingVecs.push( rightNorm );
            scalingVecs.push( Vector.neg(rightNorm) );
        } else {
            //  b.b Add the extruded vertexes
            vertices.push([ currCoord[0] + rightNorm[0] * halfWidth,
                            currCoord[1] + rightNorm[1] * halfWidth ]);
            vertices.push([ currCoord[0] - rightNorm[0] * halfWidth,
                            currCoord[1] - rightNorm[1] * halfWidth ]);
        }

        // c) Add uv's if they are enable
        if (texcoord_index) {
            texcoords.push( [max_u, min_v], [min_u, min_v] );
        }

        // Do this with the rest (except the last one)
        for(i = 1; i < lineSize - 1 ; i++){
            prevCoord = currCoord;
            currCoord = nextCoord;
            nextCoord = line[i+1];

            //  a) Store prev normal and compute the next one
            normPrevCurr = normCurrNext;
            normCurrNext = Vector.normalize( Vector.perp( currCoord, nextCoord ) );
            rightNorm = Vector.normalize( Vector.add(normPrevCurr, normCurrNext) );

            var scale = Math.sqrt(2 / (1 + Vector.dot(normPrevCurr,normCurrNext)));
            rightNorm = Vector.mult(rightNorm,scale);

            //  b) add the current pair vertex into the vertex buffer
            if (scaling_index) {
                vertices.push(currCoord);
                vertices.push(currCoord);
                scalingVecs.push( rightNorm );
                scalingVecs.push( Vector.neg(rightNorm) );
            } else {
                vertices.push([ currCoord[0] + rightNorm[0] * halfWidth,
                                currCoord[1] + rightNorm[1] * halfWidth ]);
                vertices.push([ currCoord[0] - rightNorm[0] * halfWidth,
                                currCoord[1] - rightNorm[1] * halfWidth ]);
            }

            // c) Add uv's if they are enable
            if (texcoord_index) {
                var frac = i/lineSize;
                texcoords.push( [max_u, min_v+frac*max_v],
                                [min_u, min_v+frac*max_v] );
            }
        }

        rightNorm = Vector.normalize( normCurrNext );

        //  b) add the current pair vertex into the vertex buffer
        if (scaling_index) {
            vertices.push( nextCoord );
            vertices.push( nextCoord );
            scalingVecs.push(rightNorm);
            scalingVecs.push( Vector.neg(rightNorm) );
        } else {
            vertices.push([ nextCoord[0] + rightNorm[0] * halfWidth,
                            nextCoord[1] + rightNorm[1] * halfWidth ]);
            vertices.push([ nextCoord[0] - rightNorm[0] * halfWidth,
                            nextCoord[1] - rightNorm[1] * halfWidth ]);
        }

        // c) Add uv's if they are enable
        if (texcoord_index) {
            texcoords.push( [max_u, max_v],
                            [min_u, max_v] );
        }

        // Build triangles for a single line segment, extruded by the provided width
        function addVertex (index) {
            // Prevent access to undefined vertices
            if (index >= vertices.length) {
                return;
            }

            // set vertex position
            vertex_template[0] = vertices[index][0];
            vertex_template[1] = vertices[index][1];
            // vertex_template[2] = vertices[v][2]; // What happend with Z ??

            // set UVs
            if (texcoord_index) {
                vertex_template[texcoord_index + 0] = texcoords[index][0];
                vertex_template[texcoord_index + 1] = texcoords[index][1];
            }

            // set Scaling vertex ( X,Y normal direction + Z haltwidth as attribute )
            if (scaling_index) {
                vertex_template[scaling_index + 0] = scalingVecs[index][0];
                vertex_template[scaling_index + 1] = scalingVecs[index][1];
                vertex_template[scaling_index + 2] = halfWidth;
            }

            //  Add vertex to VBO
            vertex_data.addVertex(vertex_template);
        }

        // Add vertices to buffer
        if (lineSize >= 2) {
            for (i = 0; i < lineSize - 1; i++) {
                addVertex(2*i+2);
                addVertex(2*i+1);
                addVertex(2*i+0);

                addVertex(2*i+2);
                addVertex(2*i+3);
                addVertex(2*i+1);
            }
        }

        // // Add triangles indices
        // for (var i = 0; i < lineSize - 1; i++) {
        //     indices_data.push(vertexData_Offset + 2*i+2);
        //     indices_data.push(vertexData_Offset + 2*i+1);
        //     indices_data.push(vertexData_Offset + 2*i);
        //     indices_data.push(vertexData_Offset + 2*i+2);
        //     indices_data.push(vertexData_Offset + 2*i+3);
        //     indices_data.push(vertexData_Offset + 2*i+1);
        // }

        // Clean all
        vertices = [];
        if (scaling_index) {
            scalingVecs = [];
        }
        if (texcoord_index) {
            texcoords = [];
        }
    }
};

// Build a quad centered on a point
GLBuilders.buildQuadsForPoints = function (
    points, width, height,
    vertex_data, vertex_template,
    { texcoord_index, texcoord_scale }) {

    var [[min_u, min_v], [max_u, max_v]] = texcoord_scale || [[0, 0], [1, 1]];
    var num_points = points.length;
    for (var p=0; p < num_points; p++) {
        var point = points[p];

        var positions = [
            [point[0] - width/2, point[1] - height/2],
            [point[0] + width/2, point[1] - height/2],
            [point[0] + width/2, point[1] + height/2],

            [point[0] - width/2, point[1] - height/2],
            [point[0] + width/2, point[1] + height/2],
            [point[0] - width/2, point[1] + height/2],
        ];

        if (texcoord_index) {
            var texcoords = [
                [min_u, min_v],
                [max_u, min_v],
                [max_u, max_v],

                [min_u, min_v],
                [max_u, max_v],
                [min_u, max_v]
            ];
        }

        for (var pos=0; pos < 6; pos++) {
            // Add texcoords
            if (texcoord_index) {
                vertex_template[texcoord_index + 0] = texcoords[pos][0];
                vertex_template[texcoord_index + 1] = texcoords[pos][1];
            }

            vertex_template[0] = positions[pos][0];
            vertex_template[1] = positions[pos][1];
            vertex_data.addVertex(vertex_template);
        }
    }
};

/* Utility functions */

// Tests if a line segment (from point A to B) is nearly coincident with the edge of a tile
GLBuilders.isOnTileEdge = function (pa, pb, options)
{
    options = options || {};

    var tolerance_function = options.tolerance_function || GLBuilders.valuesWithinTolerance;
    var tolerance = options.tolerance || 1; // tweak this adjust if catching too few/many line segments near tile edges
    var tile_min = GLBuilders.tile_bounds[0];
    var tile_max = GLBuilders.tile_bounds[1];
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

GLBuilders.setTileScale = function (scale)
{
    GLBuilders.tile_bounds = [
        { x: 0, y: 0},
        { x: scale, y: -scale } // TODO: correct for flipped y-axis?
    ];
};

GLBuilders.valuesWithinTolerance = function (a, b, tolerance)
{
    tolerance = tolerance || 1;
    return (Math.abs(a - b) < tolerance);
};

// Build a zigzag line pattern for testing joins and caps
GLBuilders.buildZigzagLineTestPattern = function ()
{
    var min = { x: 0, y: 0}; //  tile.min;
    var max = { x: 4096, y: 4096 }; // tile.max;

    var g = {
        id: 123,
        geometry: {
            type: 'LineString',
            coordinates: [
                [min.x * 0.75 + max.x * 0.25, min.y * 0.75 + max.y * 0.25],
                [min.x * 0.75 + max.x * 0.25, min.y * 0.5 + max.y * 0.5],
                [min.x * 0.25 + max.x * 0.75, min.y * 0.75 + max.y * 0.25],
                [min.x * 0.25 + max.x * 0.75, min.y * 0.25 + max.y * 0.75],
                [min.x * 0.4 + max.x * 0.6, min.y * 0.5 + max.y * 0.5],
                [min.x * 0.5 + max.x * 0.5, min.y * 0.25 + max.y * 0.75],
                [min.x * 0.75 + max.x * 0.25, min.y * 0.25 + max.y * 0.75],
                [min.x * 0.75 + max.x * 0.25, min.y * 0.4 + max.y * 0.6]
            ]
        },
        properties: {
            kind: 'debug'
        }
    };
    return g;
};
