import Label from './label';
import LabelPoint from './label_point';
import {LabelLineStraight} from './label_line';
import Collision from './collision';
import OBB from '../utils/obb';
import Geo from '../geo';
// import Tile from '../tile';

export default function mainThreadLabelCollisionPass (tiles, view_zoom) {
    const labels = {};
    let containers = {};

    // Collect labels from each tile and turn into new label instances
    tiles.forEach(tile => {
        const units_per_meter = Geo.unitsPerMeter(tile.coords.z);    // scale from tile units to mercator meters
        // const zf = Math.min(Math.max(view_zoom - tile.style_zoom, 0), 0.99);
        const zoom_scale = Math.pow(2, view_zoom - tile.style_zoom); // adjust label size by view zoom
        const size_scale = units_per_meter * zoom_scale;             // scale from tile units to zoom-adjusted meters
        const meters_per_pixel = Geo.metersPerPixel(view_zoom);

        // First pass: create label instances and centralize collision containers
        for (let style in tile.meshes) {
            const meshes = tile.meshes[style];
            meshes.forEach(mesh => {
                if (mesh.labels) {
                    for (let label_id in mesh.labels) {
                        if (!labels[label_id]) {
                            const params = mesh.labels[label_id].container.label;
                            const linked = mesh.labels[label_id].container.linked;
                            const ranges = mesh.labels[label_id].ranges;
                            const debug = Object.assign({}, mesh.labels[label_id].debug, {tile, params, label_id});

                            // if (debug.id == 37043262) debugger;

                            let label = labels[label_id] = {};
                            label.discard = discard.bind(label);

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

                            // if (params.obb) {
                            if (label.type === 'point') { // TODO: move to integer constants to avoid excess string copies
                                LabelPoint.prototype.updateBBoxes.call(label);
                            }
                            else if (label.type === 'straight') {
                                LabelLineStraight.prototype.updateBBoxes.call(label, label.position, label.size, label.angle, label.angle, label.offset);
                            }
                            else if (params.obbs) {
                                // NB: this is a very rough approximation of curved label collision at intermediate zooms,
                                // becuase the position/scale of each collision box isn't correctly updated; however,
                                // it's good enough to provide some additional label coverage, with less overhead
                                const obbs = params.obbs.map(o => {
                                    let {x, y, a, w, h} = o;
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
                                debug
                            };
                        }
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

    // Collide all labels in a single group
    // TODO: maybe rename tile and style to group/subgroup?
    Collision.startTile('main', { apply_repeat_groups: true, return_hidden: true });
    Collision.addStyle('main', 'main');

    return Collision.collide(containers, 'main', 'main').then(labels => {
        let meshes = [];
        labels.forEach(container => {
            let changed = true;
            let show = (container.show === true) ? 1 : 0;

            container.ranges.forEach(r => {
                if (!changed) {
                    return; // skip rest of label if state hasn't changed
                }

                let mesh = container.mesh;
                let off = mesh.vertex_layout.attribs.find(a => a.name === 'a_shape').offset; // TODO replace find (or polyfill)
                let stride = mesh.vertex_layout.stride;

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

        meshes.forEach(mesh => mesh.upload());
        tiles.forEach(t => t.swapPendingLabels());

        return { labels, containers }; // currently returned for debugging
    });
}

// Generic discard function for labels, does simple occlusion with one or more bounding boxes
// (no additional logic to try alternate anchors or other layour options, etc.)
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
