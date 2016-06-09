/*jshint worker: true*/

// Mark thread as main or worker
const Thread = {};

export default Thread;

try {
    if (window.document !== HTMLDocument) { // jshint ignore:line
        Thread.is_worker = false;
        Thread.is_main   = true;
    }
}
catch (e) {
    if (self !== undefined) {
        Thread.is_worker = true;
        Thread.is_main   = false;

        // Patch for 3rd party libs that require these globals to be present. Specifically, FontFaceObserver.
        // Brittle solution but allows that library to load on worker threads.
        self.window = { document: {} };
        self.document = self.window.document;
    }
}
