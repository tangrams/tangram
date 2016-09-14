export default function subscribeMixin (target) {

    const listeners = new Set();

    return Object.assign(target, {

        subscribe(listener) {
            listeners.add(listener);
        },

        unsubscribe(listener) {
            listeners.delete(listener);
        },

        unsubscribeAll() {
            listeners.clear();
        },

        trigger(event, ...data) {
            for (let listener of listeners) {
                if (typeof listener[event] === 'function') {
                    listener[event](...data);
                }
            }
        },

        hasSubscribersFor(event) {
            for (let listener of listeners) {
                if (typeof listener[event] === 'function') {
                    return true;
                }
            }
            return false;
        }

    });

}
