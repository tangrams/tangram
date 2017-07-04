import log from './log';

const Task = {
    id: 0,
    queue: [],
    max_time: 2,
    start_time: null,

    add (task) {
        task.id = Task.id++;
        task.max_time = task.max_time || Task.max_time;
        let promise = new Promise((resolve, reject) => {
            task.resolve = resolve;
            task.reject = reject;
        });
        task.promise = promise;
        this.queue.push(task);

        // Run task immediately if under total frame time
        this.start_time = this.start_time || performance.now(); // start frame timer if necessary
        this.elapsed = performance.now() - this.start_time;
        // if (this.elapsed < Task.max_time) {
        //     log('debug', '*** RUNNING initial task ' + task.method);
            this.process(task);
        // }
        // else {
        //     log('debug', '*** SKIPPING initial task ' + task.method);
        // }

        return task.promise;
    },

    remove (task) {
        let idx = this.queue.indexOf(task);
        if (idx > -1) {
            this.queue.splice(idx, 1);
        }
    },

    process (task) {
        task.start_time = performance.now(); // start task timer
        return task.target[task.method](task);
    },

    processAll () {
        this.start_time = this.start_time || performance.now(); // start frame timer if necessary
        for (let i=0; i < this.queue.length; i++) {
            // Exceeded either total task time, or total frame time
            if (this.process(this.queue[i]) !== true) {
                // Check total frame time
                this.elapsed = performance.now() - this.start_time;
                if (this.elapsed >= Task.max_time) {
                    this.start_time = null; // reset frame timer
                    break;
                }
            }
        }

    },

    finish (task, value) {
        this.remove(task);
        task.resolve(value);
        return task.promise;
    },

    shouldContinue (task) {
        task.elapsed = performance.now() - task.start_time;
        this.elapsed = performance.now() - this.start_time;
        // return ((task.elapsed < task.max_time) && (this.elapsed < Task.max_time));
        return (this.elapsed < Task.max_time);
    },

    removeForTile (tile_key) {
        for (let idx = this.queue.length-1; idx >= 0; idx--) {
            if (this.queue[idx].tile_key === tile_key) {
                log('debug', `remove tasks for tile ${tile_key}`);
                this.queue.splice(idx, 1);
            }
        }
    },

    pendingForType (type) {
        return this.queue.some(x => x.type === type);
    }

};

export default Task;
