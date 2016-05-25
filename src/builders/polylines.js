// Geometry building functions

import Vector from '../vector';
import Geo from '../geo';
import { default_uvs, outsideTile, isCoordOutsideTile} from './common';

const zero_vec2 = [0, 0];

// Build tessellated triangles for a polyline
const CAP_TYPE = {
    BUTT: 0,
    SQUARE: 2,
    ROUND: 3
};

const JOIN_TYPE = {
    MITER: 0,
    BEVEL: 1,
    ROUND: 3
};

const DEFAULT = {
    MITER_LIMIT: 3,
    TEXCOORD_NORMALIZE: 1,
    TEXCOORD_RATIO: 1
};

// Scaling factor to add precision to line texture V coordinate packed as normalized short
const v_scale_adjust = Geo.tile_scale;

export function buildPolylines (lines, width, vertex_data, vertex_template,
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

    var cap_type = cap ? CAP_TYPE[cap.toUpperCase()] : CAP_TYPE.BUTT;
    var join_type = join ? JOIN_TYPE[join.toUpperCase()] : JOIN_TYPE.MITER;

    // Configure miter limit
    if (join_type === JOIN_TYPE.MITER) {
        miter_limit = miter_limit || DEFAULT.MITER_LIMIT; // default miter limit
        var miter_len_sq = miter_limit * miter_limit;
    }

    // Build variables
    if (texcoord_index) {
        texcoord_normalize = texcoord_normalize || DEFAULT.TEXCOORD_NORMALIZE;
        texcoord_ratio = texcoord_ratio || DEFAULT.TEXCOORD_RATIO;
        var [min_u, min_v, max_u, max_v] = texcoord_scale || default_uvs;
    }

    var v_scale = 1 / (width * texcoord_ratio * v_scale_adjust); // scales line texture as a ratio of the line's width

    // Values that are constant for each line and are passed to helper functions
    var context = {
        vertex_data,
        vertex_template,
        half_width: width / 2,
        scaling_index,
        scaling_normalize,
        texcoord_index,
        texcoord_normalize,
        min_u, min_v, max_u, max_v,
        miter_len_sq
    };

    var coordCurr, coordNext, normPrev, normNext;
    var v = 0;

    for (var index = 0; index < lines.length; index++) {
        var line = lines[index];

        // Skip if line is not valid
        if (line.length < 2) {
            continue;
        }

        // Loop backwards through line to a tile boundary if found
        if (closed_polygon && join_type === JOIN_TYPE.MITER) {
            var boundaryIndex = getTileBoundaryIndex(line);

            if (boundaryIndex !== 0) {
                // create new line that is a cyclic permutation of the original
                var newLine = line.splice(boundaryIndex);
                Array.prototype.push.apply(newLine, line.slice(1));
                newLine[newLine.length] = newLine[0];
                lines.push(newLine);
                continue;
            }
        }

        // FIRST POINT
        coordCurr = line[0];
        coordNext = line[1];

        // If first pair of points is redundant, slice and push to the lines array
        if (coordCurr[0] == coordNext[0] && coordCurr[1] == coordNext[1]) {
            if (line.length > 2) {
                lines.push(line.slice(1));
            }
            continue;
        }

        normNext = Vector.normalize(Vector.perp(coordCurr, coordNext));

        // Skip tile boundary lines and append a new line if needed
        if (remove_tile_edges && outsideTile(coordCurr, coordNext, tile_edge_tolerance)) {
            var nonBoundarySegment = getNextNonBoundarySegment(line, 0, tile_edge_tolerance);
            if (nonBoundarySegment) {
                lines.push(nonBoundarySegment);
            }
            continue;
        }

        if (closed_polygon){
            // Begin the polygon with a join (connecting the first and last segments)
            normPrev = Vector.normalize(Vector.perp(line[line.length - 2], coordCurr));
            startPolygon(coordCurr, normPrev, normNext, join_type, context);
        }
        else {
            // If line begins at edge, don't add a cap
            if (!isCoordOutsideTile(coordCurr)) {
                addCap(coordCurr, v, normNext, cap_type, true, context);
            }

            // Add first pair of points for the line strip
            addVertex(coordCurr, normNext, [1, v], context);
            addVertex(coordCurr, Vector.neg(normNext), [0, v], context);
        }

        // INTERMEDIARY POINTS
        v += v_scale * Vector.length(Vector.sub(coordNext, coordCurr));
        for (var i = 1; i < line.length - 1; i++) {
            var currIndex = i;
            var nextIndex = i + 1;
            coordCurr = line[currIndex];
            coordNext = line[nextIndex];

            // Skip redundant vertices
            if (Vector.isEqual(coordCurr, coordNext)) {
                continue;
            }

            // Remove tile boundaries
            if (remove_tile_edges && outsideTile(coordCurr, coordNext, tile_edge_tolerance)) {
                addVertex(coordCurr, normNext, [1, v], context);
                addVertex(coordCurr, Vector.neg(normNext), [0, v], context);
                indexPairs(1, context);

                var nonBoundaryLines = getNextNonBoundarySegment(line, currIndex + 1, tile_edge_tolerance);
                if (nonBoundaryLines) {
                    lines.push(nonBoundaryLines);
                }

                break;
            }

            normPrev = normNext;
            normNext = Vector.normalize(Vector.perp(coordCurr, coordNext));

            // Add join
            if (join_type === JOIN_TYPE.MITER) {
                addMiter(v, coordCurr, normPrev, normNext, miter_len_sq, false, context);
            }
            else {
                addJoin(join_type, v, coordCurr, normPrev, normNext, false, context);
            }

            v += v_scale * Vector.length(Vector.sub(coordNext, coordCurr));
        }

        // LAST POINT
        coordCurr = coordNext;
        normPrev = normNext;

        if (closed_polygon) {
            // Close the polygon with a miter joint or butt cap if on a tile boundary
            normNext = Vector.normalize(Vector.perp(coordCurr, line[1]));
            endPolygon(coordCurr, normPrev, normNext, join_type, v, context);
        }
        else {
            // Finish the line strip
            addVertex(coordCurr, normPrev, [1, v], context);
            addVertex(coordCurr, Vector.neg(normPrev), [0, v], context);
            indexPairs(1, context);

            // If line ends at edge, don't add a cap
            if (!isCoordOutsideTile(coordCurr)) {
                addCap(coordCurr, v, normPrev, cap_type, false, context);
            }
        }
    }
}

function getTileBoundaryIndex(line){
    if (isCoordOutsideTile(line[0])) {
        return 0;
    }

    for (var backIndex = 0; backIndex < line.length; backIndex++) {
        var coordCurr = line[line.length - 1 - backIndex];
        if (isCoordOutsideTile(coordCurr)) {
            return line.length - 1 - backIndex;
        }
    }

    return 0;
}

function getNextNonBoundarySegment (line, startIndex, tolerance) {
    var endIndex = startIndex;
    while (line[endIndex + 1] && outsideTile(line[endIndex], line[endIndex + 1], tolerance)) {
        endIndex++;
    }

    // If there is a line segment remaining that is within the tile, push it to the lines array
    return (line.length - endIndex >= 2) ? line.slice(endIndex) : false;
}

function startPolygon(coordCurr, normPrev, normNext, join_type, context){
    // If polygon starts on a tile boundary, don't add a join
    if (isCoordOutsideTile(coordCurr)) {
        addVertex(coordCurr, normNext, [1, 0], context);
        addVertex(coordCurr, Vector.neg(normNext), [0, 0], context);
    }
    else {
        // If polygon starts within a tile, add a join
        var v = 0;
        if (join_type === JOIN_TYPE.MITER) {
            addMiter(v, coordCurr, normPrev, normNext, context.miter_len_sq, true, context);
        }
        else {
            addJoin(join_type, v, coordCurr, normPrev, normNext, true, context);
        }
    }
}

function endPolygon(coordCurr, normPrev, normNext, join_type, v, context) {
    // If polygon ends on a tile boundary, don't add a join
    if (isCoordOutsideTile(coordCurr)) {
        addVertex(coordCurr, normNext, [1, 0], context);
        addVertex(coordCurr, Vector.neg(normNext), [0, 0], context);
    }
    else {
        // If polygon ends within a tile, add Miter or no joint (join added on startPolygon)
        var miterVec = createMiterVec(normPrev, normNext);

        if (join_type === JOIN_TYPE.MITER && Vector.lengthSq(miterVec) > context.miter_len_sq) {
            join_type = JOIN_TYPE.BEVEL; // switch to bevel
        }

        if (join_type === JOIN_TYPE.MITER) {
            addVertex(coordCurr, miterVec, [0, v], context);
            addVertex(coordCurr, Vector.neg(miterVec), [1, v], context);
            indexPairs(1, context);
        }
        else {
            addVertex(coordCurr, normPrev, [0, v], context);
            addVertex(coordCurr, Vector.neg(normPrev), [1, v], context);
            indexPairs(1, context);
        }
    }
}

function createMiterVec(normPrev, normNext) {
    var miterVec = Vector.normalize(Vector.add(normPrev, normNext));
    var scale = 2 / (1 + Math.abs(Vector.dot(normPrev, miterVec)));
    return Vector.mult(miterVec, scale * scale);
}

function addMiter (v, coordCurr, normPrev, normNext, miter_len_sq, isBeginning, context) {
    var miterVec = createMiterVec(normPrev, normNext);

    //  Miter limit: if miter join is too sharp, convert to bevel instead
    if (Vector.lengthSq(miterVec) > miter_len_sq) {
        addJoin(JOIN_TYPE.MITER, v, coordCurr, normPrev, normNext, isBeginning, context);
    }
    else {
        addVertex(coordCurr, miterVec, [1, v], context);
        addVertex(coordCurr, Vector.neg(miterVec), [0, v], context);
        if (!isBeginning) {
            indexPairs(1, context);
        }
    }
}

function addJoin(join_type, v, coordCurr, normPrev, normNext, isBeginning, context) {
    var miterVec = createMiterVec(normPrev, normNext);

    if (!isBeginning) {
        addVertex(coordCurr, miterVec, [0, v], context);
        addVertex(coordCurr, Vector.neg(normPrev), [1, v], context);
        indexPairs(1, context);
    }

    if (join_type === JOIN_TYPE.BEVEL) {
        addBevel(coordCurr,
            Vector.neg(normPrev), miterVec, Vector.neg(normNext),
            [1, v], [0, v], [1, v],
            context
        );
    }
    else if (join_type === JOIN_TYPE.ROUND) {
        addFan(coordCurr,
            Vector.neg(normPrev), miterVec, Vector.neg(normNext),
            [1, v], [0, v], [1, v],
            context
        );
    }

    addVertex(coordCurr, miterVec, [0, v], context);
    addVertex(coordCurr, Vector.neg(normNext), [1, v], context);
}

function indexPairs(num_pairs, context){
    var vertex_elements = context.vertex_data.vertex_elements;
    var num_vertices = context.vertex_data.vertex_count;
    var offset = num_vertices - 2 * num_pairs - 2;

    for (var i = 0; i < num_pairs; i++){
        vertex_elements.push(offset + 2 * i + 2);
        vertex_elements.push(offset + 2 * i + 1);
        vertex_elements.push(offset + 2 * i + 0);
        vertex_elements.push(offset + 2 * i + 2);
        vertex_elements.push(offset + 2 * i + 3);
        vertex_elements.push(offset + 2 * i + 1);
    }
}

function addVertex(coordinate, normal, uv, context) {
    var vertex_template = context.vertex_template;
    var vertex_data = context.vertex_data;

    buildVertexTemplate(vertex_template, coordinate, uv, normal, context);
    vertex_data.addVertex(vertex_template);
}

function buildVertexTemplate (vertex_template, vertex, texture_coord, scale, context) {
    // set vertex position
    vertex_template[0] = vertex[0];
    vertex_template[1] = vertex[1];

    // set UVs
    if (context.texcoord_index && texture_coord) {
        vertex_template[context.texcoord_index + 0] = texture_coord[0] * context.texcoord_normalize;
        vertex_template[context.texcoord_index + 1] = texture_coord[1] * context.texcoord_normalize;
    }

    // set Scaling vertex (X, Y normal direction + Z half_width as attribute)
    if (context.scaling_index) {
        vertex_template[context.scaling_index + 0] = scale[0] * context.scaling_normalize;
        vertex_template[context.scaling_index + 1] = scale[1] * context.scaling_normalize;
        vertex_template[context.scaling_index + 2] = context.half_width;
    }
}

//  Tessalate a FAN geometry between points A       B
//  using their normals from a center        \ . . /
//  and interpolating their UVs               \ p /
//                                             \./
function addFan (coord, nA, nC, nB, uA, uC, uB, context) {
    var cross = nA[0] * nB[1] - nA[1] * nB[0];
    var dot = Vector.dot(nA, nB);
    var angle = -2*Math.PI + mod(Math.atan2(cross, dot), 2*Math.PI);

    var numTriangles = trianglesPerArc(angle, context.half_width);
    if (numTriangles < 1) {
        return;
    }

    if (context.texcoord_index !== undefined) {
        var uvCurr = Vector.set(uA);
        var uv_delta = Vector.div(Vector.sub(uB, uA), numTriangles);
    }

    var pivotIndex = context.vertex_data.vertex_count;
    var vertex_elements = context.vertex_data.vertex_elements;

    addVertex(coord, nC, uC, context);
    addVertex(coord, nA, uA, context);

    // Iterate through the rest of the corners
    var blade = nA;
    var angle_step = angle / numTriangles;
    for (var i = 0; i < numTriangles; i++) {
        blade = Vector.rot(blade, angle_step);

        addVertex(coord, blade, uvCurr, context);

        if (context.texcoord_index !== undefined) {
            uvCurr = Vector.add(uvCurr, uv_delta);
        }

        vertex_elements.push(pivotIndex + i + ((cross > 0) ? 2 : 1));
        vertex_elements.push(pivotIndex);
        vertex_elements.push(pivotIndex + i + ((cross > 0) ? 1 : 2));
    }
}

//  addBevel    A ----- B
//             / \ , . / \
//           /   /\   /\  \
//              /  \ /   \ \
//                / C \
function addBevel (coord, nA, nC, nB, uA, uC, uB, context) {
    var pivotIndex = context.vertex_data.vertex_count;

    addVertex(coord, nC, uC, context);
    addVertex(coord, nA, uA, context);
    addVertex(coord, nB, uB, context);

    var orientation = nA[0] * nB[1] - nA[1] * nB[0] > 0;

    var vertex_elements = context.vertex_data.vertex_elements;

    if (orientation) {
        vertex_elements.push(pivotIndex + 2);
        vertex_elements.push(pivotIndex + 0);
        vertex_elements.push(pivotIndex + 1);
    } else {
        vertex_elements.push(pivotIndex + 1);
        vertex_elements.push(pivotIndex + 0);
        vertex_elements.push(pivotIndex + 2);
    }
}

//  Function to add the vertex need for line caps,
//  because re-use the buffers needs to be at the end
function addCap (coord, v, normal, type, isBeginning, context) {
    if (context.texcoord_index !== undefined) {
        var uvC = [0.5, v];   // Center point UVs
        var uvA = [0, v];   // Beginning angle UVs
        var uvB = [1, v];   // Ending angle UVs
    }

    switch (type){
        case CAP_TYPE.SQUARE:
            var tangent = (isBeginning) ? [normal[1], -normal[0]] : [-normal[1], normal[0]];

            //TODO: put correct uv coords
            addVertex(coord, Vector.add(normal, tangent), uvC, context);
            addVertex(coord, Vector.add(Vector.neg(normal), tangent), uvA, context);

            // If starting a line, there are no previously batched vertices
            if (!isBeginning) {
                indexPairs(1, context);
            }
            break;
        case CAP_TYPE.ROUND:
            var nA = isBeginning ? normal : Vector.neg(normal);
            var nB = isBeginning ? Vector.neg(normal) : normal;

            addFan(coord,
                nA, zero_vec2, nB,
                uvA, uvC, uvB,
                context
            );
            break;
        case CAP_TYPE.BUTT:
            return;
    }
}

var min_width = 5;
function trianglesPerArc (angle, width) {
    if (angle < 0) {
        angle = -angle;
    }

    var numTriangles = (width > 2*min_width) ? Math.log2(width / min_width) : 1;
    return Math.ceil(angle / Math.PI * numTriangles);
}

function mod (value, modulus) {
    return ((value % modulus) + modulus) % modulus;
}
