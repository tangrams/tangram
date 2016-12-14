import log from './log';

export default function subscribeMixin (target) {

    let listeners = [];

    return Object.assign(target, {

        subscribe(listener) {
            if (listeners.indexOf(listener) === -1) {
                listeners.push(listener);
            }
        },

        unsubscribe(listener) {
            let index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        },

        unsubscribeAll() {
            listeners = [];
        },

        trigger(event, ...data) {
            listeners.forEach(listener => {
                if (typeof listener[event] === 'function') {
                    try {
                        listener[event](...data);
                    }
                    catch(e) {
                        log('warn', `Caught exception in listener for event '${event}':`, e);
                    }
                }
            });
        },

        hasSubscribersFor(event) {
            let has = false;
            listeners.forEach(listener => {
                if (typeof listener[event] === 'function') {
                    has = true;
                }
            });
            return has;
        }

    });

}
