/*jshint worker: true*/

// WorkerBroker routes messages between web workers and the main thread, allowing for traditional
// callback-style async code. Example usage:
//
// In web worker, define a method:
//
//     self.square = function (x) {
//         return x * x;
//     };
//
// In main thread, invoke that method with a callback:
//
//     worker = new Worker(...);
//     WorkerBroker.addWorker(worker);
//
//     WorkerBroker.postMessage(worker, 'square', 5, function(y) {
//         console.log(y);
//     });
//
//     -> prints 25

var WorkerBroker;
export default WorkerBroker = {};

// Global list of all worker messages
// Uniquely tracks every call made from the main thread to a worker
var message_id = 0;
var messages = {};

// Main thread:
// Send messages to workers, and optionally receive an async response that is then routed a callback
function setupMainThread () {

    // Send a message to the worker, and optionally get an async response
    // - worker: the web worker instance
    // - method: on the worker side, the method with this name will be invoked
    // - message: will be passed to the method call in the worker
    // - callback: if provided, worker will send the invoked method's return value back to the worker,
    //     which will then pass it to the callback
    WorkerBroker.postMessage = function (worker, method, message, callback, error) {
        // Only need to track state of this message if we expect it to callback to the main thread
        var has_callback = (typeof callback === 'function') || (typeof error === 'function');
        if (has_callback) {
            messages[message_id] = { method, message, callback, error };
        }

        worker.postMessage({
            worker_broker: true,    // mark message as sent from broker
            message_id,             // unique id for this message, for life of program
            method,                 // will dispatch to a function of this name within the worker
            message,                // message payload
            has_callback            // flag indicating id worker should callback to main thread
        });

        message_id++;
    };

    // Listen for messages coming back from the worker, and pass them to that messages's callback
    WorkerBroker.addWorker = function (worker) {
        worker.addEventListener('message', (event) => {
            // Pass the result along to the callback
            var id = event.data.message_id;
            if (messages[id]) {
                if (messages[id].error && event.data.error) {
                    messages[id].error(event.data.error);
                }
                else if (messages[id].callback) {
                    messages[id].callback(event.data.message);
                }
                delete messages[id];
            }
        });
    };

}

// Worker threads:
// Listen for messages initiating a call from the main thread, dispatch them,
// and callback to the main thread with any return value
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

        // TODO: add try/catch behavior to pass back errors
        var result = method(event.data.message);

        // Callback if main thread is expecting a return value
        if (event.data.has_callback) {
            // Async result
            if (result instanceof Promise) {
                result.then((value) => {
                    self.postMessage({
                        message_id: id,
                        message: value
                    });
                }, (value) => {
                    self.postMessage({
                        message_id: id,
                        error: value
                    });
                });
            }
            // Immediate result
            else {
                self.postMessage({
                    message_id: id,
                    message: result
                });
            }
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
