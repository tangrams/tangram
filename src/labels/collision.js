import RepeatGroup from './repeat_group';
import log from '../utils/log';

var Collision;

export default Collision = {

    tiles: {},
    links: {},
    link_id: 0,

    nextLinkId() {
        return this.link_id++;
    },

    startTile (tile) {
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

        RepeatGroup.clear(tile);

        // Process labels by priority, then by style
        let priorities = Object.keys(state.objects).sort((a, b) => a - b);
        for (let priority of priorities) {
            let style_objects = state.objects[priority];
            if (!style_objects) { // no labels at this priority, skip to next
                continue;
            }

            // For each style
            for (let style in style_objects) {
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
                        let check = RepeatGroup.check(label, layout, tile);
                        if (check) {
                            // log('trace', `discard label '${label.text}', (one_per_group: ${check.one_per_group}), dist ${Math.sqrt(check.dist_sq)/layout.units_per_pixel} < ${Math.sqrt(check.repeat_dist_sq)/layout.units_per_pixel}`);
                            continue;
                        }
                        // register as placed for future repeat culling
                        RepeatGroup.add(label, layout, tile);

                        label.add(bboxes); // add label to currently visible set
                        keep[style].push(objects[i]);

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

        delete this.tiles[tile];
        state.resolve();
    }

};
