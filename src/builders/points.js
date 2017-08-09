// Point builders
import { default_uvs } from './common';

// Build a billboard sprite quad centered on a point. Sprites are intended to be drawn in screenspace, and have
// properties for width, height, angle, and a scale factor that can be used to interpolate the screenspace size
// of a sprite between two zoom levels.
export function buildQuadsForPoints (points, vertex_data, vertex_template,
    { texcoord_index, position_index, shape_index, offset_index, offsets_index, pre_angles_index, angles_index },
    { quad, quad_normalize, offset, offsets, pre_angles, angle, angles, curve, texcoord_scale, texcoord_normalize, pre_angles_normalize, angles_normalize, offsets_normalize }) {
    quad_normalize = quad_normalize || 1;
    let w2 = quad[0] / 2 * quad_normalize;
    let h2 = quad[1] / 2 * quad_normalize;
    let scaling = [
        [-w2, -h2],
        [w2, -h2],
        [w2, h2],
        [-w2, h2]
    ];

    let vertex_elements = vertex_data.vertex_elements;
    let element_offset = vertex_data.vertex_count;

    let texcoords;
    if (texcoord_index) {
        texcoord_normalize = texcoord_normalize || 1;

        var [min_u, min_v, max_u, max_v] = texcoord_scale || default_uvs;

        texcoords = [
            [min_u, min_v],
            [max_u, min_v],
            [max_u, max_v],
            [min_u, max_v]
        ];
    }

    var geom_count = 0;
    let num_points = points.length;
    for (let p=0; p < num_points; p++) {
        let point = points[p];

        for (let pos=0; pos < 4; pos++) {
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

            vertex_template[offset_index + 0] = offset[0];
            vertex_template[offset_index + 1] = offset[1];

            if (curve){
                // 1 byte (signed) range: [-127, 128]
                // actual range: [-2pi, 2pi]
                // total: multiply by 128 / (2 PI)
                vertex_template[pre_angles_index + 0] = pre_angles_normalize * pre_angles[0];
                vertex_template[pre_angles_index + 1] = pre_angles_normalize * pre_angles[1];
                vertex_template[pre_angles_index + 2] = pre_angles_normalize * pre_angles[2];
                vertex_template[pre_angles_index + 3] = pre_angles_normalize * pre_angles[3];

                // 2 byte (signed) of resolution [-32767, 32768]
                // actual range: [-2pi, 2pi]
                // total: multiply by 32768 / (2 PI) = 16384 / PI
                vertex_template[angles_index + 0] = angles_normalize * angles[0];
                vertex_template[angles_index + 1] = angles_normalize * angles[1];
                vertex_template[angles_index + 2] = angles_normalize * angles[2];
                vertex_template[angles_index + 3] = angles_normalize * angles[3];

                // offset range can be [0, 65535]
                // actual range: [0, 1024]
                vertex_template[offsets_index + 0] = offsets_normalize * offsets[0];
                vertex_template[offsets_index + 1] = offsets_normalize * offsets[1];
                vertex_template[offsets_index + 2] = offsets_normalize * offsets[2];
                vertex_template[offsets_index + 3] = offsets_normalize * offsets[3];
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
        geom_count += 2;
    }

    return geom_count;
}
