// Point builders
import { default_uvs } from './common';

// Scaling values to encode fractional values with fixed-point integer attributes
const pre_angles_normalize = 128 / Math.PI;
const angles_normalize = 16384 / Math.PI;
const offsets_normalize = 64;
const texcoord_normalize = 65535;
const size_normalize = 128; // width/height are 8.8 fixed-point, but are halved (so multiply by 128 instead of 256)

// These index values map a 4-element vertex position counter from this pattern (used for size and UVs):
//  [min_x, min_y, max_x, max_y]
// to this pattern:
//  [min_x, min_y],
//  [max_x, min_y],
//  [max_x, max_y],
//  [min_x, max_y]
const ix = [0, 2, 2, 0];
const iy = [1, 1, 3, 3];
const shape = new Array(4); // single, reusable allocation

// Build a billboard sprite quad centered on a point. Sprites are intended to be drawn in screenspace, and have
// properties for width, height, angle, and texture UVs. Curved label segment sprites have additional properties
// for interpolating their position and angle across zooms.
export function buildQuadForPoint (
    point,
    vertex_data,
    vertex_template,
    vindex,
    size,
    offset,
    offsets,
    pre_angles,
    angle,
    angles,
    texcoords,
    curve) {

    // Half-sized point dimensions in fixed point
    const w2 = size[0] * size_normalize;
    const h2 = size[1] * size_normalize;
    shape[0] = -w2;
    shape[1] = -h2;
    shape[2] = w2;
    shape[3] = h2;

    const uvs = texcoords || default_uvs;

    const vertex_elements = vertex_data.vertex_elements;
    let element_offset = vertex_data.vertex_count;

    for (let p=0; p < 4; p++) {
        vertex_template[vindex.a_position + 0] = point[0];
        vertex_template[vindex.a_position + 1] = point[1];

        vertex_template[vindex.a_shape + 0] = shape[ix[p]];
        vertex_template[vindex.a_shape + 1] = shape[iy[p]];
        vertex_template[vindex.a_shape + 2] = angle;

        vertex_template[vindex.a_offset + 0] = offset[0];
        vertex_template[vindex.a_offset + 1] = offset[1];

        // Add texcoords
        if (vindex.a_texcoord) {
            vertex_template[vindex.a_texcoord + 0] = uvs[ix[p]] * texcoord_normalize;
            vertex_template[vindex.a_texcoord + 1] = uvs[iy[p]] * texcoord_normalize;
        }

        // Add curved label segment props
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

    return 2; // geom count is always two triangles, for one quad
}
