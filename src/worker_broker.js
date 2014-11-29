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

var WorkerBroker;
export default WorkerBroker = {};

// Global list of all worker messages
// Uniquely tracks every call made from the main thread to a worker
var message_id = 0;
var messages = {};

// Main thread:
// Send messages to workers, and optionally receive an async response that is then returned in a promise
function setupMainThread () {

    // Send a message to the worker, and optionally get an async response
    // Arguments:
    //   - worker: the web worker instance
    //   - method: on the worker side, the method with this name will be invoked
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
            worker_broker: true,    // mark message as sent from broker
            message_id,             // unique id for this message, for life of program
            method,                 // will dispatch to a function of this name within the worker
            message                 // message payload
        });

        message_id++;
        return promise;
    };

    // Listen for messages coming back from the worker, and fulfill that message's promise
    WorkerBroker.addWorker = function (worker) {
        worker.addEventListener('message', (event) => {
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
// Listen for messages initiating a call from the main thread, dispatch them,
// and send any return value back to the main thread
function setupWorkerThread () {

    self.addEventListener('message', (event) => {
        // Unique id for this message & return call to main thread
        var id = event.data.message_id;
        if (!event.data.worker_broker || id == null) {
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
                    message_id: id,
                    message: value
                });
            }, (error) => {
                self.postMessage({
                    message_id: id,
                    error: (error instanceof Error ? error.message : error)
                });
            });
        }
        // Immediate result
        else {
            self.postMessage({
                message_id: id,
                message: result,
                error: (error instanceof Error ? error.message : error)
            });
        }
    });

}

// Setup this thread as appropriate
try {
    if (window !== undefined) {
        setupMainThread();
    }
}
catch (e) {
    if (self !== undefined) {
        setupWorkerThread();
    }
}
