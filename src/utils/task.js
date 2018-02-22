// import log from './log';

const Task = {
    id: 0,              // unique id per task
    queue: [],          // current queue of outstanding tasks
    max_time: 20,       // default time in which all tasks should complete per frame
    start_time: null,   // start time for tasks in current frame
    state: {},          // track flags about environment state (ex: whether user is currently moving the view)

    add (task) {
        task.id = Task.id++;
        task.max_time = task.max_time || Task.max_time; // allow task to run for this much time (tasks have a global collective limit per frame, too)
        task.pause_factor = task.pause_factor || 1;     // pause tasks by this many frames when they run too long
        let promise = new Promise((resolve, reject) => {
            task.resolve = resolve;
            task.reject = reject;
        });
        task.promise = promise;

        task.total_elapsed = 0;
        task.stats = { calls: 0 };
        this.queue.push(task);

        // Run task immediately if under total frame time
        this.start_time = this.start_time || performance.now(); // start frame timer if necessary
        this.elapsed = performance.now() - this.start_time;
        if (this.elapsed < Task.max_time) {
            this.process(task);
        }

        return task.promise;
    },

    remove (task) {
        let idx = this.queue.indexOf(task);
        if (idx > -1) {
            this.queue.splice(idx, 1);
        }
    },

    process (task) {
        // Skip task while user is moving the view, if the task requests it
        // (for intensive tasks that lock the UI, like canvas rasterization)
        if (this.state.user_moving_view && task.user_moving_view === false) {
            // log('debug', `*** SKIPPING task id ${task.id}, ${task.type} while user is moving view`);
            return;
        }

        // Skip task if it's currently paused
        if (task.pause) {
            // log('debug', `*** PAUSING task id ${task.id}, ${task.type} (${task.pause})`);
            task.pause--;
            return true;
        }

        task.stats.calls++;
        task.start_time = performance.now(); // start task timer
        return task.run(task);
    },

    processAll () {
        this.start_time = this.start_time || performance.now(); // start frame timer if necessary
        for (let i=0; i < this.queue.length; i++) {
            // Exceeded either total task time, or total frame time
            let task = this.queue[i];

            if (this.process(task) !== true) {
                // If the task didn't complete, pause it for a task-specific number of frames
                // (can be disabled by setting pause_factor to 0)
                if (!task.pause) {
                    task.pause = (task.elapsed > task.max_time) ? task.pause_factor : 0;
                }
                task.total_elapsed += task.elapsed;
            }

            // Check total frame time
            this.elapsed = performance.now() - this.start_time;
            if (this.elapsed >= Task.max_time) {
                this.start_time = null; // reset frame timer
                break;
            }
        }

    },

    finish (task, value) {
        task.elapsed = performance.now() - task.start_time;
        task.total_elapsed += task.elapsed;
        // log('debug', `task type ${task.type}, tile ${task.id}, finish after ${task.stats.calls} calls, ${task.total_elapsed.toFixed(2)} elapsed`);
        this.remove(task);
        task.resolve(value);
        return task.promise;
    },

    cancel (task) {
        let val;

        if (task.cancel instanceof Function) {
            val = task.cancel(task); // optional cancel function
        }

        task.resolve(val || {}); // resolve with result of cancel function, or empty object
    },

    shouldContinue (task) {
        // Suspend task if it runs over its specific per-frame limit, or the global limit
        task.elapsed = performance.now() - task.start_time;
        this.elapsed = performance.now() - this.start_time;
        return ((task.elapsed < task.max_time) && (this.elapsed < Task.max_time));
    },

    removeForTile (tile_id) {
        for (let idx = this.queue.length-1; idx >= 0; idx--) {
            if (this.queue[idx].tile_id === tile_id) {
                // log('trace', `Task: remove tasks for tile ${tile_id}`);
                this.cancel(this.queue[idx]);
                this.queue.splice(idx, 1);
            }
        }
    },

    setState (state) {
        this.state = state;
    }

};

export default Task;
