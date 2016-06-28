import RepeatGroup from './repeat_group';
import log from '../utils/log';
import boxIntersect from 'box-intersect'; // https://github.com/mikolalysenko/box-intersect
import OBB from '../utils/obb';

var Collision;
export default Collision = {
    num_labels: {},
    tiles: {},
    links: {},
    link_id: 0,

    nextLinkId() {
        return this.link_id++;
    },

    startTile(tile) {
        this.num_labels[tile] = {old : 0, new : 0};

        let state = this.tiles[tile] = {
            bboxes: {           // current set of placed bounding boxes
                aabb: [],
                obb: []
            },
            objects: {},        // objects to collide, grouped by priority, then by style
            keep: {},           // objects that were kept after collision, grouped by style
            styles: new Set()   // styles contributing collision objects
        };

        // Promise resolved when all registered styles have added objects
        state.complete = new Promise((resolve, reject) => {
            state.resolve = resolve;
            state.reject = reject;
        });
    },

    resetTile (tile) {
        delete this.tiles[tile];
    },

    // Add a style to the pending set, collision will block on all styles submitting to collision set
    addStyle (style, tile) {
        this.tiles[tile].styles.add(style);
    },

    // Add collision objects for a style
    collide (objects, style, tile) {
        let state = this.tiles[tile];
        if (!state) {
            log('trace', 'Collision.collide() called with null tile', tile, this.tiles, style, objects);
            return Promise.reject(Error('Collision.collide() called with null tile', tile, this.tiles, style, objects));
        }

        // Group by priority and style
        let tile_objects = state.objects;
        for (let i=0; i < objects.length; i++) {
            let obj = objects[i];
            let priority = obj.layout.priority;
            tile_objects[priority] = tile_objects[priority] || {};
            tile_objects[priority][style] = tile_objects[priority][style] || [];
            tile_objects[priority][style].push(obj);
        }

        // Remove from pending style set, if no more styles, do collision & finish tile
        state.styles.delete(style);
        if (state.styles.size === 0) {
            this.endTile(tile);
        }

        // Wait for objects to be added from all styles
        return state.complete.then(() => {
            return state.keep[style] || [];
        });
    },

    // Test labels for collisions, higher to lower priority
    // When two collide, discard the lower-priority label
    endTile (tile) {
        let state = this.tiles[tile];
        let bboxes = state.bboxes;
        let keep = state.keep;

        collideSerial.call(this, tile);
        // collideParallel.call(this, tile);

        delete this.tiles[tile];
        state.resolve();

        log('debug', '#labels per tile', tile, 'old:', this.num_labels[tile].old, 'new:', this.num_labels[tile].new);
    }

};

function collideParallel(tile, style_type) {
    let state = this.tiles[tile];
    let bboxes = state.bboxes;
    let keep = state.keep;

    var prevBoxes = [];
    let priorities = Object.keys(state.objects).sort((a, b) => b - a);

    for (let i = 0; i < priorities.length; i++) {
        let priority = priorities[i];
        let style_objects = state.objects[priority];

        if (!style_objects) { // no labels at this priority, skip to next
            continue;
        }

        var aabbs = [];
        var obbs = [];
        var styles = [];
        var objects = [];

        // group all styles together
        for (let style in style_objects) {
            if (style_type && style !== style_type) continue;

            let style_object = style_objects[style];
            for (let i = 0; i < style_object.length; i++) {
                let object = style_object[i];

                if (!object.layout.collide) {
                    if (!keep[style]) keep[style] = [];
                    keep[style].push(object);
                }
                else {
                    aabbs.push(object.label.aabb);
                    obbs.push(object.label.obb);
                    styles.push(style);
                    objects.push(object);
                }
            }
        }

        var currentIndices = findNonCollidedIndices(aabbs, obbs);
        var currentBoxes = currentIndices.map(function (index) {
            return aabbs[index];
        });

        if (prevBoxes.length) {
            // compare to previous priority boxes
            // lower priority - remove from current boxes
            boxIntersect(prevBoxes, currentBoxes, function (i, j) {
                currentIndices.splice(j, 1);
                currentBoxes.splice(j, 1);
            });

            for (let i = 0; i < currentIndices.length; i++) {
                var index = currentIndices[i];
                var style = styles[index];
                var object = objects[index];

                if (!keep[style]) keep[style] = [];
                keep[style].push(object);
            }

            prevBoxes = prevBoxes.concat(currentBoxes);
        }
        else {
            for (let i = 0; i < currentIndices.length; i++) {
                var index = currentIndices[i];
                var style = styles[index];
                var object = objects[index];

                if (!keep[style]) keep[style] = [];
                keep[style].push(object);
            }
            prevBoxes = currentBoxes;
        }

        this.num_labels[tile].new += currentBoxes.length;
    }
}

function collideSerial(tile, style_type) {
    let state = this.tiles[tile];
    let bboxes = state.bboxes;
    let keep = state.keep;

    RepeatGroup.clear(tile);

    // Process labels by priority, then by style
    let priorities = Object.keys(state.objects).sort((a, b) => b - a);
    for (let i = 0; i < priorities.length; i++) {
        let priority = priorities[i];
        let style_objects = state.objects[priority];

        if (!style_objects) { // no labels at this priority, skip to next
            continue;
        }

        // For each style
        for (let style in style_objects) {
            if (style_type && style_type !== style) continue;

            let objects = style_objects[style];
            keep[style] = keep[style] || [];

            for (let i = 0; i < objects.length; i++) {
                let { label, layout, link } = objects[i]; // TODO: `label` should be generic

                // Skip if linked label not visible
                if (link && this.links[link] === false) {
                    // log('trace', 'discard label because linked parent is not visible', label);
                    continue;
                }

                // test the label for intersections with other labels in the tile
                if (!layout.collide || !label.discard(bboxes)) {
                    // check for repeats
                    // let check = RepeatGroup.check(label, layout, tile);
                    // if (check) {
                    //     // log('trace', `discard label '${label.text}', (one_per_group: ${check.one_per_group}), dist ${Math.sqrt(check.dist_sq)/layout.units_per_pixel} < ${Math.sqrt(check.repeat_dist_sq)/layout.units_per_pixel}`);
                    //     continue;
                    // }
                    // // register as placed for future repeat culling
                    // RepeatGroup.add(label, layout, tile);

                    label.add(bboxes); // add label to currently visible set
                    keep[style].push(objects[i]);
                    this.num_labels[tile].old += 1;

                    if (link) {
                        this.links[link] = true; // mark visibility for linked labels
                    }
                }
                else if (layout.collide) {
                    // log('trace', `discard label '${label.text}' due to collision`);
                    if (link) {
                        this.links[link] = false; // mark visibility for linked labels
                    }
                }
            }
        }
    }
}


function findNonCollidedIndices(aabbs, obbs) {
    let graph = {};
    let has_collisions = false;
    let num_keys = 0;
    var non_collided_indices = [];

    for (var i = 0; i < aabbs.length; i++)
        non_collided_indices.push(i);

    // build the collision incidence graph
    boxIntersect(aabbs, function (i, j) {
        var obb1 = obbs[i];
        var obb2 = obbs[j];
        if ((obb1 === 0 && obb2 === 0) || OBB.intersect(obb1, obb2)) {
            if (graph[i] === undefined) {
                num_keys++;
                graph[i] = [j];
            }
            else graph[i].push(j);

            if (graph[j] === undefined) {
                num_keys++;
                graph[j] = [i];
            }
            else graph[j].push(i);
        }
    });

    // no collisions found. return all indices
    if (num_keys === 0) return non_collided_indices;

    let sorted_index_count = [];
    for (var target in graph){
        var store = [parseInt(target), graph[target].length];
        sorted_index_count.push(store);
    }

    sorted_index_count.sort(function(a,b){
        return b[1] - a[1];
    });

    while (num_keys > 0) {
        var indices = sorted_index_count.shift();

        var target = indices[0];
        var neighbors = graph[target];

        if (neighbors.length === 0) {
            continue;
        }

        while (neighbors.length) {
            var neighbor_index = neighbors.pop();

            var mirror = graph[neighbor_index];
            var index = mirror.indexOf(target);
            mirror.splice(index, 1);

            if (mirror.length === 0){
                num_keys--;
            }
        }

        var collided_index = non_collided_indices.indexOf(target);
        non_collided_indices.splice(collided_index, 1);

        delete graph[target];
        num_keys--;
    }

    return non_collided_indices;
}

function done(graph){
    for (var index in graph){
        if (graph[index].length !== 0) return false
    }
    return true;
}