import version from './version';
import Thread from './thread';
import WorkerBroker from './worker_broker';

const LEVELS = {
    silent: -1,
    error: 0,
    warn: 1,
    info: 2,
    debug: 3,
    trace: 4
};

const methods = {};
let logged_once = {};

function methodForLevel (level) {
    if (Thread.is_main) {
        methods[level] = methods[level] || (console[level] ? console[level] : console.log).bind(console);
        return methods[level];
    }
}

export default function log (opts, ...msg) {
    let level = (typeof opts === 'object') ? opts.level : opts;
    if (LEVELS[level] <= LEVELS[log.level]) {
        if (Thread.is_worker) {
            // Proxy to main thread
            WorkerBroker.postMessage({ method: '_logProxy', stringify: true }, opts, ...msg);
        }
        else {
            // Only log message once?
            if (typeof opts === 'object' && opts.once === true) {
                if (logged_once[JSON.stringify(msg)]) {
                    return;
                }
                logged_once[JSON.stringify(msg)] = true;
            }

            // Write to console (on main thread)
            let logger = methodForLevel(level);
            if (msg.length > 1) {
                logger(`Tangram ${version} [${level}]: ${msg[0]}`, ...msg.slice(1));
            }
            else {
                logger(`Tangram ${version} [${level}]: ${msg[0]}`);
            }
        }
    }
}

log.level = 'info';
log.workers = null;

log.setLevel = function (level) {
    log.level = level;

    if (Thread.is_main && Array.isArray(log.workers)) {
        WorkerBroker.postMessage(log.workers, '_logSetLevelProxy', level);
    }
};

if (Thread.is_main) {
    log.setWorkers = function (workers) {
        log.workers = workers;
    };

    log.reset = function () {
        logged_once = {};
    };
}

WorkerBroker.addTarget('_logProxy', log);                   // proxy log messages from worker to main thread
WorkerBroker.addTarget('_logSetLevelProxy', log.setLevel);  // proxy log level setting from main to worker thread
