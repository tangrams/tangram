/*jshint worker: true*/

// Mark thread as main or worker
const Thread = {};

export default Thread;

try {
    if (window.document !== undefined) {
        Thread.is_worker = false;
        Thread.is_main   = true;
    }
}
catch (e) {
    if (self !== undefined) {
        Thread.is_worker = true;
        Thread.is_main   = false;
    }
}
