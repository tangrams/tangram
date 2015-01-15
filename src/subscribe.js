export default function subscribeMixin (target) {

    // TODO: temporarily commenting out use of ES6 Set due to apparent traceur bug on iOS8 mobile safari
    // need to diagnose further and report to traceur if confirmed

    // var listeners = new Set();
    var listeners = [];

    return Object.assign(target, {

        subscribe(listener) {
            // listeners.add(listener);
            listeners.push(listener);
        },

        unsubscribe(listener) {
            // listeners.delete(listener);
            var index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        },

        unsubscribeAll() {
            // listeners.clear();
            listeners = [];
        },

        trigger(event, ...data) {
            for (var listener of listeners) {
                if (typeof listener[event] === 'function') {
                    listener[event](...data);
                }
            }
        }

    });

}
