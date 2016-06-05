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

function methodForLevel (level) {
    if (Thread.is_main) {
        methods[level] = methods[level] || (console[level] ? console[level] : console.log).bind(console);
        return methods[level];
    }
}

export default function log (msg_level, ...msg) {
    if (LEVELS[msg_level] <= LEVELS[log.level]) {
        if (Thread.is_worker) {
            // Proxy to worker
            WorkerBroker.postMessage('_logProxy', msg_level, ...msg);
        }
        else {
            let logger = methodForLevel(msg_level);

            // Write to console (on main thread)
            if (msg.length > 1) {
                logger(`Tangram ${version.string} [${msg_level}]: ${msg[0]}`, ...msg.slice(1));
            }
            else {
                logger(`Tangram ${version.string} [${msg_level}]: ${msg[0]}`);
            }
        }
    }
}

log.level = 'info';

log.setLevel = function (level) {
    log.level = level;

    if (Thread.is_main) {
        WorkerBroker.postMessageToAllWorkers('_logSetLevel', level);
    }
};

if (Thread.is_main) {
    WorkerBroker.addTarget('_logProxy', log);
    WorkerBroker.addTarget('_logSetLevel', log.setLevel);
}
