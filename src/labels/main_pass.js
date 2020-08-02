import Label from './label';
import LabelPoint from './label_point';
import {LabelLineStraight} from './label_line';
import Collision from './collision';
import OBB from '../utils/obb';
import Geo from '../utils/geo';

let visible = {};       // currently visible labels
let prev_visible = {};  // previously visible labels (in last collision run)

export default async function mainThreadLabelCollisionPass (tiles, view_zoom, hide_breach = false) {
    // Swap/reset visible label set
    prev_visible = visible; // save last visible label set
    visible = {};           // initialize new visible label set

    // Build label containers from tiles
    let containers = buildLabels(tiles, view_zoom);

    // Collide all labels in a single group
    // TODO: maybe rename tile and style to group/subgroup?
    Collision.startTile('main', { apply_repeat_groups: true, return_hidden: true });
    Collision.addStyle('main', 'main');

    // Adaptive collision grid, using a heuristic based on the tile with the most labels
    const max_tile_label_count =
        Math.max(0, ...Object.values(tiles)
            .map(t => Object.values(t.meshes))
            .flat()
            .map(meshes => Math.max(0, ...meshes.map(mesh => mesh.labels ? Object.keys(mesh.labels).length : 0)))
        );

    const grid_divs = Math.floor(max_tile_label_count / Geo.tile_size); // heuristic of label density to tile size
    if (grid_divs > 0) {
        Collision.initGrid({
            anchor: { x: Math.min(...tiles.map(t => t.min.x)), y: Math.min(...tiles.map(t => t.min.y)) },
            span: tiles[0].span.x / grid_divs
        });
    }
    else {
        Collision.initGrid();
    }

    const labels = await Collision.collide(containers, 'main', 'main');

    // Update label visiblity
    let meshes = [];
    labels.forEach(container => {
        // Hide breach labels (those that cross tile boundaries) while tiles are loading, unless they
        // were previously visible (otherwise fully loaded/collided breach labels will flicker in and out
        // when new tiles load, even if they aren't adjacent)
        let show = 0;
        if (container.show === true &&
            (!hide_breach || !container.label.breach || prev_visible[container.label.id])) {
            show = 1;
        }

        if (show) {
            visible[container.label.id] = true; // track visible labels
        }

        let changed = true; // check if label visibility changed on this collision pass

        container.ranges.forEach(r => {
            if (!changed) {
                return; // skip rest of label if state hasn't changed
            }

            let mesh = container.mesh;
            if (!mesh.valid) {
                return;
            }

            let off = mesh.vertex_layout.offset.a_shape; // byte offset (within each vertex) of attribute
            let stride = mesh.vertex_layout.stride;      // byte stride per vertex

            for (let i=0; i < r[1]; i++) {
                // NB: +6 is because attribute is a short int (2 bytes each), and we're skipping to 3rd element, 6=3*2
                if (mesh.vertex_data[r[0] + i * stride + off + 6] === show) {
                    changed = false;
                    return; // label hasn't changed states, skip further updates
                }
                mesh.vertex_data[r[0] + i * stride + off + 6] = show;
            }

            if (meshes.indexOf(mesh) === -1) {
                meshes.push(mesh);
            }
        });
    });

    // Upload updated meshes and make them visible
    meshes.forEach(mesh => mesh.upload());
    tiles.forEach(t => t.swapPendingLabels());

    return { labels, containers }; // currently returned for debugging
}

function buildLabels (tiles, view_zoom) {
    const labels = {};
    let containers = {};

    // Collect labels from each tile and turn into new label instances
    tiles.forEach(tile => {
        const units_per_meter = Geo.unitsPerMeter(tile.coords.z); // scale from tile units to mercator meters
        const zoom_scale = Math.pow(2, view_zoom - tile.style_z); // adjust label size by view zoom
        const size_scale = units_per_meter * zoom_scale; // scale from tile units to zoom-adjusted meters
        const meters_per_pixel = Geo.metersPerPixel(view_zoom);

        // First pass: create label instances and centralize collision containers
        // Combine existing (previously collided) and pending (waiting to be collided for first time) meshes
        const tile_meshes = Object.assign({}, tile.meshes, tile.pending_label_meshes);
        for (let style in tile_meshes) {
            const meshes = tile_meshes[style];
            meshes.forEach(mesh => {
                if (mesh.labels) {
                    for (let label_id in mesh.labels) {
                        // For proxy tiles, only allow visible labels to be *hidden* by further collisions,
                        // don't allow new ones to appear. Promotes label stability and prevents thrash
                        // from different labels (often not thematically relevant given the different zoom level of
                        // the proxy tile content, e.g. random POIs popping in/out when zooming out to city-wide view).
                        if (tile.isProxy() && !prev_visible[label_id]) {
                            continue;
                        }

                        const params = mesh.labels[label_id].container.label;
                        const linked = mesh.labels[label_id].container.linked;
                        const ranges = mesh.labels[label_id].ranges;
                        // const debug = Object.assign({}, mesh.labels[label_id].debug, { tile, params, label_id });

                        let label = labels[label_id] = {};
                        label.discard = discard.bind(label);
                        label.build_id = tile.build_id; // original order in which tiles were built

                        Object.assign(label, params);
                        label.layout = Object.assign({}, params.layout); // TODO: ideally remove need to copy props here
                        label.layout.repeat_scale = 0.75; // looser second pass on repeat groups, to weed out repeats near tile edges
                        label.layout.repeat_distance = label.layout.repeat_distance || 0;
                        label.layout.repeat_distance /= size_scale; // TODO: where should this be scaled?
                        label.position = [ // don't overwrite referenced values
                            label.position[0] / units_per_meter + tile.min.x,
                            label.position[1] / units_per_meter + tile.min.y
                        ];
                        label.unit_scale = meters_per_pixel;

                        if (label.type === 'point') { // TODO: move to integer constants to avoid excess string copies
                            LabelPoint.prototype.updateBBoxes.call(label);
                        }
                        else if (label.type === 'straight') {
                            LabelLineStraight.prototype.updateBBoxes.call(label, label.position, label.size, label.angle, label.angle, label.offset);
                        }
                        else if (params.obbs) {
                            // NB: this is a very rough approximation of curved label collision at intermediate zooms,
                            // because the position/scale of each collision box isn't correctly updated; however,
                            // it's good enough to provide some additional label coverage, with less overhead
                            const obbs = params.obbs.map(o => {
                                let { x, y, a, w, h } = o;
                                x = x / units_per_meter + tile.min.x;
                                y = y / units_per_meter + tile.min.y;
                                w /= size_scale;
                                h /= size_scale;
                                return new OBB(x, y, a, w, h);
                            });
                            label.obbs = obbs;
                            label.aabbs = obbs.map(o => o.getExtent());
                        }

                        containers[label_id] = {
                            label,
                            linked,
                            ranges,
                            mesh,
                            // debug
                        };
                    }
                }
            });
        }
    });

    // Resolve links between label containers
    for (let c in containers) {
        const container = containers[c];
        if (container.linked) {
            container.linked = containers[container.linked];
        }
        // NB: if linked label not found, it was discarded in initial tile collision pass
    }

    // Convert container map to array
    containers = Object.keys(containers).map(k => containers[k]);
    return containers;
}

// Generic discard function for labels, does simple occlusion with one or more bounding boxes
// (no additional logic to try alternate anchors or other layout options, etc.)
function discard (bboxes, exclude = null) {
    if (this.obb) { // single collision box
        return Label.prototype.occluded.call(this, bboxes, exclude);
    }
    else if (this.obbs) { // mutliple collision boxes
        for (let i = 0; i < this.obbs.length; i++){
            let aabb = this.aabbs[i];
            let obb = this.obbs[i];
            let obj = { aabb, obb };

            let should_discard = Label.prototype.occluded.call(obj, bboxes, exclude);
            if (should_discard) {
                return true;
            }
        }
    }
    return false;
}
