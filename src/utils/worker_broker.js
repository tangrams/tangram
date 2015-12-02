/*jshint worker: true*/

// WorkerBroker routes messages between web workers and the main thread, allowing for simpler
// async code via promises. Example usage:
//
// In web worker, register self as target define a method:
//
//     WorkerBroker.addTarget('self', self);
//
//     self.square = function (x) {
//         return x * x;
//     };
//
// In main thread, invoke that method and receive the result (if any) as a promise:
//
//     worker = new Worker(...);
//     WorkerBroker.addWorker(worker);
//
//     WorkerBroker.postMessage(worker, 'self.square', 5).then(function(y) {
//         console.log(y);
//     });
//
//     -> prints 25
//
// Async code:
//
// For synchronous code that must pass a return value to the main thread, the function can simply
// return an immediate value (see example above). For cases where the worker method needs to run
// asynchronous code, the function can return a promise, and the resolved or rejected value will
// be sent back to the main thread when the promise is fulfilled.
//
// Error handling:
//
// If the worker method either throws an error, or returns a promise that is rejected, it will be
// sent back to the main thread as a promise rejection. These two examples are equivalent:
//
//     In worker, throwing an error:
//
//         self.broken = function () {
//             throw new Error('error in worker!');
//         };
//
//     In worker, returning a rejected promise:
//
//         self.broken = function () {
//             return Promise.reject(new Error('error in worker!'));
//         };
//
//     In main thread, both errors are received as a promise rejection:
//
//         WorkerBroker.postMessage(worker, 'self.broken').then(
//             // Promise resolved
//             function() {
//                 console.log('success!');
//             },
//             // Promise rejected
//             function(error) {
//                 console.log('error!', error);
//             });
//
//         -> prints 'error! error in worker'
//
// Calling from worker to main thread:
//
// The same style of calls can be made *from* a web worker, to the main thread. The API is the same
// with the exception that the first argument, 'worker', is not needed for WorkerBroker.postMessage(),
// since the main thread is the implicit target.
//
// In main thread, define a method and register it:
//
//     var geometry = {
//         length: function(x, y) {
//             return Math.sqrt(x * x + y * y);
//         }
//     };
//
//     WorkerBroker.addTarget('geometry', geometry);
//
// In worker thread:
//
//     WorkerBroker.postMessage('geometry.length', 3, 4).then(function(d) {
//         console.log(d);
//     });
//
//     -> prints 5
//

import Utils from './utils';

var WorkerBroker;
export default WorkerBroker = {};

// Global list of all worker messages
// Uniquely tracks every call made between main thread and a worker
var message_id = 0;
var messages = {};

// Register an object to receive calls from other thread
var targets = {};
WorkerBroker.addTarget = function (name, target) {
    targets[name] = target;
};

// Given a dot-notation-style method name, e.g. 'Object.object.method',
// find the object to call the method on from the list of registered targets
function findTarget (method) {
    var chain = [];
    if (typeof method === 'string') {
        chain = method.split('.');
        method = chain.pop();
    }

    // target = target || (Utils.isMainThread && window) || (Utils.isWorkerThread && self);
    var target = targets;

    for (let m=0; m < chain.length; m++) {
        if (target[chain[m]]) {
            target = target[chain[m]];
        }
        else {
            return [];
        }
    }

    return [method, target];
}

// Main thread:
// - Send messages to workers, and optionally receive an async response as a promise
// - Receive messages from workers, and optionally send an async response back as a promise
function setupMainThread () {

    // Send a message to a worker, and optionally get an async response
    // Arguments:
    //   - worker: one or more web worker instances to send the message to (single value or array)
    //   - method: the method with this name, specified with dot-notation, will be invoked in the worker
    //   - message: will be passed to the method call
    // Returns:
    //   - a promise that will be fulfilled if the worker method returns a value (could be immediately, or async)
    //
    WorkerBroker.postMessage = function (worker, method, ...message) {
        // If more than one worker specified, post to multiple
        if (Array.isArray(worker)) {
            return Promise.all(
                worker.map(w => WorkerBroker.postMessage(w, method, ...message))
            );
        }

        // Track state of this message
        var promise = new Promise((resolve, reject) => {
            messages[message_id] = { method, message, resolve, reject };
        });

        worker.postMessage({
            type: 'main_send',      // mark message as method invocation from main thread
            message_id,             // unique id for this message, for life of program
            method,                 // will dispatch to a function of this name within the worker
            message                 // message payload
        });

        message_id++;
        return promise;
    };

    // Add a worker to communicate with - each worker must be registered from the main thread
    var worker_id = 0;
    var workers = new Map();

    WorkerBroker.addWorker = function (worker) {

        // Keep track of all registered workers
        workers.set(worker, worker_id++);

        // Listen for messages coming back from the worker, and fulfill that message's promise
        worker.addEventListener('message', (event) => {
            if (event.data.type !== 'worker_reply') {
                return;
            }

            // Pass the result to the promise
            var id = event.data.message_id;
            if (messages[id]) {
                if (event.data.error) {
                    messages[id].reject(event.data.error);
                }
                else {
                    messages[id].resolve(event.data.message);
                }
                delete messages[id];
            }
        });

        // Listen for messages initiating a call from the worker, dispatch them,
        // and send any return value back to the worker
        worker.addEventListener('message', (event) => {
            // Unique id for this message & return call to main thread
            var id = event.data.message_id;
            if (event.data.type !== 'worker_send' || id == null) {
                return;
            }

            // Call the requested method and save the return value
            // var target = targets[event.data.target];
            var [method_name, target] = findTarget(event.data.method);
            if (!target) {
                throw Error(`Worker broker could not dispatch message type ${event.data.method} on target ${event.data.target} because no object with that name is registered on main thread`);
            }

            var method = (typeof target[method_name] === 'function') && target[method_name];
            if (!method) {
                throw Error(`Worker broker could not dispatch message type ${event.data.method} on target ${event.data.target} because object has no method with that name`);
            }

            var result, error;
            try {
                result = method.apply(target, event.data.message);
            }
            catch(e) {
                // Thrown errors will be passed back (in string form) to worker
                error = e;
            }

            // Send return value to worker
            let transferables;
            // Async result
            if (result instanceof Promise) {
                result.then((value) => {
                    transferables = findTransferables(value);

                    worker.postMessage({
                        type: 'main_reply',
                        message_id: id,
                        message: value
                    }, transferables.map(t => t.object));

                    freeTransferables(transferables);
                    if (transferables.length > 0) {
                        Utils.log('trace', `'${method_name}' transferred ${transferables.length} objects to worker thread`);
                    }

                }, (error) => {
                    worker.postMessage({
                        type: 'main_reply',
                        message_id: id,
                        error: (error instanceof Error ? `${error.message}: ${error.stack}` : error)
                    });
                });
            }
            // Immediate result
            else {
                transferables = findTransferables(result);

                worker.postMessage({
                    type: 'main_reply',
                    message_id: id,
                    message: result,
                    error: (error instanceof Error ? `${error.message}: ${error.stack}` : error)
                }, transferables.map(t => t.object));

                freeTransferables(transferables);
                if (transferables.length > 0) {
                    Utils.log('trace', `'${method_name}' transferred ${transferables.length} objects to worker thread`);
                }
            }
        });

    };

    // Expose for debugging
    WorkerBroker.getMessages = function () {
        return messages;
    };

    WorkerBroker.getMessageId = function () {
        return message_id;
    };

}

// Worker threads:
// - Receive messages from main thread, and optionally send an async response back as a promise
// - Send messages to main thread, and optionally receive an async response as a promise
function setupWorkerThread () {

    // Send a message to the main thread, and optionally get an async response as a promise
    // Arguments:
    //   - method: the method with this name, specified with dot-notation, will be invoked on the main thread
    //   - message: will be passed to the method call
    // Returns:
    //   - a promise that will be fulfilled if the main thread method returns a value (could be immediately, or async)
    //
    WorkerBroker.postMessage = function (method, ...message) {
        // Track state of this message
        var promise = new Promise((resolve, reject) => {
            messages[message_id] = { method, message, resolve, reject };
        });

        self.postMessage({
            type: 'worker_send',    // mark message as method invocation from worker
            message_id,             // unique id for this message, for life of program
            method,                 // will dispatch to a method of this name on the main thread
            message                 // message payload
        });

        message_id++;
        return promise;
    };

    // Listen for messages coming back from the main thread, and fulfill that message's promise
    self.addEventListener('message', (event) => {
        if (event.data.type !== 'main_reply') {
            return;
        }

        // Pass the result to the promise
        var id = event.data.message_id;
        if (messages[id]) {
            if (event.data.error) {
                messages[id].reject(event.data.error);
            }
            else {
                messages[id].resolve(event.data.message);
            }
            delete messages[id];
        }
    });

    // Receive messages from main thread, dispatch them, and send back a reply
    self.addEventListener('message', (event) => {
        // Unique id for this message & return call to main thread
        var id = event.data.message_id;
        if (event.data.type !== 'main_send' || id == null) {
            return;
        }

        // Call the requested worker method and save the return value
        var [method_name, target] = findTarget(event.data.method);
        if (!target) {
            throw Error(`Worker broker could not dispatch message type ${event.data.method} on target ${event.data.target} because no object with that name is registered on main thread`);
        }

        var method = (typeof target[method_name] === 'function') && target[method_name];

        if (!method) {
            throw Error(`Worker broker could not dispatch message type ${event.data.method} because worker has no method with that name`);
        }

        var result, error;
        try {
            result = method.apply(target, event.data.message);
        }
        catch(e) {
            // Thrown errors will be passed back (in string form) to main thread
            error = e;
        }

        // Send return value to main thread
        let transferables;
        // Async result
        if (result instanceof Promise) {
            result.then((value) => {
                transferables = findTransferables(value);

                self.postMessage({
                    type: 'worker_reply',
                    message_id: id,
                    message: value
                }, transferables.map(t => t.object));

                freeTransferables(transferables);
                if (transferables.length > 0) {
                    Utils.log('trace', `'${method_name}' transferred ${transferables.length} objects to main thread`);
                }
            }, (error) => {
                self.postMessage({
                    type: 'worker_reply',
                    message_id: id,
                    error: (error instanceof Error ? `${error.message}: ${error.stack}` : error)
                });
            });
        }
        // Immediate result
        else {
            transferables = findTransferables(result);

            self.postMessage({
                type: 'worker_reply',
                message_id: id,
                message: result,
                error: (error instanceof Error ? `${error.message}: ${error.stack}` : error)
            }, transferables.map(t => t.object));

            freeTransferables(transferables);
            if (transferables.length > 0) {
                Utils.log('trace', `'${method_name}' transferred ${transferables.length} objects to main thread`);
            }
        }
    });

}

// Build a list of transferable objects from a source object
// Returns a list of info about each transferable:
//   - object: the actual transferable object
//   - parent: the parent object that the transferable is a property of (if any)
//   - property: the property name of the transferable on the parent object (if any)
// TODO: add option in case you DON'T want to transfer objects
function findTransferables(source, parent = null, property = null, list = []) {
    if (!source) {
         return list;
    }

    if (Array.isArray(source)) {
        // Check each array element
        source.forEach((x, i) => findTransferables(x, source, i, list));
    }
    else if (typeof source === 'object') {
        // Is the object a transferable array buffer?
        if (source instanceof ArrayBuffer) {
            list.push({ object: source, parent, property });
        }
        // Or looks like a typed array (has an array buffer property)?
        else if (source.buffer instanceof ArrayBuffer) {
            list.push({ object: source.buffer, parent, property });
        }
        // Otherwise check each property
        else {
            for (let prop in source) {
                findTransferables(source[prop], source, prop, list);
            }
        }
    }
    return list;
}

// Remove neutered transferables from parent objects, as they should no longer be accessed after transfer
function freeTransferables(transferables) {
    if (!Array.isArray(transferables)) {
        return;
    }
    transferables.filter(t => t.parent && t.property).forEach(t => delete t.parent[t.property]);
}

// Setup this thread as appropriate
if (Utils.isMainThread) {
    setupMainThread();
}

if (Utils.isWorkerThread) {
    setupWorkerThread();
}
