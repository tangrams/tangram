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
            listeners.forEach(listener => {
                if (typeof listener[event] === 'function') {
                    listener[event](...data);
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
