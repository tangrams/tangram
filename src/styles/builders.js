// Geometry building functions

import {Vector} from '../vector';
import Geo from '../geo';

import earcut from 'earcut';

var Builders;
export default Builders = {};

Builders.debug = false;

// Re-scale UVs from [0, 1] range to a smaller area within the image
Builders.scaleTexcoordsToSprite = function (uv, area_origin, area_size, tex_size) {
    var area_origin_y = tex_size[1] - area_origin[1] - area_size[1];
    var suv = [];
    suv[0] = (uv[0] * area_size[0] + area_origin[0]) / tex_size[0];
    suv[1] = (uv[1] * area_size[1] + area_origin_y) / tex_size[1];
    return suv;
};

Builders.getTexcoordsForSprite = function (area_origin, area_size, tex_size) {
    return [
        Builders.scaleTexcoordsToSprite([0, 0], area_origin, area_size, tex_size),
        Builders.scaleTexcoordsToSprite([1, 1], area_origin, area_size, tex_size)
    ];
};

// Tesselate a flat 2D polygon
// x & y coordinates will be set as first two elements of provided vertex_template
Builders.buildPolygons = function (
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
        var vertices = Builders.triangulatePolygon(polygon);

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
Builders.buildExtrudedPolygons = function (
    polygons,
    z, height, min_height,
    vertex_data, vertex_template,
    normal_index,
    { texcoord_index, texcoord_scale }) {

    // Top
    var min_z = z + (min_height || 0);
    var max_z = z + height;
    vertex_template[2] = max_z;
    Builders.buildPolygons(polygons, vertex_data, vertex_template, { texcoord_index });

    // Walls
    // Fit UVs to wall quad
    var [[min_u, min_v], [max_u, max_v]] = texcoord_scale || [[0, 0], [1, 1]];
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
Builders.buildPolylines = function (
    lines,
    width,
    vertex_data, vertex_template,
    {
        closed_polygon,
        remove_tile_edges,
        tile_edge_tolerance,
        texcoord_index,
        texcoord_scale,
        scaling_index,
        join, cap
    }) {

    var cornersOnCap = (cap === "square")? 2 : ((cap === "round")? 4 : 0);  // Butt is the implicit default
    var trianglesOnJoin = (join === "bevel")? 1 : ((join === "round")? 5 : 0);  // Miter is the implicit default

    // Build variables
    var [[min_u, min_v], [max_u, max_v]] = texcoord_scale || [[0, 0], [1, 1]];

    // Values that are constant for each line and are passed to helper functions
    var constants = {
        vertex_data,
        vertex_template,
        halfWidth: width/2,
        vertices: [],
        scaling_index,
        scalingVecs: scaling_index && [],
        texcoord_index,
        texcoords: texcoord_index && [],
        min_u, min_v, max_u, max_v,
        nPairs: 0
    };

    for (var ln = 0; ln < lines.length; ln++) {
        var line = lines[ln];
        var lineSize = line.length;

        // Ignore non-lines
        if (lineSize < 2) {
            continue;
        }

        //  Initialize variables
        var coordPrev = [0, 0], // Previous point coordinates
            coordCurr = [0, 0], // Current point coordinates
            coordNext = [0, 0]; // Next point coordinates

        var normPrev = [0, 0],  // Right normal to segment between previous and current m_points
            normCurr = [0, 0],  // Right normal at current point, scaled for miter joint
            normNext = [0, 0];  // Right normal to segment between current and next m_points

        var isPrev = false,
            isNext = true;

        // Add vertices to buffer acording their index
        indexPairs(constants);

        // Do this with the rest (except the last one)
        for (let i = 0; i < lineSize ; i++) {

            // There is a next one?
            isNext = i+1 < lineSize;

            if (isPrev) {
                // If there is a previus one, copy the current (previous) values on *Prev
                coordPrev = coordCurr;
                normPrev = Vector.normalize(Vector.perp(coordPrev, line[i]));
            } else if (i === 0 && closed_polygon === true) {
                // If is the first point and is a close polygon

                var needToClose = true;
                if (remove_tile_edges) {
                    if(Builders.isOnTileEdge(line[i], line[lineSize-2], { tile_edge_tolerance })) {
                        needToClose = false;
                    }
                }

                if (needToClose) {
                    coordPrev = line[lineSize-2];
                    normPrev = Vector.normalize(Vector.perp(coordPrev, line[i]));
                    isPrev = true;
                }
            }

            // Assign current coordinate
            coordCurr = line[i];

            if (isNext) {
                coordNext = line[i+1];
            } else if (closed_polygon === true) {
                // If is the last point a close polygon
                coordNext = line[1];
                isNext = true;
            }

            if (isNext) {
                // If is not the last one get next coordinates and calculate the right normal

                normNext = Vector.normalize(Vector.perp(coordCurr, coordNext));
                if (remove_tile_edges) {
                    if (Builders.isOnTileEdge(coordCurr, coordNext, { tile_edge_tolerance })) {
                        normCurr = Vector.normalize(Vector.perp(coordPrev, coordCurr));
                        if (isPrev) {
                            addVertexPair(coordCurr, normCurr, i/lineSize, constants);
                            constants.nPairs++;

                            // Add vertices to buffer acording their index
                            indexPairs(constants);
                        }
                        isPrev = false;
                        continue;
                    }
                }
            }

            //  Compute current normal
            if (isPrev) {
                //  If there is a PREVIUS ...
                if (isNext) {
                    // ... and a NEXT ONE, compute previus and next normals (scaled by the angle with the last prev)
                    normCurr = Vector.normalize(Vector.add(normPrev, normNext));
                    var scale = 2 / (1 + Math.abs(Vector.dot(normPrev, normCurr)));
                    normCurr = Vector.mult(normCurr,scale*scale);
                } else {
                    // ... and there is NOT a NEXT ONE, copy the previus next one (which is the current one)
                    normCurr = Vector.normalize(Vector.perp(coordPrev, coordCurr));
                }
            } else {
                // If is NOT a PREVIUS ...
                if (isNext) {
                    // ... and a NEXT ONE,
                    normNext = Vector.normalize(Vector.perp(coordCurr, coordNext));
                    normCurr = normNext;
                } else {
                    // ... and NOT a NEXT ONE, nothing to do (without prev or next one this is just a point)
                    continue;
                }
            }

            if (isPrev || isNext) {
                // If is the BEGINING of a LINE
                if (i === 0 && !isPrev && !closed_polygon) {
                    addCap(coordCurr, normCurr, cornersOnCap, true, constants);
                }

                // If is a JOIN
                if(trianglesOnJoin !== 0 && isPrev && isNext) {
                    addJoin([coordPrev, coordCurr, coordNext],
                            [normPrev,normCurr, normNext],
                            i/lineSize, trianglesOnJoin,
                            constants);
                } else {
                    addVertexPair(coordCurr, normCurr, i/(lineSize-1), constants);
                }

                if (isNext) {
                   constants.nPairs++;
                }

                isPrev = true;
            }
        }

        // Add vertices to buffer acording their index
        indexPairs(constants);

         // If is the END OF a LINE
        if(!closed_polygon) {
            addCap(coordCurr, normCurr, cornersOnCap , false, constants);
        }
    }
};

// Add to equidistant pairs of vertices (internal method for polyline builder)
function addVertex(coord, normal, uv, { halfWidth, vertices, scalingVecs, texcoords }) {
    if (scalingVecs) {
        //  a. If scaling is on add the vertex (the currCoord) and the scaling Vecs (normals pointing where to extrude the vertexes)
        vertices.push(coord);
        scalingVecs.push(normal);
    } else {
        //  b. Add the extruded vertexes
        vertices.push([coord[0] + normal[0] * halfWidth,
                       coord[1] + normal[1] * halfWidth]);
    }

    // c) Add uv's if they are enable
    if (texcoords) {
        texcoords.push(uv);
    }
}

//  Add to equidistant pairs of vertices (internal method for polyline builder)
function addVertexPair (coord, normal, v_pct, constants) {
    addVertex(coord, normal, [constants.max_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v], constants);
    addVertex(coord, Vector.neg(normal), [constants.min_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v], constants);
}

//  Tessalate a FAN geometry between points A       B
//  using their normals from a center        \ . . /
//  and interpolating their UVs               \ p /
//                                             \./
//                                              C
function addFan (coord, nA, nC, nB, uA, uC, uB, signed, numTriangles, constants) {

    if (numTriangles < 1) {
        return;
    }

    // Add previus vertices to buffer and clean the buffers and index pairs
    // Because we are going to add more triangles.
    indexPairs(constants);

    var normCurr = Vector.set(nA);
    var normPrev = [0,0];

    var angle_delta = Vector.dot(nA, nB);
    if (angle_delta < -1) {
        angle_delta = -1;
    }
    angle_delta = Math.acos(angle_delta)/numTriangles;

    if (!signed) {
        angle_delta *= -1;
    }

    var uvCurr = Vector.set(uA);
    var uv_delta = Vector.div(Vector.sub(uB,uA), numTriangles);

    //  Add the first and CENTER vertex
    //  The triangles will be composed on FAN style arround it
    addVertex(coord, nC, uC, constants);

    //  Add first corner
    addVertex(coord, normCurr, uA, constants);

    // Iterate through the rest of the coorners
    for (var t = 0; t < numTriangles; t++) {
        normPrev = Vector.normalize(normCurr);
        normCurr = Vector.rot( Vector.normalize(normCurr), angle_delta);     //  Rotate the extrusion normal

        if (numTriangles === 4 && (t === 0 || t === numTriangles - 2)) {
            var scale = 2 / (1 + Math.abs(Vector.dot(normPrev, normCurr)));
            normCurr = Vector.mult(normCurr, scale*scale);
        }

        uvCurr = Vector.add(uvCurr,uv_delta);

        addVertex(coord, normCurr, uvCurr, constants);      //  Add computed corner
    }

    for (var i = 0; i < numTriangles; i++) {
        if (signed) {
            addIndex(i+2, constants);
            addIndex(0, constants);
            addIndex(i+1, constants);
        } else {
            addIndex(i+1, constants);
            addIndex(0, constants);
            addIndex(i+2, constants);
        }
    }

    // Clean the buffer
    constants.vertices = [];
    if (constants.scalingVecs) {
        constants.scalingVecs = [];
    }
    if (constants.texcoords) {
        constants.texcoords = [];
    }
}

//  Add speccials joins (not miter) tipes that require FAN tessalations
//  Using this ( http://www.codeproject.com/Articles/226569/Drawing-polylines-by-tessellation ) as reference
function addJoin (coords, normals, v_pct, nTriangles, constants) {

    var T = [Vector.set(normals[0]), Vector.set(normals[1]), Vector.set(normals[2])];
    var signed = Vector.signed_area(coords[0], coords[1], coords[2]) > 0;

    var nA = T[0],              // normal to point A (aT)
        nC = Vector.neg(T[1]),  // normal to center (-vP)
        nB = T[2];              // normal to point B (bT)

    var uA = [constants.max_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v],
        uC = [constants.min_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v],
        uB = [constants.max_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v];

    if (signed) {
        addVertex(coords[1], nA, uA, constants);
        addVertex(coords[1], nC, uC, constants);
    } else {
        nA = Vector.neg(T[0]);
        nC = T[1];
        nB = Vector.neg(T[2]);
        uA = [constants.min_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v];
        uC = [constants.max_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v];
        uB = [constants.min_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v];
        addVertex(coords[1], nC, uC, constants);
        addVertex(coords[1], nA, uA, constants);
    }

    addFan(coords[1], nA, nC, nB, uA, uC, uB, signed, nTriangles, constants);

    if (signed) {
        addVertex(coords[1], nB, uB, constants);
        addVertex(coords[1], nC, uC, constants);
    } else {
        addVertex(coords[1], nC, uC, constants);
        addVertex(coords[1], nB, uB, constants);
    }
}

//  Function to add the vertex need for line caps,
//  because re-use the buffers needs to be at the end
function addCap (coord, normal, numCorners, isBeginning, constants) {

    if (numCorners < 1) {
        return;
    }

    // UVs
    var uvA = [constants.min_u,constants.min_v],                        // Begining angle UVs
        uvC = [constants.min_u+(constants.max_u-constants.min_u)/2, constants.min_v],   // center point UVs
        uvB = [constants.max_u,constants.min_v];                        // Ending angle UVs

    if (!isBeginning) {
        uvA = [constants.min_u,constants.max_v],                        // Begining angle UVs
        uvC = [constants.min_u+(constants.max_u-constants.min_u)/2, constants.max_v],   // center point UVs
        uvB = [constants.max_u,constants.max_v];
    }

    addFan( coord,
            Vector.neg(normal), [0, 0], normal,
            uvA, uvC, uvB,
            isBeginning, numCorners*2, constants);
}

// Add a vertex based on the index position into the VBO (internal method for polyline builder)
function addIndex (index, { vertex_data, vertex_template, halfWidth, vertices, scaling_index, scalingVecs, texcoord_index, texcoords }) {
    // Prevent access to undefined vertices
    if (index >= vertices.length) {
        return;
    }

    // set vertex position
    vertex_template[0] = vertices[index][0];
    vertex_template[1] = vertices[index][1];

    // set UVs
    if (texcoord_index) {
        vertex_template[texcoord_index + 0] = texcoords[index][0];
        vertex_template[texcoord_index + 1] = texcoords[index][1];
    }

    // set Scaling vertex (X, Y normal direction + Z haltwidth as attribute)
    if (scaling_index) {
        vertex_template[scaling_index + 0] = scalingVecs[index][0];
        vertex_template[scaling_index + 1] = scalingVecs[index][1];
        vertex_template[scaling_index + 2] = halfWidth;
    }

    //  Add vertex to VBO
    vertex_data.addVertex(vertex_template);
}

// Add the index vertex to the VBO and clean the buffers
function indexPairs (constants) {
    // Add vertices to buffer acording their index
    for (var i = 0; i < constants.nPairs; i++) {
        addIndex(2*i+2, constants);
        addIndex(2*i+1, constants);
        addIndex(2*i+0, constants);

        addIndex(2*i+2, constants);
        addIndex(2*i+3, constants);
        addIndex(2*i+1, constants);
    }

    constants.nPairs = 0;

    // Clean the buffer
    constants.vertices = [];
    if (constants.scalingVecs) {
        constants.scalingVecs = [];
    }
    if (constants.texcoords) {
        constants.texcoords = [];
    }
}

// Build a quad centered on a point
Builders.buildQuadsForPoints = function (
    points, width, height,
    vertex_data, vertex_template,
    { texcoord_index, texcoord_scale }) {

    if (texcoord_index) {
        var [[min_u, min_v], [max_u, max_v]] = texcoord_scale || [[0, 0], [1, 1]];
        var texcoords = [
            [min_u, min_v],
            [max_u, min_v],
            [max_u, max_v],

            [min_u, min_v],
            [max_u, max_v],
            [min_u, max_v]
        ];
    }

    var num_points = points.length;
    for (var p=0; p < num_points; p++) {
        var point = points[p];

        var positions = [
            [point[0] - width/2, point[1] - height/2],
            [point[0] + width/2, point[1] - height/2],
            [point[0] + width/2, point[1] + height/2],

            [point[0] - width/2, point[1] - height/2],
            [point[0] + width/2, point[1] + height/2],
            [point[0] - width/2, point[1] + height/2]
        ];

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

// Triangulation using earcut
// https://github.com/mapbox/earcut
Builders.triangulatePolygon = function (contours)
{
    return earcut(contours);
};

// Tests if a line segment (from point A to B) is nearly coincident with the edge of a tile
Builders.isOnTileEdge = function (pa, pb, options) {
    options = options || {};

    var tolerance_function = options.tolerance_function || Builders.valuesWithinTolerance;
    var tolerance = options.tolerance || 3; // tweak this adjust if catching too few/many line segments near tile edges
                                            // TODO: make tolerance configurable by source if necessary
    var tile_min = Builders.tile_bounds[0];
    var tile_max = Builders.tile_bounds[1];
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

Builders.setTileScale = function (scale) {
    Builders.tile_bounds = [
        { x: 0, y: 0},
        { x: scale, y: -scale } // TODO: correct for flipped y-axis?
    ];
};

Builders.valuesWithinTolerance = function (a, b, tolerance) {
    tolerance = tolerance || 1;
    return (Math.abs(a - b) < tolerance);
};

// Build a zigzag line pattern for testing joins and caps
Builders.buildZigzagLineTestPattern = function () {
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
