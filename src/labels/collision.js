import Label from './label';
import RepeatGroup from './repeat_group';
import CollisionGrid from './collision_grid';
import log from '../utils/log';

const Collision = {

    tiles: {},
    grid: null, // no collision grid by default

    initGrid (options) {
        if (options == null) {
            this.grid = null;
        }
        else {
            this.grid = new CollisionGrid(options.anchor, options.span);
        }
    },

    startTile (tile, { apply_repeat_groups = true, return_hidden = false } = {}) {
        let state = this.tiles[tile] = {
            bboxes: {           // current set of placed bounding boxes
                aabb: [],
                obb: []
            },
            objects: {},        // objects to collide, grouped by priority, then by style
            labels: {},         // objects post-collision, grouped by style, marked as show/hide
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
            this.tiles[tile].resolve([]);
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
            return Promise.resolve([]);
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
            return state.labels[style] || [];
        });
    },

    // Test labels for collisions, higher to lower priority
    // When two collide, hide the lower-priority label
    endTile (tile) {
        let state = this.tiles[tile];
        let labels = state.labels;

        if (this.grid) {
            this.addLabelsToGrid(tile);
        }

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
                labels[style] = labels[style] || [];

                for (let i = 0; i < objects.length; i++) {
                    let object = objects[i];
                    if (this.canBePlaced(object, tile, object.linked, state)) {
                        // show object if it isn't dependent on a parent object
                        if (!object.linked) {
                            object.show = true;
                            labels[style].push(object);
                            this.place(object, tile, state);
                        }
                        // If object is dependent on a parent, only show if both can be placed
                        else if (this.canBePlaced(object.linked, tile, object, state)) {
                            object.show = true;

                            // If a label is breach, its linked label should be considered breach as well
                            // (this keeps linked labels (in)visible in tandem)
                            if (object.label.breach || object.linked.label.breach) {
                                object.label.breach = true;
                                object.linked.label.breach = true;
                            }

                            // Similarly for labels that need main thread repeat culling, keep linked labels in sync
                            if (object.label.may_repeat_across_tiles || object.linked.label.may_repeat_across_tiles) {
                                object.label.may_repeat_across_tiles = true;
                                object.linked.label.may_repeat_across_tiles = true;
                            }

                            labels[style].push(object);
                            this.place(object, tile, state);
                            this.place(object.linked, tile, state);
                        }
                        else if (state.return_hidden) {
                            object.show = false;
                            labels[style].push(object);
                        }
                    }
                    else if (state.return_hidden) {
                        object.show = false;
                        labels[style].push(object);
                    }
                }
            }
        }

        delete this.tiles[tile];
        state.resolve();
    },

    addLabelsToGrid (tile_id) {
        // Process labels by priority, then by style
        const tile = this.tiles[tile_id];
        for (const priority in tile.objects) {
            const style_objects = tile.objects[priority];
            if (!style_objects) { // no labels at this priority, skip to next
                continue;
            }

            // For each style
            for (const style in style_objects) {
                const objects = style_objects[style];
                objects.forEach(object => this.grid.addLabel(object.label));
            }
        }
    },

    // Run collision and repeat check to see if label can currently be placed
    canBePlaced (object, tile, exclude = null, { repeat = true } = {}) {
        let label = object.label;
        let layout = object.label.layout;

        // Skip if already processed (e.g. by parent object)
        if (label.placed != null) {
            return label.placed;
        }

        let placeable = !layout.collide;
        if (!placeable) {
            // Test the label for intersections with other labels
            if (this.grid && label.cells) {
                // test label candidate against labels placed in each grid cell
                placeable = label.cells.reduce((keep, cell) => {
                    if (keep && label.discard(cell, exclude && exclude.label)) {
                        keep = false;
                    }
                    return keep;
                }, true);
            }
            else {
                placeable = !label.discard(this.tiles[tile].bboxes, exclude && exclude.label);
            }
        }

        if (placeable) {
            // repeat culling with nearby labels
            if (repeat && RepeatGroup.check(label, layout, tile)) {
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

        if (this.grid && label.cells) {
            label.cells.forEach(cell => Label.add(label, cell));
        }
        else {
            Label.add(label, this.tiles[tile].bboxes);
        }
    }

};

export default Collision;
