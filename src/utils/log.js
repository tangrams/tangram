import version from './version';
import Thread from './thread';
import WorkerBroker from './worker_broker';

import loglevel from 'loglevel';

// Log wrapper, proxies requests from worker threads to main thread
export default function log (level, ...msg) {
    level = level || 'info';
    if (Thread.is_worker) {
        WorkerBroker.postMessage('_logProxy', level, ...msg);
    }
    else if (typeof loglevel[level] === 'function') {
        loglevel[level](...msg);
    }
}

if (Thread.is_main) {
    WorkerBroker.addTarget('_logProxy', log);

    log.setLevel = loglevel.setLevel;

    // Prefix log messages with Tangram version
    const factory = loglevel.methodFactory;
    loglevel.methodFactory = function(methodName, logLevel) {
        const rawMethod = factory(methodName, logLevel);
        return function(...message) {
            rawMethod(`Tangram ${version.string}:`, ...message);
        };
    };
}
