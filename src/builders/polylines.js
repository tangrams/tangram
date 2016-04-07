// Geometry building functions

import Vector from '../vector';
import Geo from '../geo';
import { default_uvs, outsideTile } from './common';

const zero_vec2 = [0, 0];

// Build tessellated triangles for a polyline
const corners_for_cap = {
    butt: 0,
    square: 2,
    round: 3
};

const triangles_for_join = {
    miter: 0,
    bevel: 1,
    round: 3
};

// Scaling factor to add precision to line texture V coordinate packed as normalized short
const v_scale_adjust = Geo.tile_scale;

export function buildPolylines (
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
        texcoord_ratio,
        scaling_index,
        scaling_normalize,
        join, cap,
        miter_limit
    }) {

    var cornersOnCap = corners_for_cap[cap] || 0;         // default 'butt'
    var trianglesOnJoin = triangles_for_join[join] || 0;  // default 'miter'

    // Configure miter limit
    if (trianglesOnJoin === 0) {
        miter_limit = miter_limit || 3; // default miter limit
        var miter_len_sq = miter_limit * miter_limit;
    }

    // Build variables
    if (texcoord_index) {
        texcoord_normalize = texcoord_normalize || 1;
        texcoord_ratio = texcoord_ratio || 1;
        var [min_u, min_v, max_u, max_v] = texcoord_scale || default_uvs;
    }

    // Values that are constant for each line and are passed to helper functions
    var context = {
        vertex_data,
        vertex_template,
        half_width: width/2,
        vertices: [],
        scaling_index,
        scaling_normalize,
        scalingVecs: scaling_index && [],
        texcoord_index,
        texcoords: texcoord_index && [],
        texcoord_normalize,
        min_u, min_v, max_u, max_v,
        v_scale: 1 / ((width * texcoord_ratio) * v_scale_adjust), // scales line texture as a ratio of the line's width
        total_dist: 0,
        num_pairs: 0
    };

    for (var ln = 0; ln < lines.length; ln++) {
        // Remove dupe points from lines
        var line = dedupeLine(lines[ln], closed_polygon);
        if (!line) {
            continue; // skip if no valid line remaining
        }

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

        // Add vertices to buffer according to their index
        indexPairs(context);

        // Do this with the rest (except the last one)
        for (let i = 0; i < lineSize ; i++) {

            // There is a next one?
            isNext = i+1 < lineSize;

            if (isPrev) {
                // If there is a previous one, copy the current (previous) values on *Prev
                coordPrev = coordCurr;
                normPrev = Vector.normalize(Vector.perp(coordPrev, line[i]));
            } else if (i === 0 && closed_polygon === true) {
                // If it's the first point and is a closed polygon

                var needToClose = true;
                if (remove_tile_edges) {
                    if(outsideTile(line[i], line[lineSize-2], tile_edge_tolerance)) {
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
                // If it's the last point in a closed polygon
                coordNext = line[1];
                isNext = true;
            }

            if (isNext) {
                // If it's not the last one get next coordinates and calculate the right normal

                normNext = Vector.normalize(Vector.perp(coordCurr, coordNext));
                if (remove_tile_edges) {
                    if (outsideTile(coordCurr, coordNext, tile_edge_tolerance)) {
                        normCurr = Vector.normalize(Vector.perp(coordPrev, coordCurr));
                        if (isPrev) {
                            addVertexPair(
                                coordCurr, normCurr,
                                context.texcoords && Vector.length(Vector.sub(coordCurr, coordPrev)),
                                context);
                            context.num_pairs++;

                            // Add vertices to buffer acording their index
                            indexPairs(context);
                        }
                        isPrev = false;
                        continue;
                    }
                }
            }

            //  Compute current normal
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

            if (isPrev || isNext) {
                // If it's the BEGINNING of a LINE
                if (i === 0 && !isPrev && !closed_polygon) {
                    addCap(coordCurr, normCurr, cornersOnCap, true, context);
                }

                //  Miter limit: if miter join is too sharp, convert to bevel instead
                if (trianglesOnJoin === 0 && Vector.lengthSq(normCurr) > miter_len_sq) {
                    trianglesOnJoin = triangles_for_join['bevel']; // switch to bevel
                }

                // If it's a JOIN
                if (trianglesOnJoin !== 0 && isPrev && isNext) {
                    addJoin([coordPrev, coordCurr, coordNext],
                            [normPrev,normCurr, normNext],
                            trianglesOnJoin,
                            context);
                } else {
                    addVertexPair(
                        coordCurr, normCurr,
                        context.texcoords && Vector.length(Vector.sub(coordCurr, coordPrev)),
                        context);
                }

                if (isNext) {
                   context.num_pairs++;
                }

                isPrev = true;
            }
        }

        // Add vertices to buffer according to their index
        indexPairs(context);

         // If it's the END of a LINE
        if(!closed_polygon) {
            addCap(coordCurr, normCurr, cornersOnCap , false, context);
        }
    }
}

// Remove duplicate points from a line, creating a new line only when points must be removed
function dedupeLine (line, closed) {
    let i, dupes;

    // Collect dupe points
    for (i=0; i < line.length - 1; i++) {
        if (line[i][0] === line[i+1][0] && line[i][1] === line[i+1][1]) {
            dupes = dupes || [];
            dupes.push(i);
        }
    }

    // Remove dupe points
    if (dupes) {
        line = line.slice(0);
        dupes.forEach(d => line.splice(d, 1));
    }

    // Line needs at least 2 points, polygon needs at least 3 (+1 to close)
    if (!closed && line.length < 2 || closed && line.length < 4) {
        return;
    }
    return line;
}

// Add to equidistant pairs of vertices (internal method for polyline builder)
function addVertex(coord, normal, uv, { half_width, vertices, scalingVecs, texcoords }) {
    if (scalingVecs) {
        //  a. If scaling is on add the vertex (the currCoord) and the scaling Vecs (normals pointing where to extrude the vertices)
        vertices.push(coord);
        scalingVecs.push(normal);
    } else {
        //  b. Add the extruded vertices
        vertices.push([coord[0] + normal[0] * half_width,
                       coord[1] + normal[1] * half_width]);
    }

    // c) Add UVs if they are enabled
    if (texcoords) {
        texcoords.push(uv);
    }
}

//  Add to equidistant pairs of vertices (internal method for polyline builder)
function addVertexPair (coord, normal, dist, context) {
    if (context.texcoords) {
        context.total_dist += dist * context.v_scale;
        addVertex(coord, normal, [context.max_u, context.total_dist], context);
        addVertex(coord, Vector.neg(normal), [context.min_u, context.total_dist], context);
    }
    else {
        addVertex(coord, normal, null, context);
        addVertex(coord, Vector.neg(normal), null, context);
    }
}

//  Tessalate a FAN geometry between points A       B
//  using their normals from a center        \ . . /
//  and interpolating their UVs               \ p /
//                                             \./
//                                              C
function addFan (coord, nA, nC, nB, uA, uC, uB, signed, numTriangles, context) {

    if (numTriangles < 1) {
        return;
    }

    // Add previous vertices to buffer and clear the buffers and index pairs
    // because we are going to add more triangles.
    indexPairs(context);

    // Initial parameters
    var normCurr = Vector.set(nA);
    var normPrev = [0,0];

    // Calculate the angle between A and B
    var angle_delta = Vector.angleBetween(nA, nB);

    // Calculate the angle for each triangle
    var angle_step = angle_delta/numTriangles;

    // Joins that turn left or right behave diferently...
    // triangles need to be rotated in diferent directions
    if (!signed) {
        angle_step *= -1;
    }

    if (context.texcoords) {
        var uvCurr = Vector.set(uA);
        var uv_delta = Vector.div(Vector.sub(uB,uA), numTriangles);
    }

    //  Add the FIRST and CENTER vertex
    //  The triangles will be composed in a FAN style around it
    addVertex(coord, nC, uC, context);

    //  Add first corner
    addVertex(coord, normCurr, uA, context);

    // Iterate through the rest of the corners
    for (var t = 0; t < numTriangles; t++) {
        normPrev = Vector.normalize(normCurr);
        normCurr = Vector.rot(Vector.normalize(normCurr), angle_step);     //  Rotate the extrusion normal
        if (context.texcoords) {
            uvCurr = Vector.add(uvCurr,uv_delta);
        }
        addVertex(coord, normCurr, uvCurr, context);      //  Add computed corner
    }

    // Index the vertices
    for (var i = 0; i < numTriangles; i++) {
        if (signed) {
            addIndex(i+2, context);
            addIndex(0, context);
            addIndex(i+1, context);
        } else {
            addIndex(i+1, context);
            addIndex(0, context);
            addIndex(i+2, context);
        }
    }

    // Clear the buffer
    context.vertices = [];
    if (context.scalingVecs) {
        context.scalingVecs = [];
    }
    if (context.texcoords) {
        context.texcoords = [];
    }
}

//  addBevel    A ----- B
//             / \ , . / \
//           /   /\   /\  \
//              /  \ /   \ \
//                / C \
function addBevel (coord, nA, nC, nB, uA, uC, uB, signed, context) {
    // Add previous vertices to buffer and clear the buffers and index pairs
    // because we are going to add more triangles.
    indexPairs(context);

    //  Add the FIRST and CENTER vertex
    addVertex(coord, nC, uC, context);
    addVertex(coord, nA, uA, context);
    addVertex(coord, nB, uB, context);

    if (signed) {
        addIndex(2, context);
        addIndex(0, context);
        addIndex(1, context);
    } else {
        addIndex(1, context);
        addIndex(0, context);
        addIndex(2, context);
    }

    // Clear the buffer
    context.vertices = [];
    if (context.scalingVecs) {
        context.scalingVecs = [];
    }
    if (context.texcoords) {
        context.texcoords = [];
    }
}


//  Tessalate a SQUARE geometry between A and B     + ........+
//  and interpolating their UVs                     : \  2  / :
//                                                  : 1\   /3 :
//                                                  A -- C -- B
function addSquare (coord, nA, nB, uA, uC, uB, signed, context) {

    // Add previous vertices to buffer and clear the buffers and index pairs
    // because we are going to add more triangles.
    indexPairs(context);

    // Initial parameters
    var normCurr = Vector.set(nA);
    var normPrev = [0,0];
    if (context.texcoords) {
        var uvCurr = Vector.set(uA);
        var uv_delta = Vector.div(Vector.sub(uB,uA), 4);
    }

    // First and last cap have different directions
    var angle_step = 0.78539816339; // PI/4 = 45 degrees
    if (!signed) {
        angle_step *= -1;
    }

    //  Add the FIRST and CENTER vertex
    //  The triangles will be add in a FAN style around it
    //
    //                       A -- C
    addVertex(coord, zero_vec2, uC, context);

    //  Add first corner     +
    //                       :
    //                       A -- C
    addVertex(coord, normCurr, uA, context);

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

        if (context.texcoords) {
            uvCurr = Vector.add(uvCurr,uv_delta);
        }

        if (t !== 1) {
            //  Add computed corner (except the corner 1)
            addVertex(coord, normCurr, uvCurr, context);
        }
    }

    for (var i = 0; i < 3; i++) {
        if (signed) {
            addIndex(i+2, context);
            addIndex(0, context);
            addIndex(i+1, context);
        } else {
            addIndex(i+1, context);
            addIndex(0, context);
            addIndex(i+2, context);
        }
    }

    // Clear the buffer
    context.vertices = [];
    if (context.scalingVecs) {
        context.scalingVecs = [];
    }
    if (context.texcoords) {
        context.texcoords = [];
    }
}

//  Add special joins (not miter) types that require FAN tessellations
//  Using http://www.codeproject.com/Articles/226569/Drawing-polylines-by-tessellation as reference
function addJoin (coords, normals, nTriangles, context) {
    var signed = Vector.signed_area(coords[0], coords[1], coords[2]) > 0;
    var nA = normals[0],              // normal to point A (aT)
        nC = Vector.neg(normals[1]),  // normal to center (-vP)
        nB = normals[2];              // normal to point B (bT)
    var uA, uB, uC;

    if (context.texcoords) {
        context.total_dist += Vector.length(Vector.sub(coords[1], coords[0])) * context.v_scale;
        uA = [context.max_u, context.total_dist];
        uC = [context.min_u, context.total_dist];
        uB = uA;
    }

    if (signed) {
        addVertex(coords[1], nA, uA, context);
        addVertex(coords[1], nC, uC, context);
    } else {
        nA = Vector.neg(normals[0]);
        nC = normals[1];
        nB = Vector.neg(normals[2]);

        if (context.texcoords) {
            uA = [context.min_u, context.total_dist];
            uC = [context.max_u, context.total_dist];
            uB = uA;
        }
        addVertex(coords[1], nC, uC, context);
        addVertex(coords[1], nA, uA, context);
    }

    if (nTriangles === 1) {
        addBevel(coords[1], nA, nC, nB, uA, uC, uB, signed, context);
    } else if (nTriangles > 1){
        addFan(coords[1], nA, nC, nB, uA, uC, uB, signed, nTriangles, context);
    }

    if (signed) {
        addVertex(coords[1], nB, uB, context);
        addVertex(coords[1], nC, uC, context);
    } else {
        addVertex(coords[1], nC, uC, context);
        addVertex(coords[1], nB, uB, context);
    }
}

//  Function to add the vertex need for line caps,
//  because re-use the buffers needs to be at the end
function addCap (coord, normal, numCorners, isBeginning, context) {

    if (numCorners < 1) {
        return;
    }

    // UVs
    var uvA, uvB, uvC;
    if (context.texcoords) {
        uvC = [context.min_u+(context.max_u-context.min_u)/2, context.total_dist];   // Center point UVs
        uvA = [context.min_u, context.total_dist];                                   // Beginning angle UVs
        uvB = [context.max_u, context.total_dist];                                   // Ending angle UVs
    }

    if ( numCorners === 2 ){
        // If caps are set as squares
        addSquare( coord,
                   Vector.neg(normal), normal,
                   uvA, uvC, uvB,
                   isBeginning,
                   context);
    } else {
        // If caps are set as round ( numCorners===3 )
        addFan( coord,
                Vector.neg(normal), zero_vec2, normal,
                uvA, uvC, uvB,
                isBeginning, numCorners*2, context);
    }
}

// Add a vertex based on the index position into the VBO (internal method for polyline builder)
function addIndex (index, { vertex_data, vertex_template, half_width, vertices, scaling_index, scaling_normalize, scalingVecs, texcoord_index, texcoords, texcoord_normalize }) {
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

    // set Scaling vertex (X, Y normal direction + Z half_width as attribute)
    if (scaling_index) {
        vertex_template[scaling_index + 0] = scalingVecs[index][0] * scaling_normalize;
        vertex_template[scaling_index + 1] = scalingVecs[index][1] * scaling_normalize;
        vertex_template[scaling_index + 2] = half_width;
    }

    //  Add vertex to VBO
    vertex_data.addVertex(vertex_template);
}

// Add the index vertex to the VBO and clean the buffers
function indexPairs (context) {
    // Add vertices to buffer acording their index
    for (var i = 0; i < context.num_pairs; i++) {
        addIndex(2*i+2, context);
        addIndex(2*i+1, context);
        addIndex(2*i+0, context);

        addIndex(2*i+2, context);
        addIndex(2*i+3, context);
        addIndex(2*i+1, context);
    }

    context.num_pairs = 0;

    // Clean the buffer
    context.vertices = [];
    if (context.scalingVecs) {
        context.scalingVecs = [];
    }
    if (context.texcoords) {
        context.texcoords = [];
    }
}
