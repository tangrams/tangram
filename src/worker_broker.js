// Broker between worker and main thread
var WorkerBroker;
export default WorkerBroker = {};

// Global list of all worker messages
// Uniquely tracks every call made from the main thread to a worker
var worker_message_id = 0;
var worker_messages = {};

// On the main thread:
try {
    if (window !== undefined) {

        // Listen for messages, dispatch them, and callback to the main thread with any return value
        WorkerBroker.postMessageToWorker = function (worker, type, message, callback) {
            // Only need to track state of this message if we expect it to callback to the main thread
            var has_callback = (typeof callback === 'function');
            if (has_callback) {
                worker_messages[worker_message_id] = { type, message, callback };
            }

            worker.postMessage({
                worker_message_id,  // unique id for this message, for life of program
                type,               // will dispatch to a per-type function within the worker
                message,            // message payload
                has_callback        // flag indicating id worker should callback to main thread
            });

            worker_message_id++;
        };

        // Listen for messages coming back from the worker, and pass them to that messages's callback
        WorkerBroker.addWorker = function (worker) {
            worker.addEventListener('message', (event) => {
                // Pass the result along to the callback
                var id = event.data.worker_message_id;
                if (worker_messages[id]) {
                    worker_messages[id].callback(event.data.message);
                    delete worker_messages[id];
                }
            });
        };

    }
}
// On a worker thread:
catch (e) {
    if (self !== undefined) {

        // Listen for messages initiating a call from the main thread, dispatch them,
        // and callback to the main thread with any return value
        self.addEventListener('message', (event) => {
            // Unique id for this message & return call to main thread
            var id = event.data.worker_message_id;
            if (id == null) {
                return;
            }

            // Call the requested worker method and save the return value
            var dispatch = (typeof self[event.data.type] === 'function') && self[event.data.type];
            if (!dispatch) {
                throw Error(`Worker broker could not dispatch message type ${event.data.type} because worker has no method with that name`);
            }
            var result = dispatch(event.data.message);

            // Callback if main thread is expecting a return value
            if (event.data.has_callback) {
                self.postMessage({
                    worker_message_id: id,
                    message: result
                });
            }
        });

    }
}
