// Geometry building functions
import Geo from '../geo';

export const tile_bounds = [
    { x: 0, y: 0},
    { x: Geo.tile_scale, y: -Geo.tile_scale } // TODO: correct for flipped y-axis?
];

export const default_uvs = [0, 0, 1, 1];

// Tests if a line segment (from point A to B) is outside the tile bounds
// (within a certain tolerance to account for geometry nearly on tile edges)
export function outsideTile (_a, _b, tolerance) {
    let tile_min = tile_bounds[0];
    let tile_max = tile_bounds[1];

    // TODO: fix flipped Y coords here, confusing with 'max' reference
    if ((_a[0] <= tile_min.x + tolerance && _b[0] <= tile_min.x + tolerance) ||
        (_a[0] >= tile_max.x - tolerance && _b[0] >= tile_max.x - tolerance) ||
        (_a[1] >= tile_min.y - tolerance && _b[1] >= tile_min.y - tolerance) ||
        (_a[1] <= tile_max.y + tolerance && _b[1] <= tile_max.y + tolerance)) {
        return true;
    }

    return false;
}

export function isCoordOutsideTile (coord, tolerance) {
    tolerance = tolerance || 0;
    let tile_min = tile_bounds[0];
    let tile_max = tile_bounds[1];

    return coord[0] <= tile_min.x + tolerance ||
           coord[0] >= tile_max.x - tolerance ||
           coord[1] >= tile_min.y - tolerance ||
           coord[1] <= tile_max.y + tolerance;
}
