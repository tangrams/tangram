import Label from './label';
import RepeatGroup from './repeat_group';
import log from '../utils/log';

var Collision;

export default Collision = {

    tiles: {},

    startTile (tile, { apply_repeat_groups = true, return_hidden = false } = {}) {
        let state = this.tiles[tile] = {
            bboxes: {           // current set of placed bounding boxes
                aabb: [],
                obb: []
            },
            objects: {},        // objects to collide, grouped by priority, then by style
            show: {},           // objects that were kept after collision, grouped by style
            hide: {},
            styles: {},         // styles contributing collision objects
            repeat: apply_repeat_groups,
            return_hidden
        };

        // Promise resolved when all registered styles have added objects
        if (state.complete == null) {
            state.complete = new Promise((resolve, reject) => {
                state.resolve = resolve;
                state.reject = reject;
            });
        }
    },

    resetTile (tile) {
        delete this.tiles[tile];
    },

    abortTile (tile) {
        if (this.tiles[tile] && this.tiles[tile].resolve) {
            this.tiles[tile].resolve({ show: [], hide: [] });
        }
        this.resetTile(tile);
    },

    // Add a style to the pending set, collision will block on all styles submitting to collision set
    addStyle (style, tile) {
        this.tiles[tile].styles[style] = true;
    },

    // Add collision objects for a style
    collide (objects, style, tile) {
        let state = this.tiles[tile];
        if (!state) {
            log('trace', 'Collision.collide() called with null tile', tile, this.tiles, style, objects);
            return Promise.resolve({ show: [], hide: [] });
        }

        // Group by priority and style
        let tile_objects = state.objects;
        for (let i=0; i < objects.length; i++) {
            let obj = objects[i];
            let priority = obj.label.layout.priority;
            tile_objects[priority] = tile_objects[priority] || {};
            tile_objects[priority][style] = tile_objects[priority][style] || [];
            tile_objects[priority][style].push(obj);
        }

        // Remove from pending style set, if no more styles, do collision & finish tile
        delete state.styles[style];
        if (Object.keys(state.styles).length === 0) {
            this.endTile(tile);
        }

        // Wait for objects to be added from all styles
        return state.complete.then(() => {
            state.resolve = null;
            return {
                show: state.show[style] || [],
                hide: (state.return_hidden && (state.hide[style] || []))
            };
        });
    },

    // Test labels for collisions, higher to lower priority
    // When two collide, hide the lower-priority label
    endTile (tile) {
        let state = this.tiles[tile];
        let show = state.show;
        let hide = state.hide;

        if (state.repeat) {
            RepeatGroup.clear(tile);
        }

        // Process labels by priority, then by style
        let priorities = Object.keys(state.objects).sort((a, b) => a - b);
        for (let p=0; p < priorities.length; p++) {
            let style_objects = state.objects[priorities[p]];
            if (!style_objects) { // no labels at this priority, skip to next
                continue;
            }

            // For each style
            for (let style in style_objects) {
                let objects = style_objects[style];
                show[style] = show[style] || [];
                hide[style] = hide[style] || [];

                for (let i = 0; i < objects.length; i++) {
                    let object = objects[i];
                    if (this.canBePlaced(object, tile, object.linked, state)) {
                        // show object if it isn't dependent on a parent object
                        if (!object.linked) {
                            show[style].push(object);
                            this.place(object, tile, state);
                        }
                        // If object is dependent on a parent, only show if both can be placed
                        else if (this.canBePlaced(object.linked, tile, object, state)) {
                            show[style].push(object);
                            this.place(object, tile, state);
                            this.place(object.linked, tile, state);
                        }
                        else if (state.return_hidden) {
                            hide[style].push(object);
                        }
                    }
                    else if (state.return_hidden) {
                        hide[style].push(object);
                    }
                }
            }
        }

        delete this.tiles[tile];
        state.resolve();
    },

    // Run collision and repeat check to see if label can currently be placed
    canBePlaced (object, tile, exclude = null, { repeat = true } = {}) {
        let label = object.label;
        let layout = object.label.layout;

        // Skip if already processed (e.g. by parent object)
        if (label.placed != null) {
            return label.placed;
        }

        // Test the label for intersections with other labels in the tile
        let bboxes = this.tiles[tile].bboxes;
        if (!layout.collide || !label.discard(bboxes, exclude && exclude.label)) {
            // check for repeats
            let is_repeat = repeat && RepeatGroup.check(label, layout, tile);
            if (is_repeat) {
                // log('trace', `hide label '${label.text}', dist ${Math.sqrt(is_repeat.dist_sq)/layout.units_per_pixel} < ${Math.sqrt(is_repeat.repeat_dist_sq)/layout.units_per_pixel}`);
                label.placed = false;
            }
            else {
                return true;
            }
        }
        else if (layout.collide) {
            // log('trace', `hide label '${label.text}' due to collision`);
            label.placed = false;
        }
        return label.placed;
    },

    // Place label
    place ({ label }, tile, { repeat = true }) {
        // Skip if already processed (e.g. by parent object)
        if (label.placed != null) {
            return;
        }

        // Register as placed for future collision and repeat culling
        if (repeat) {
            RepeatGroup.add(label, label.layout, tile);
        }
        Label.add(label, this.tiles[tile].bboxes);
    }

};
