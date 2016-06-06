// Geometry building functions

import Vector from '../vector';
import Geo from '../geo';
import {outsideTile, isCoordOutsideTile} from './common';

const zero_vec2 = [0, 0];

// Build tessellated triangles for a polyline
const CAP_TYPE = {
    butt: 0,
    square: 1,
    round: 2
};

const JOIN_TYPE = {
    miter: 0,
    bevel: 1,
    round: 2
};

const DEFAULT = {
    MITER_LIMIT: 3,
    TEXCOORD_NORMALIZE: 1,
    TEXCOORD_RATIO: 1,
    MIN_FAN_WIDTH: 5        // Width of line in tile units to place 1 triangle per fan
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
        texcoord_width,
        texcoord_ratio,
        texcoord_normalize,
        scaling_index,
        scaling_normalize,
        join, cap,
        miter_limit
    }) {

    var cap_type = cap ? CAP_TYPE[cap] : CAP_TYPE.butt;
    var join_type = join ? JOIN_TYPE[join] : JOIN_TYPE.miter;

    // Configure miter limit
    if (join_type === JOIN_TYPE.miter) {
        miter_limit = miter_limit || DEFAULT.MITER_LIMIT; // default miter limit
        var miter_len_sq = miter_limit * miter_limit;
    }

    // Texture Variables
    var v_scale;
    if (texcoord_index) {
        texcoord_normalize = texcoord_normalize || DEFAULT.TEXCOORD_NORMALIZE;
        texcoord_ratio = texcoord_ratio || DEFAULT.TEXCOORD_RATIO;
        v_scale = 1 / (texcoord_width * texcoord_ratio * v_scale_adjust); // scales line texture as a ratio of the line's width
    }

    // Values that are constant for each line and are passed to helper functions
    var context = {
        closed_polygon,
        remove_tile_edges,
        tile_edge_tolerance,
        miter_len_sq,
        join_type,
        cap_type,
        vertex_data,
        vertex_template,
        half_width: width / 2,
        scaling_index,
        scaling_normalize,
        v_scale,
        texcoord_index,
        texcoord_width,
        texcoord_normalize
    };

    // Buffer for extra lines to process
    var extra_lines = [];

    // Process lines
    for (let index = 0; index < lines.length; index++) {
        buildPolyline(lines[index], context, extra_lines);
    }

    // Process extra lines
    for (let index = 0; index < extra_lines.length; index++) {
        buildPolyline(extra_lines[index], context, extra_lines);
    }
}

function buildPolyline(line, context, extra_lines){
    // Skip if line is not valid
    if (line.length < 2) {
        return;
    }

    var coordCurr, coordNext, normPrev, normNext;
    var {join_type, cap_type, closed_polygon, remove_tile_edges, tile_edge_tolerance, v_scale, miter_len_sq} = context;
    var v = 0; // Texture v-coordinate

    // Loop backwards through line to a tile boundary if found
    if (closed_polygon && join_type === JOIN_TYPE.miter) {
        var boundaryIndex = getTileBoundaryIndex(line);
        if (boundaryIndex !== 0) {
            // create new line that is a cyclic permutation of the original
            var permutedLine = permuteLine(line, boundaryIndex);
            extra_lines.push(permutedLine);
            return;
        }
    }

    // FIRST POINT
    coordCurr = line[0];
    coordNext = line[1];

    // If first pair of points is redundant, slice and push to the lines array
    if (Vector.isEqual(coordCurr, coordNext)) {
        if (line.length > 2) {
            extra_lines.push(line.slice(1));
        }
        return;
    }

    normNext = Vector.normalize(Vector.perp(coordCurr, coordNext));

    // Skip tile boundary lines and append a new line if needed
    if (remove_tile_edges && outsideTile(coordCurr, coordNext, tile_edge_tolerance)) {
        var nonBoundarySegment = getNextNonBoundarySegment(line, 0, tile_edge_tolerance);
        if (nonBoundarySegment) {
            extra_lines.push(nonBoundarySegment);
        }
        return;
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
            if (cap_type !== CAP_TYPE.butt) {
                v += 0.5 * v_scale * context.texcoord_width;
            }
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
                extra_lines.push(nonBoundaryLines);
            }
            return;
        }

        normPrev = normNext;
        normNext = Vector.normalize(Vector.perp(coordCurr, coordNext));

        // Add join
        if (join_type === JOIN_TYPE.miter) {
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

// Iterate through line from startIndex to find a segment not on a tile boundary, if any.
function getNextNonBoundarySegment (line, startIndex, tolerance) {
    var endIndex = startIndex;
    while (line[endIndex + 1] && outsideTile(line[endIndex], line[endIndex + 1], tolerance)) {
        endIndex++;
    }

    // If there is a line segment remaining that is within the tile, push it to the lines array
    return (line.length - endIndex >= 2) ? line.slice(endIndex) : false;
}

// Begin a polygon with a join connecting to the last segment (if valid join-type specified)
function startPolygon(coordCurr, normPrev, normNext, join_type, context){
    // If polygon starts on a tile boundary, don't add a join
    if (join_type === undefined || isCoordOutsideTile(coordCurr)) {
        addVertex(coordCurr, normNext, [1, 0], context);
        addVertex(coordCurr, Vector.neg(normNext), [0, 0], context);
    }
    else {
        // If polygon starts within a tile, add a join
        var v = 0;
        if (join_type === JOIN_TYPE.miter) {
            addMiter(v, coordCurr, normPrev, normNext, context.miter_len_sq, true, context);
        }
        else {
            addJoin(join_type, v, coordCurr, normPrev, normNext, true, context);
        }
    }
}

// End a polygon appropriately
function endPolygon(coordCurr, normPrev, normNext, join_type, v, context) {
    // If polygon ends on a tile boundary, don't add a join
    if (isCoordOutsideTile(coordCurr)) {
        addVertex(coordCurr, normPrev, [1, v], context);
        addVertex(coordCurr, Vector.neg(normPrev), [0, v], context);
        indexPairs(1, context);
    }
    else {
        // If polygon ends within a tile, add Miter or no joint (join added on startPolygon)
        var miterVec = createMiterVec(normPrev, normNext);

        if (join_type === JOIN_TYPE.miter && Vector.lengthSq(miterVec) > context.miter_len_sq) {
            join_type = JOIN_TYPE.bevel; // switch to bevel
        }

        if (join_type === JOIN_TYPE.miter) {
            addVertex(coordCurr, miterVec, [1, v], context);
            addVertex(coordCurr, Vector.neg(miterVec), [0, v], context);
            indexPairs(1, context);
        }
        else {
            addVertex(coordCurr, normPrev, [1, v], context);
            addVertex(coordCurr, Vector.neg(normPrev), [0, v], context);
            indexPairs(1, context);
        }
    }
}

function createMiterVec(normPrev, normNext) {
    var miterVec = Vector.normalize(Vector.add(normPrev, normNext));
    var scale = 2 / (1 + Math.abs(Vector.dot(normPrev, miterVec)));
    return Vector.mult(miterVec, scale * scale);
}

// Add a miter vector or a join if the miter is too sharp
function addMiter (v, coordCurr, normPrev, normNext, miter_len_sq, isBeginning, context) {
    var miterVec = createMiterVec(normPrev, normNext);

    //  Miter limit: if miter join is too sharp, convert to bevel instead
    if (Vector.lengthSq(miterVec) > miter_len_sq) {
        addJoin(JOIN_TYPE.miter, v, coordCurr, normPrev, normNext, isBeginning, context);
    }
    else {
        addVertex(coordCurr, miterVec, [1, v], context);
        addVertex(coordCurr, Vector.neg(miterVec), [0, v], context);
        if (!isBeginning) {
            indexPairs(1, context);
        }
    }
}

// Add a bevel or round join
function addJoin(join_type, v, coordCurr, normPrev, normNext, isBeginning, context) {
    var miterVec = createMiterVec(normPrev, normNext);
    var isClockwise = (normNext[0] * normPrev[1] - normNext[1] * normPrev[0] > 0);

    if (isClockwise){
        addVertex(coordCurr, miterVec, [1, v], context);
        addVertex(coordCurr, Vector.neg(normPrev), [0, v], context);

        if (!isBeginning) {
            indexPairs(1, context);
        }

        if (join_type === JOIN_TYPE.bevel) {
            addBevel(coordCurr,
                Vector.neg(normPrev), miterVec, Vector.neg(normNext),
                [0, v], [1, v], [0, v],
                context
            );
        }
        else if (join_type === JOIN_TYPE.round) {
            addFan(coordCurr,
                Vector.neg(normPrev), miterVec, Vector.neg(normNext),
                [0, v], [1, v], [0, v],
                false, context
            );
        }

        addVertex(coordCurr, miterVec, [1, v], context);
        addVertex(coordCurr, Vector.neg(normNext), [0, v], context);
    }
    else {
        addVertex(coordCurr, normPrev, [1, v], context);
        addVertex(coordCurr, Vector.neg(miterVec), [0, v], context);

        if (!isBeginning) {
            indexPairs(1, context);
        }

        if (join_type === JOIN_TYPE.bevel) {
            addBevel(coordCurr,
                normPrev, Vector.neg(miterVec), normNext,
                [1, v], [0, v], [1, v],
                context
            );
        }
        else if (join_type === JOIN_TYPE.round) {
            addFan(coordCurr,
                normPrev, Vector.neg(miterVec), normNext,
                [1, v], [0, v], [1, v],
                false, context
            );
        }

        addVertex(coordCurr, normNext, [1, v], context);
        addVertex(coordCurr, Vector.neg(miterVec), [0, v], context);
    }
}

// Add indices to vertex_elements
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
function addFan (coord, nA, nC, nB, uvA, uvC, uvB, isCap, context) {
    var cross = nA[0] * nB[1] - nA[1] * nB[0];
    var dot = Vector.dot(nA, nB);

    var angle = Math.atan2(cross, dot);
    while (angle >= Math.PI) {
        angle -= 2*Math.PI;
    }

    var numTriangles = trianglesPerArc(angle, context.half_width);
    if (numTriangles < 1) {
        return;
    }

    var pivotIndex = context.vertex_data.vertex_count;
    var vertex_elements = context.vertex_data.vertex_elements;

    addVertex(coord, nC, uvC, context);
    addVertex(coord, nA, uvA, context);

    var blade = nA;

    if (context.texcoord_index !== undefined) {
        var uvCurr;
        if (isCap){
            uvCurr = [];
            var affine_uvCurr = Vector.sub(uvA, uvC);
        }
        else {
            uvCurr = Vector.set(uvA);
            var uv_delta = Vector.div(Vector.sub(uvB, uvA), numTriangles);
        }
    }

    var angle_step = angle / numTriangles;
    for (var i = 0; i < numTriangles; i++) {
        blade = Vector.rot(blade, angle_step);

        if (context.texcoord_index !== undefined) {
            if (isCap){
                // UV textures go "through" the cap
                affine_uvCurr = Vector.rot(affine_uvCurr, angle_step);
                uvCurr[0] = affine_uvCurr[0] + uvC[0];
                uvCurr[1] = affine_uvCurr[1] * context.texcoord_width * context.v_scale + uvC[1]; // scale the v-coordinate
            }
            else {
                // UV textures go "around" the join
                uvCurr = Vector.add(uvCurr, uv_delta);
            }
        }

        addVertex(coord, blade, uvCurr, context);

        vertex_elements.push(pivotIndex + i + ((cross > 0) ? 2 : 1));
        vertex_elements.push(pivotIndex);
        vertex_elements.push(pivotIndex + i + ((cross > 0) ? 1 : 2));
    }
}

//  addBevel    A ----- B
//             / \     / \
//           /   /\   /\  \
//              /  \ /  \  \
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
    var neg_normal = Vector.neg(normal);

    switch (type){
        case CAP_TYPE.square:
            var tangent;
            if (isBeginning){
                tangent = [normal[1], -normal[0]];

                addVertex(coord, Vector.add(normal, tangent), [1, v], context);
                addVertex(coord, Vector.add(neg_normal, tangent), [0, v], context);

                // Add length of square cap to texture coordinate
                v += 0.5 * context.texcoord_width * context.v_scale;

                addVertex(coord, normal, [1, v], context);
                addVertex(coord, neg_normal, [0, v], context);
            }
            else {
                tangent = [-normal[1], normal[0]];

                addVertex(coord, normal, [1, v], context);
                addVertex(coord, neg_normal, [0, v], context);

                // Add length of square cap to texture coordinate
                v += 0.5 * context.texcoord_width * context.v_scale;

                addVertex(coord, Vector.add(normal, tangent), [1, v], context);
                addVertex(coord, Vector.add(neg_normal, tangent), [0, v], context);
            }

            indexPairs(1, context);
            break;
        case CAP_TYPE.round:
            var nA, nB, uvA, uvB, uvC;
            if (isBeginning) {
                nA = normal;
                nB = neg_normal;

                if (context.texcoord_index !== undefined){
                    v += 0.5 * context.texcoord_width * context.v_scale;
                    uvA = [1, v];
                    uvB = [0, v];
                    uvC = [0.5, v];
                }
            }
            else {
                nA = neg_normal;
                nB = normal;

                if (context.texcoord_index !== undefined){
                    uvA = [0, v];
                    uvB = [1, v];
                    uvC = [0.5, v];
                }
            }

            addFan(coord,
                nA, zero_vec2, nB,
                uvA, uvC, uvB,
                true, context
            );

            break;
        case CAP_TYPE.butt:
            return;
    }
}

// Calculate number of triangles for a fan given an angle and line width
function trianglesPerArc (angle, width) {
    if (angle < 0) {
        angle = -angle;
    }

    var numTriangles = (width > 2 * DEFAULT.MIN_FAN_WIDTH) ? Math.log2(width / DEFAULT.MIN_FAN_WIDTH) : 1;
    return Math.ceil(angle / Math.PI * numTriangles);
}

// Cyclically permute closed line starting at an index
function permuteLine(line, startIndex){
    var newLine = [];
    for (let i = 0; i < line.length; i++){
        var index = (i + startIndex) % line.length;
        // skip the first (repeated) index
        if (index !== 0) {
            newLine.push(line[index]);
        }
    }
    newLine.push(newLine[0]);
    return newLine;
}