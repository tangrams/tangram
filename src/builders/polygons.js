// Polygon builders
import Geo from '../geo';
import Vector from '../vector';
import { default_uvs, outsideTile } from './common';

import earcut from 'earcut';

const up_vec3 = [0, 0, 1];

// Tesselate a flat 2D polygon
// x & y coordinates will be set as first two elements of provided vertex_template
export function buildPolygons (
    polygons,
    vertex_data, vertex_template,
    { texcoord_index, texcoord_scale, texcoord_normalize }) {

    var vertex_elements = vertex_data.vertex_elements;

    if (texcoord_index) {
        texcoord_normalize = texcoord_normalize || 1;
        var [min_u, min_v, max_u, max_v] = texcoord_scale || default_uvs;
    }

    var num_polygons = polygons.length;
    for (var p=0; p < num_polygons; p++) {
        var element_offset = vertex_data.vertex_count;

        var polygon = polygons[p];

        // Find polygon extents to calculate UVs, fit them to the axis-aligned bounding box
        if (texcoord_index) {
            var [min_x, min_y, max_x, max_y] = Geo.findBoundingBox(polygon);
            var span_x = max_x - min_x;
            var span_y = max_y - min_y;
            var scale_u = (max_u - min_u) / span_x;
            var scale_v = (max_v - min_v) / span_y;
        }

        for (var ring_index = 0; ring_index < polygon.length; ring_index++){
            // Add vertex data
            var polygon_ring = polygon[ring_index];
            for (let i = 0; i < polygon_ring.length; i++) {
                var vertex = polygon_ring[i];
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

        // Add element indices
        var indices = triangulatePolygon(earcut.flatten(polygon));
        for (let i = 0; i < indices.length; i++){
            vertex_elements.push(element_offset + indices[i]);
        }
    }
}

// Tesselate and extrude a flat 2D polygon into a simple 3D model with fixed height and add to GL vertex buffer
export function buildExtrudedPolygons (
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
        texcoord_normalize,
        winding
    }) {

    // Top
    var min_z = z + (min_height || 0);
    var max_z = z + height;
    vertex_template[2] = max_z;
    buildPolygons(polygons, vertex_data, vertex_template, { texcoord_index, texcoord_scale, texcoord_normalize });

    var vertex_elements = vertex_data.vertex_elements;
    var element_offset = vertex_data.vertex_count;

    // Walls
    // Fit UVs to wall quad
    if (texcoord_index) {
        texcoord_normalize = texcoord_normalize || 1;
        var [min_u, min_v, max_u, max_v] = texcoord_scale || default_uvs;
        var texcoords = [
            [min_u, max_v],
            [min_u, min_v],
            [max_u, min_v],
            [max_u, max_v]
        ];
    }

    var num_polygons = polygons.length;
    for (var p=0; p < num_polygons; p++) {
        var polygon = polygons[p];

        for (var q=0; q < polygon.length; q++) {
            var contour = polygon[q];

            for (var w=0; w < contour.length - 1; w++) {
                if (remove_tile_edges && outsideTile(contour[w], contour[w+1], tile_edge_tolerance)) {
                    continue; // don't extrude tile edges
                }

                // Wall order is dependent on winding order, so that normals face outward
                let w0, w1;
                if (winding === 'CCW') {
                    w0 = w;
                    w1 = w+1;
                }
                else {
                    w0 = w+1;
                    w1 = w;
                }

                // Two triangles for the quad formed by each vertex pair, going from bottom to top height
                var wall_vertices = [
                    [contour[w1][0], contour[w1][1], max_z],
                    [contour[w1][0], contour[w1][1], min_z],
                    [contour[w0][0], contour[w0][1], min_z],
                    [contour[w0][0], contour[w0][1], max_z]
                ];

                // Calc the normal of the wall from up vector and one segment of the wall triangles
                let wall_vec = Vector.normalize([contour[w1][0] - contour[w0][0], contour[w1][1] - contour[w0][1], 0]);
                let normal = Vector.cross(up_vec3, wall_vec);

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

                vertex_elements.push(element_offset + 0);
                vertex_elements.push(element_offset + 1);
                vertex_elements.push(element_offset + 2);
                vertex_elements.push(element_offset + 2);
                vertex_elements.push(element_offset + 3);
                vertex_elements.push(element_offset + 0);

                element_offset += 4;
            }
        }
    }
}

// Triangulation using earcut
// https://github.com/mapbox/earcut
export function triangulatePolygon (data) {
    return earcut(data.vertices, data.holes, data.dimensions);
}
