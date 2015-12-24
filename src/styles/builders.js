// Geometry building functions

import Vector from '../vector';
import Geo from '../geo';

import earcut from 'earcut';

var Builders;
export default Builders = {};

Builders.debug = false;

Builders.tile_bounds = [
    { x: 0, y: 0},
    { x: Geo.tile_scale, y: -Geo.tile_scale } // TODO: correct for flipped y-axis?
];

Builders.defaultUVs = [0, 0, 1, 1]; // single allocation for default values

// Re-scale UVs from [0, 1] range to a smaller area within the image
Builders.getTexcoordsForSprite = function (area_origin, area_size, tex_size) {
    var area_origin_y = tex_size[1] - area_origin[1] - area_size[1];

    return [
        area_origin[0] / tex_size[0],
        area_origin_y / tex_size[1],
        (area_size[0] + area_origin[0]) / tex_size[0],
        (area_size[1] + area_origin_y) / tex_size[1]
    ];
};

// Tesselate a flat 2D polygon
// x & y coordinates will be set as first two elements of provided vertex_template
Builders.buildPolygons = function (
    polygons,
    vertex_data, vertex_template,
    { texcoord_index, texcoord_scale, texcoord_normalize }) {

    if (texcoord_index) {
        texcoord_normalize = texcoord_normalize || 1;
        var [min_u, min_v, max_u, max_v] = texcoord_scale || Builders.defaultUVs;
    }

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
                vertex_template[texcoord_index + 0] = ((vertex[0] - min_x) * scale_u + min_u) * texcoord_normalize;
                vertex_template[texcoord_index + 1] = ((vertex[1] - min_y) * scale_v + min_v) * texcoord_normalize;
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
    normal_normalize,
    {
        remove_tile_edges,
        tile_edge_tolerance,
        texcoord_index,
        texcoord_scale,
        texcoord_normalize
    }) {

    // Top
    var min_z = z + (min_height || 0);
    var max_z = z + height;
    vertex_template[2] = max_z;
    Builders.buildPolygons(polygons, vertex_data, vertex_template, { texcoord_index, texcoord_scale, texcoord_normalize });

    // Walls
    // Fit UVs to wall quad
    if (texcoord_index) {
        texcoord_normalize = texcoord_normalize || 1;
        var [min_u, min_v, max_u, max_v] = texcoord_scale || Builders.defaultUVs;
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
                if (remove_tile_edges && Builders.isOnTileEdge(contour[w], contour[w+1], { tolerance: tile_edge_tolerance })) {
                    continue; // don't extrude tile edges
                }

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
                vertex_template[normal_index + 0] = normal[0] * normal_normalize;
                vertex_template[normal_index + 1] = normal[1] * normal_normalize;
                vertex_template[normal_index + 2] = normal[2] * normal_normalize;

                for (var wv=0; wv < wall_vertices.length; wv++) {
                    vertex_template[0] = wall_vertices[wv][0];
                    vertex_template[1] = wall_vertices[wv][1];
                    vertex_template[2] = wall_vertices[wv][2];

                    if (texcoord_index) {
                        vertex_template[texcoord_index + 0] = texcoords[wv][0] * texcoord_normalize;
                        vertex_template[texcoord_index + 1] = texcoords[wv][1] * texcoord_normalize;
                    }

                    vertex_data.addVertex(vertex_template);
                }
            }
        }
    }
};

// TODO:
//  - Pre posees the line into segments on not over tile edge 

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
        texcoord_normalize,
        scaling_index,
        scaling_normalize,
        join, cap,
        miter_limit,
        units_per_pixel
    }) {

    // Caps and Joins are coded with the amount of extra triangles
    var cornersOnCap = (cap === "square") ? 2 : ((cap === "round") ? 3 : 0);  // Butt is the implicit default
    var trianglesOnJoin = (join === "bevel") ? 1 : ((join === "round") ? 3 : 0);  // Miter is the implicit default
    var miter_len_max = (miter_limit)? miter_limit : 3; // Miter limit distance

    // Build variables
    texcoord_normalize = texcoord_normalize || 1;
    var [min_u, min_v, max_u, max_v] = texcoord_scale || Builders.defaultUVs;

    // Values that are constant for each line and are passed to helper functions
    var constants = {
        vertex_data,
        vertex_template,
        halfWidth: width/2,
        vertices: [],
        scaling_index,
        scaling_normalize,
        scalingVecs: scaling_index && [],
        texcoord_index,
        texcoords: texcoord_index && [],
        texcoord_normalize,
        min_u, min_v, max_u, max_v,
        nPairs: 0,
        units_per_pixel
    };

    // For each LINE in a MULTI-LINE
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

        // NOTE:
        //      - all this variables are created for each line in a polyline
        //      - memory whise, how expensive is to re allocate this variables over and over?

        // For each LINE SEGMENT in a LINE
        for (let i = 0; i < lineSize ; i++) {

            // PREPARATION OF DATA (prev, current and next vertices)
            // =========================================
            // The algorithm iterates trough the segments of a polyline.
            // First needs to find previus and next vertices to calulate 
            // normals.
            // Also to figurate if need to add extra triangles for caps and joins

            // Assign PREV coordinate
            // ----------------------
            if (isPrev) {
                // If there is a previous one, copy the current (previous) values on *Prev
                coordPrev = coordCurr;
                normPrev = Vector.normalize(Vector.perp(coordPrev, line[i]));
            } else if (i === 0 && closed_polygon === true) {
                // If it's the first point and is a closed polygon
                //  ... see if need to wrap arround by setting the last element on the line
                //      as the previus one.
                var needToClose = true;
                if (remove_tile_edges) {
                    // If the line is over a tile edge and need to be remove skip the wrapping arround
                    if (Builders.isOnTileEdge(line[i], line[lineSize-2], { tolerance: tile_edge_tolerance })) {
                        needToClose = false;
                    }
                }

                if (needToClose) {
                    // If is the case that need to be closed by wrapping around, compute PREV against
                    // the last element on the line
                    coordPrev = line[lineSize-2];
                    normPrev = Vector.normalize(Vector.perp(coordPrev, line[i]));
                    isPrev = true;
                }
            }

            // Assign CURRENT coordinate 
            // ----------------------
            // (not normals yet. Why? Because we don't have enought data about the prev and next vertices)
            coordCurr = line[i];

            // Assign NEXT coordinate
            // ----------------------

            // There is a next one?
            isNext = i+1 < lineSize;

            if (isNext) {
                // If it assign
                coordNext = line[i+1];
            } else if (closed_polygon === true) {
                // If it's the last point in a closed polygon 
                // ... wrap arround by computing againts the second one
                // (why not the first one? Because the first one is the same as the last one)
                coordNext = line[1];
                isNext = true;
            }

            if (isNext) {
                // If it's not the last one get next coordinates and calculate the right normal
                normNext = Vector.normalize(Vector.perp(coordCurr, coordNext));
                if (remove_tile_edges) {
                    if (Builders.isOnTileEdge(coordCurr, coordNext, { tolerance: tile_edge_tolerance })) {
                        normCurr = Vector.normalize(Vector.perp(coordPrev, coordCurr));
                        if (isPrev) {
                            // If arrives to here it have everything it needs so add the vertices
                            addVertexPair(coordCurr, normCurr, i/lineSize, constants);

                            // Every time it adds a pair need to increment the counter
                            constants.nPairs++;

                            // Add vertices to buffer acording their index
                            indexPairs(constants);
                        }
                        isPrev = false;
                        continue;
                    }
                }
            }

            // Now that we have a previus and next is time to... 
            // Compute CURRENT normal
            // ----------------------
            if (isPrev) {
                //  If there is a PREVIOUS ...
                if (isNext) {
                    // ... and a NEXT ONE, compute previous and next normals (scaled by the angle with the last prev)
                    normCurr = Vector.normalize(Vector.add(normPrev, normNext));
                    var scale = 2 / (1 + Math.abs(Vector.dot(normPrev, normCurr)));
                    normCurr = Vector.mult(normCurr,scale*scale);
                } else {
                    // ... and there is NOT a NEXT ONE, copy the previous next one (which is the current one)
                    normCurr = Vector.normalize(Vector.perp(coordPrev, coordCurr));
                }
            } else {
                // If there is NO PREVIOUS ...
                if (isNext) {
                    // ... and a NEXT ONE,
                    normNext = Vector.normalize(Vector.perp(coordCurr, coordNext));
                    normCurr = normNext;
                } else {
                    // ... and NO NEXT ONE, nothing to do (without prev or next one this is just a point)
                    continue;
                }
            }

            //  ADDING DATA ( segments, caps and joins)
            // =========================================
            if (isPrev || isNext) {
                // If it's the BEGINNING of a LINE
                if (i === 0 && !isPrev && !closed_polygon) {
                    addCap(coordCurr, normCurr, cornersOnCap, true, constants);
                }

                var thisJoin = trianglesOnJoin;
                //  Check Miter limit according to
                //  https://github.com/tangrams/tangram/blob/5e7686d477bfc0069656157b3d46ba5bac5aab39/src/gl/gl_builders.js#L309
                var len_sq = Vector.lengthSq(normCurr);
                if (thisJoin === 0 && (len_sq > (miter_len_max * miter_len_max)) ){
                    thisJoin = 1; // add bevel
                }

                // If is a JOIN
                if (thisJoin !== 0 && isPrev && isNext) {
                    addJoin([coordPrev, coordCurr, coordNext],
                            [normPrev,normCurr, normNext],
                            i/lineSize, thisJoin,
                            constants);
                }
                // If is a SEGMENT (or regular join, that means miter)
                else {
                    addVertexPair(coordCurr, normCurr, i/(lineSize-1), constants);
                }

                if (isNext) {
                   constants.nPairs++;
                }

                isPrev = true;
            }
        }

        // Add vertices to buffer according to their index
        indexPairs(constants);

         // If it's the END of a LINE
        if(!closed_polygon) {
            addCap(coordCurr, normCurr, cornersOnCap , false, constants);
        }
    }
};

// Helper function for polyline tesselation
// add two equidistant pairs of vertices (internal method for polyline builder)
function addPolylineVertex(coord, normal, uv, { halfWidth, vertices, scalingVecs, texcoords }) {
    if (scalingVecs) {
        //  a. If scaling is on add the vertex (the currCoord) and the scaling Vecs (normals pointing where to extrude the vertices)
        vertices.push(coord);
        scalingVecs.push(normal);
    } else {
        //  b. Add the extruded vertices
        vertices.push([coord[0] + normal[0] * halfWidth,
                       coord[1] + normal[1] * halfWidth]);
    }

    // c. Add UVs if they are enabled
    if (texcoords) {
        texcoords.push(uv);
    }
}

//  Add two equidistant vertices (internal method for polyline builder)
function addVertexPair (coord, normal, v_pct, constants) {
    addPolylineVertex(coord, normal, [constants.max_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v], constants);
    addPolylineVertex(coord, Vector.neg(normal), [constants.min_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v], constants);
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

    // Add previous vertices to buffer and clear the buffers and index pairs
    // because we are going to add more triangles.
    indexPairs(constants);

    // Initial parameters
    var normCurr = Vector.set(nA);
    var normPrev = [0,0];
    // Calculate the angle between A and B 
    var angle_delta = Vector.angleBetween(nA, nB);

    // If the numbers of triangles is 3 use on rounds caps and joins
    if (numTriangles === 3) {
        // ... if that's the case try to simplify the number of triangles
        var w = constants.halfWidth*2;

        // Core ecuation taked from here (http://slabode.exofire.net/circle_draw.shtml) adapted from circle to what ever angle we have
        var dist = Vector.length(Vector.sub( Vector.mult(nA,w), Vector.mult(nB,w)))/constants.units_per_pixel;
        numTriangles = Math.ceil( (100*Math.sqrt(dist)/360)*angle_delta );
        numTriangles = Math.min(15, Math.max(1,numTriangles));  // Limit the max and min

        // Debug it
        // console.log("Circle: dist:",dist,"angle:",angle_delta, "U/pixel:",constants.units_per_pixel," -> # triangles", numTriangles);

        // If is a cap and have less than 2 triangles skip
        if (angle_delta >= 3.14 && numTriangles < 2) {
            return;
        }
    }
    // Calculate the angle for each triangle
    var angle_step = angle_delta/numTriangles;

    // Joins that turn left or right behave diferently...
    // triangles need to be rotated in diferent directions
    if (!signed) {
        angle_step *= -1;
    }

    // Starting values for UVs
    var uvCurr = Vector.set(uA);
    var uv_delta = Vector.div(Vector.sub(uB,uA), numTriangles);

    //  Add the FIRST and CENTER vertex
    //  The triangles will be composed in a FAN style around it
    addPolylineVertex(coord, nC, uC, constants);

    //  Add first corner
    addPolylineVertex(coord, normCurr, uA, constants);

    // Iterate through the rest of the corners
    for (var t = 0; t < numTriangles; t++) {
        normPrev = Vector.normalize(normCurr);
        normCurr = Vector.rot( Vector.normalize(normCurr), angle_step);     //  Rotate the extrusion normal
        uvCurr = Vector.add(uvCurr,uv_delta);
        addPolylineVertex(coord, normCurr, uvCurr, constants);      //  Add computed corner
    }

    // Index the vertices
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

    // Clear the buffer
    constants.vertices = [];
    if (constants.scalingVecs) {
        constants.scalingVecs = [];
    }
    if (constants.texcoords) {
        constants.texcoords = [];
    }
}

//  Tessalate a SQUARE geometry between A and B     + ........+ 
//  and interpolating their UVs                     : \  2  / : 
//                                                  : 1\   /3 :
//                                                  A -- C -- B                                         
function addSquare (coord, nA, nC, nB, uA, uC, uB, signed, constants) {

    // Add previous vertices to buffer and clear the buffers and index pairs
    // because we are going to add more triangles.
    indexPairs(constants);

    // Initial parameters
    var uvCurr = Vector.set(uA);
    var uv_delta = Vector.div(Vector.sub(uB,uA), 4);
    var normCurr = Vector.set(nA);
    var normPrev = [0,0];

    // First and last cap have different directions
    var angle_step = 0.78539816339; // PI/4 = 45 degrees
    if (!signed) {
        angle_step *= -1;
    }

    //  Add the FIRST and CENTER vertex
    //  The triangles will be add in a FAN style around it
    //
    //                       A -- C
    addPolylineVertex(coord, nC, uC, constants);

    //  Add first corner     +
    //                       :
    //                       A -- C
    addPolylineVertex(coord, normCurr, uA, constants);

    // Iterate through the rest of the coorners completing the triangles
    // (except the corner 1 to save one triangle to be draw )
    for (var t = 0; t < 4; t++) {

        // 0     1     2
        //  + ........+ 
        //  : \     / : 
        //  :  \   /  :
        //  A -- C -- B  3 

        normPrev = Vector.normalize(normCurr);
        normCurr = Vector.rot( Vector.normalize(normCurr), angle_step);     //  Rotate the extrusion normal
        
        if (t === 0 || t === 2) {
            // In order to make this "fan" look like a square the mitters need to be streach
            var scale = 2 / (1 + Math.abs(Vector.dot(normPrev, normCurr)));
            normCurr = Vector.mult(normCurr, scale*scale);
        }

        uvCurr = Vector.add(uvCurr,uv_delta);

        if (t !== 1) {
            //  Add computed corner (except the corner 1)
            addPolylineVertex(coord, normCurr, uvCurr, constants);      
        }
    }

    for (var i = 0; i < 3; i++) {
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

    // Clear the buffer
    constants.vertices = [];
    if (constants.scalingVecs) {
        constants.scalingVecs = [];
    }
    if (constants.texcoords) {
        constants.texcoords = [];
    }
}

//  Add special joins (not miter) types that require FAN tessellations
//  Using http://www.codeproject.com/Articles/226569/Drawing-polylines-by-tessellation as reference
function addJoin (coords, normals, v_pct, nTriangles, constants) {

    var T = [Vector.set(normals[0]), Vector.set(normals[1]), Vector.set(normals[2])];
    var signed = Vector.signed_area(coords[0], coords[1], coords[2]) > 0;

    var nA = T[0],              // normal to point A (aT)
        nC = Vector.neg(T[1]),  // normal to center (-vP)
        nB = T[2];              // normal to point B (bT)

    var uA, uC, uB;

    if (signed) {
        uA = [constants.max_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v],
        uC = [constants.min_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v],
        uB = [constants.max_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v];
        addPolylineVertex(coords[1], nA, uA, constants);
        addPolylineVertex(coords[1], nC, uC, constants);
    } else {
        nA = Vector.neg(T[0]);
        nC = T[1];
        nB = Vector.neg(T[2]);
        uA = [constants.min_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v];
        uC = [constants.max_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v];
        uB = [constants.min_u, (1-v_pct)*constants.min_v + v_pct*constants.max_v];
        addPolylineVertex(coords[1], nC, uC, constants);
        addPolylineVertex(coords[1], nA, uA, constants);
    }

    addFan(coords[1], nA, nC, nB, uA, uC, uB, signed, nTriangles, constants);

    if (signed) {
        addPolylineVertex(coords[1], nB, uB, constants);
        addPolylineVertex(coords[1], nC, uC, constants);
    } else {
        addPolylineVertex(coords[1], nC, uC, constants);
        addPolylineVertex(coords[1], nB, uB, constants);
    }
}

//  Function to add the vertex need for line caps,
//  because re-use the buffers needs to be at the end
function addCap (coord, normal, numCorners, isBeginning, constants) {

    if (numCorners < 1) {
        return;
    }

    // UVs
    var uvA, uvC, uvB;

    if (!isBeginning) {
        uvA = [constants.min_u,constants.max_v],                        // Begining angle UVs
        uvC = [constants.min_u+(constants.max_u-constants.min_u)/2, constants.max_v],   // center point UVs
        uvB = [constants.max_u,constants.max_v];
    } else {
        uvA = [constants.min_u,constants.min_v],                        // Beginning angle UVs
        uvC = [constants.min_u+(constants.max_u-constants.min_u)/2, constants.min_v],   // center point UVs
        uvB = [constants.max_u,constants.min_v];                        // Ending angle UVs
    }

    if ( numCorners === 2 ){
        // If caps are set as squares
        addSquare( coord, 
                   Vector.neg(normal), [0, 0], normal, 
                   uvA, uvC, uvB, 
                   isBeginning, 
                   constants);
    } else {
        // If caps are set as round ( numCorners===3 )
        addFan( coord,
                Vector.neg(normal), [0, 0], normal,
                uvA, uvC, uvB,
                isBeginning, numCorners, constants);
    }
}

// Add a vertex based on the index position into the VBO (internal method for polyline builder)
function addIndex (index, { vertex_data, vertex_template, halfWidth, vertices, scaling_index, scaling_normalize, scalingVecs, texcoord_index, texcoords, texcoord_normalize }) {
    // Prevent access to undefined vertices
    if (index >= vertices.length) {
        return;
    }

    // set vertex position
    vertex_template[0] = vertices[index][0];
    vertex_template[1] = vertices[index][1];

    // set UVs
    if (texcoord_index) {
        vertex_template[texcoord_index + 0] = texcoords[index][0] * texcoord_normalize;
        vertex_template[texcoord_index + 1] = texcoords[index][1] * texcoord_normalize;
    }

    // set Scaling vertex (X, Y normal direction + Z halfwidth as attribute)
    if (scaling_index) {
        vertex_template[scaling_index + 0] = scalingVecs[index][0] * scaling_normalize;
        vertex_template[scaling_index + 1] = scalingVecs[index][1] * scaling_normalize;
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

// Build a billboard sprite quad centered on a point. Sprites are intended to be drawn in screenspace, and have
// properties for width, height, angle, and a scale factor that can be used to interpolate the screenspace size
// of a sprite between two zoom levels.
Builders.buildQuadsForPoints = function (points, vertex_data, vertex_template,
    { texcoord_index, position_index, shape_index, offset_index },
    { quad, quad_scale, offset, angle, texcoord_scale, texcoord_normalize }) {
    let w2 = quad[0] / 2;
    let h2 = quad[1] / 2;
    let scaling = [
        [-w2, -h2],
        [w2, -h2],
        [w2, h2],

        [-w2, -h2],
        [w2, h2],
        [-w2, h2]
    ];

    let texcoords;
    if (texcoord_index) {
        texcoord_normalize = texcoord_normalize || 1;

        var [min_u, min_v, max_u, max_v] = texcoord_scale || Builders.defaultUVs;
        texcoords = [
            [min_u, min_v],
            [max_u, min_v],
            [max_u, max_v],

            [min_u, min_v],
            [max_u, max_v],
            [min_u, max_v]
        ];
    }

    let num_points = points.length;
    for (let p=0; p < num_points; p++) {
        let point = points[p];

        for (let pos=0; pos < 6; pos++) {
            // Add texcoords
            if (texcoord_index) {
                vertex_template[texcoord_index + 0] = texcoords[pos][0] * texcoord_normalize;
                vertex_template[texcoord_index + 1] = texcoords[pos][1] * texcoord_normalize;
            }

            vertex_template[position_index + 0] = point[0];
            vertex_template[position_index + 1] = point[1];

            vertex_template[shape_index + 0] = scaling[pos][0];
            vertex_template[shape_index + 1] = scaling[pos][1];
            vertex_template[shape_index + 2] = angle;
            vertex_template[shape_index + 3] = quad_scale;

            vertex_template[offset_index + 0] = offset[0];
            vertex_template[offset_index + 1] = offset[1];

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
    var tolerance = options.tolerance || 1;
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

Builders.valuesWithinTolerance = function (a, b, tolerance) {
    tolerance = tolerance || 1;
    return (Math.abs(a - b) < tolerance);
};
