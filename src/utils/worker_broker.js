/*jshint worker: true*/

// WorkerBroker routes messages between web workers and the main thread, allowing for simpler
// async code via promises. Example usage:
//
// In web worker, define a method:
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
//     WorkerBroker.postMessage(worker, 'square', 5).then(function(y) {
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
//         WorkerBroker.postMessage(worker, 'broken').then(
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
// TODO: add documentation for invoking main thread methods from a worker (basically same API, but in reverse)
import Utils from './utils';
var WorkerBroker;
export default WorkerBroker = {};

// Global list of all worker messages
// Uniquely tracks every call made between main thread and a worker
var message_id = 0;
var messages = {};

// Main thread:
// - Send messages to workers, and optionally receive an async response as a promise
// - Receive messages from workers, and optionally send an async response back as a promise
function setupMainThread () {

    // Send a message to a worker, and optionally get an async response
    // Arguments:
    //   - worker: the web worker instance
    //   - method: the method with this name will be invoked in the worker
    //   - message: will be passed to the method call in the worker
    // Returns:
    //   - a promise that will be fulfilled if the worker method returns a value (could be immediately, or async)
    //
    WorkerBroker.postMessage = function (worker, method, ...message) {
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
    var workers = {};

    WorkerBroker.addWorker = function (worker) {

        // Keep track of all registered workers
        // TODO: adding a property directly to the worker, would be better to track non-instrusively,
        // maybe with an ES6 Map
        worker._worker_broker_id = worker_id++;
        workers[worker._worker_broker_id] = worker;

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
            var target = targets[event.data.target];
            if (!target) {
                throw Error(`Worker broker could not dispatch message type ${event.data.method} on target ${event.data.target} because no object with that name is registered on main thread`);
            }

            var method = (typeof target[event.data.method] === 'function') && target[event.data.method];
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
            // Async result
            if (result instanceof Promise) {
                result.then((value) => {
                    worker.postMessage({
                        type: 'main_reply',
                        message_id: id,
                        message: value
                    });
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
                worker.postMessage({
                    type: 'main_reply',
                    message_id: id,
                    message: result,
                    error: (error instanceof Error ? `${error.message}: ${error.stack}` : error)
                });
            }
        });

    };

    // Register an object to receive calls from the worker
    var targets = {};
    WorkerBroker.addTarget = function (name, target) {
        targets[name] = target;
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
    //   - target: the name of the object in the main thread to be called
    //   - method: the method with this name will be invoked on the main thread target object
    //   - message: will be passed to the method call in the main thread
    // Returns:
    //   - a promise that will be fulfilled if the main thread method returns a value (could be immediately, or async)
    //
    WorkerBroker.postMessage = function (target, method, ...message) {
        // Track state of this message
        var promise = new Promise((resolve, reject) => {
            messages[message_id] = { target, method, message, resolve, reject };
        });

        self.postMessage({
            type: 'worker_send',    // mark message as method invocation from worker
            message_id,             // unique id for this message, for life of program
            target,                 // name of the object to be called on main thread
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
        var method = (typeof self[event.data.method] === 'function') && self[event.data.method];
        if (!method) {
            throw Error(`Worker broker could not dispatch message type ${event.data.method} because worker has no method with that name`);
        }

        var result, error;
        try {
            result = method.apply(self, event.data.message);
        }
        catch(e) {
            // Thrown errors will be passed back (in string form) to main thread
            error = e;
        }

        // Send return value to main thread
        // Async result
        if (result instanceof Promise) {
            result.then((value) => {
                self.postMessage({
                    type: 'worker_reply',
                    message_id: id,
                    message: value
                });
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
            self.postMessage({
                type: 'worker_reply',
                message_id: id,
                message: result,
                error: (error instanceof Error ? `${error.message}: ${error.stack}` : error)
            });
        }
    });

}

// Setup this thread as appropriate
if (Utils.isMainThread) {
    setupMainThread();
}

if (Utils.isWorkerThread) {
    setupWorkerThread();
}
