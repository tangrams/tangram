// Point builders
import { default_uvs } from './common';

// Scaling values to encode fractional values with fixed-point integer attributes
const pre_angles_normalize = 128 / Math.PI;
const angles_normalize = 16384 / Math.PI;
const offsets_normalize = 64;
const texcoord_normalize = 65535;

// Build a billboard sprite quad centered on a point. Sprites are intended to be drawn in screenspace, and have
// properties for width, height, angle, and a scale factor that can be used to interpolate the screenspace size
// of a sprite between two zoom levels.
export function buildQuadsForPoints (
    points,
    vertex_data,
    vertex_template,
    vindex,
    quad,
    quad_normalize,
    offset,
    offsets,
    pre_angles,
    angle,
    angles,
    texcoords,
    curve) {

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

    let uvs;
    if (vindex.a_texcoord) {
        var [min_u, min_v, max_u, max_v] = texcoords || default_uvs;

        uvs = [
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
            if (vindex.a_texcoord) {
                vertex_template[vindex.a_texcoord + 0] = uvs[pos][0] * texcoord_normalize;
                vertex_template[vindex.a_texcoord + 1] = uvs[pos][1] * texcoord_normalize;
            }

            vertex_template[vindex.a_position + 0] = point[0];
            vertex_template[vindex.a_position + 1] = point[1];

            vertex_template[vindex.a_shape + 0] = scaling[pos][0];
            vertex_template[vindex.a_shape + 1] = scaling[pos][1];
            vertex_template[vindex.a_shape + 2] = angle;

            vertex_template[vindex.a_offset + 0] = offset[0];
            vertex_template[vindex.a_offset + 1] = offset[1];

            if (curve) {
                // 1 byte (signed) range: [-127, 128]
                // actual range: [-2pi, 2pi]
                // total: multiply by 128 / (2 PI)
                vertex_template[vindex.a_pre_angles + 0] = pre_angles_normalize * pre_angles[0];
                vertex_template[vindex.a_pre_angles + 1] = pre_angles_normalize * pre_angles[1];
                vertex_template[vindex.a_pre_angles + 2] = pre_angles_normalize * pre_angles[2];
                vertex_template[vindex.a_pre_angles + 3] = pre_angles_normalize * pre_angles[3];

                // 2 byte (signed) of resolution [-32767, 32768]
                // actual range: [-2pi, 2pi]
                // total: multiply by 32768 / (2 PI) = 16384 / PI
                vertex_template[vindex.a_angles + 0] = angles_normalize * angles[0];
                vertex_template[vindex.a_angles + 1] = angles_normalize * angles[1];
                vertex_template[vindex.a_angles + 2] = angles_normalize * angles[2];
                vertex_template[vindex.a_angles + 3] = angles_normalize * angles[3];

                // offset range can be [0, 65535]
                // actual range: [0, 1024]
                vertex_template[vindex.a_offsets + 0] = offsets_normalize * offsets[0];
                vertex_template[vindex.a_offsets + 1] = offsets_normalize * offsets[1];
                vertex_template[vindex.a_offsets + 2] = offsets_normalize * offsets[2];
                vertex_template[vindex.a_offsets + 3] = offsets_normalize * offsets[3];
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
