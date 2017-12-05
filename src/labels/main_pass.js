import Label from './label';
import LabelPoint from './label_point';
import {LabelLineBase, LabelLineStraight} from './label_line';
import Collision from './collision';
import OBB from '../utils/obb';
import Geo from '../geo';
import Tile from '../tile';

export default function mainThreadLabelCollisionPass (tiles, view_zoom, { show }) {
    const labels = {};
    let containers = {};

    // const min_zoom = tiles.reduce((p, t) => Math.min(p, t.coords.z), Infinity); // find minimum source zoom
    // const anchor_tile = tiles.filter(t => t.coords.z === min_zoom)[0]; // pick an anchor tile (any tile at min zoom)

    // sort tiles by key for consistency collision order
    tiles.sort((a, b) => a.key < b.key ? -1 : (a.key > b.key ? 1 : 0));

    // collect labels from each tile
    tiles.forEach(tile => {
        const units_per_meter = Geo.unitsPerMeter(tile.coords.z);    // scale from tile units to mercator meters
        const zf = Math.min(Math.max(view_zoom - tile.style_zoom, 0), 0.99);
        const zoom_scale = Math.pow(2, view_zoom - tile.style_zoom); // adjust label size by view zoom
        const size_scale = units_per_meter * zoom_scale;             // scale from tile units to zoom-adjusted meters
        const meters_per_pixel = Geo.metersPerPixel(view_zoom);

        // const zd = Math.pow(2, tile.coords.z - min_zoom);
        // const az = Tile.coordinateAtZoom(anchor_tile.coords, tile.coords.z);
        // const anchor_delta = {
        //     x: (tile.coords.x - az.x) * Geo.tile_scale / zd,
        //     y: (tile.coords.y - az.y) * Geo.tile_scale / zd
        // };
        // console.log(anchor_delta);

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
                            label.layout.repeat_distance = label.layout.repeat_distance || 0;
                            label.layout.repeat_distance /= size_scale; // TODO: where should this be scaled?

                            label.position = [ // don't overwrite referenced values
                                label.position[0] / units_per_meter + tile.min.x,
                                label.position[1] / units_per_meter + tile.min.y
                            ];
                            label.unit_scale = meters_per_pixel;

                            // if (params.obb) {
                            if (label.type === 'point') { // TODO: move to integer constants to avoid excess string copies
                                // let {x, y, a, w, h} = params.obb;
                                // x = x / units_per_meter + tile.min.x;
                                // y = y / units_per_meter + tile.min.y;
                                // w /= size_scale;
                                // h /= size_scale;

                                // x = x / zd + anchor_delta.x;
                                // y = y / zd + anchor_delta.y;
                                // w /= zd;
                                // h /= zd;

                                // const obb = new OBB(x, y, a, w, h);
                                // label.obb = obb;
                                // label.aabb = obb.getExtent();
                                // label.aabb.debug = debug;
                                // label.position = obb.centroid;

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

                                // label.position = [
                                //     params.position[0] / units_per_meter + tile.min.x,
                                //     params.position[1] / units_per_meter + tile.min.y
                                // ];

                                // const num_stops = 4;
                                // let s = Math.floor(zf * num_stops);

                            // let position = positions[i];
                            // let pre_angle = pre_angles[i];
                            // let width = label_lengths[i];
                            // let angle_segment = pre_angle + angles[i];
                            // let angle_offset = this.angle;

                                // const obbs = params.obbs.map((o, i) => {
                                //     try {
                                //     let {w, h} = o;
                                //     w = w / units_per_meter / meters_per_pixel;
                                //     h = h / units_per_meter / meters_per_pixel;

                                //     let angle_segment = label.pre_angles[i][s] + label.angles[i][s];
                                //     let obb = LabelLineBase.createOBB(label.positions[i][s], w, h, angle_segment, label.angle, label.offset, meters_per_pixel);
                                //     return obb;
                                //     } catch(e){ debugger }
                                // });

                                // try {
                                // let stop_scale = Math.pow(2, s / num_stops);

                                // const obbs = params.obb_stops[s].map(o => {
                                //     // let {x, y, a, w, h} = o;
                                //     // x = x / units_per_meter + tile.min.x;
                                //     // y = y / units_per_meter + tile.min.y;
                                //     // w /= units_per_meter / stop_scale;
                                //     // h /= units_per_meter / stop_scale;

                                //     // x = x / zd + anchor_delta.x;
                                //     // y = y / zd + anchor_delta.y;
                                //     // w /= zd;
                                //     // h /= zd;

                                //     // return new OBB(x, y, a, w, h);
                                //     // debugger
                                //     let {position, width, height, angle_segment, angle_offset} = o;
                                //     position = [
                                //         position[0] / units_per_meter + tile.min.x,
                                //         position[1] / units_per_meter + tile.min.y
                                //     ];
                                //     width /= units_per_meter * stop_scale;
                                //     height /= units_per_meter * stop_scale;

                                //     return LabelLineBase.createOBB(position, width, height, angle_segment, angle_offset, label.offset, size_scale);
                                // });

                                // label.obbs = obbs;
                                // label.aabbs = obbs.map(o => o.getExtent());
                                // } catch(e){ debugger }
                            }

                            // containers.push({
                            containers[label_id] = {
                                label,
                                linked,
                                ranges,
                                mesh,
                                debug
                            };
                            // });
                        }
                    }
                }
            });
        }
    });

    // Second pass: point linked label containers to each other
    for (let c in containers) {
        const container = containers[c];
        if (container.linked) {
            container.linked = containers[container.linked];
            // TODO: error if not found?
            // if (!container.linked) debugger;
        }
    }

    // return labels;
    // return Object.keys(labels).map(k => ({ label: labels[k] }));
    // return containers;
    // return Object.keys(containers).map(k => containers[k]);
    containers = Object.keys(containers).map(k => containers[k]);

    // setup a simple collision group
    // // TODO: maybe rename tile and style to group/subgroup?
    Collision.startTile('main', { repeat_group_max_dist: Infinity, apply_repeat_groups: true, return_hidden: true });
    Collision.addStyle('main', 'main');
    // return Collision.collide(containers, 'main', 'main').then(labels => ({ labels, containers }));

    return Collision.collide(containers, 'main', 'main').then(labels => {
        let meshes = [];
        labels.hide.forEach(c => c.ranges.forEach(r => {
            let mesh = c.mesh;
            let off = mesh.vertex_layout.attribs.find(a => a.name === 'a_shape').offset; // TODO replace find (or polyfill)
            let stride = mesh.vertex_layout.stride;
            for (let i=0; i < r[1]; i++) {
                mesh.vertex_data[r[0] + i * stride + off + 3*2] = show ? 1 : 0; // NB: *2 is because attribute is a short int
            }

            // debug: color in semi-transparent red
            if (show) {
                off = mesh.vertex_layout.attribs.find(a => a.name === 'a_color').offset;
                stride = mesh.vertex_layout.stride;
                for (let i=0; i < r[1]; i++) {
                    mesh.vertex_data[r[0] + i * stride + off + 3] = 128;
                    mesh.vertex_data[r[0] + i * stride + off + 0] = 255;
                    mesh.vertex_data[r[0] + i * stride + off + 1] = 0;
                    mesh.vertex_data[r[0] + i * stride + off + 2] = 0;
                }
            }

            if (meshes.indexOf(mesh) === -1) {
                meshes.push(mesh);
            }
        }));

        labels.show.forEach(c => c.ranges.forEach(r => {
            let mesh = c.mesh;
            let off = mesh.vertex_layout.attribs.find(a => a.name === 'a_shape').offset;
            let stride = mesh.vertex_layout.stride;
            for (let i=0; i < r[1]; i++) {
                mesh.vertex_data[r[0] + i * stride + off + 3*2] = 1; // NB: *2 is because attribute is a short int
            }

            if (meshes.indexOf(mesh) === -1) {
                meshes.push(mesh);
            }
        }));

        meshes.forEach(mesh => mesh.upload());
        return { labels, containers };
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
