import log from '../utils/log';

// Property name references a global property?
export function isGlobalReference (val) {
    if (val && val.slice(0, 7) === 'global.') {
        return true;
    }
    return false;
}

// Flatten nested global properties for simpler string look-ups
export function flattenGlobalProperties (obj, prefix = null, globals = {}) {
    prefix = prefix ? (prefix + '.') : 'global.';

    for (const p in obj) {
        const key = prefix + p;
        const val = obj[p];
        globals[key] = val;

        if (typeof val === 'object' && !Array.isArray(val)) {
            flattenGlobalProperties(val, key, globals);
        }
    }
    return globals;
}

// Find and apply new global properties (and re-apply old ones)
export function applyGlobalProperties (globals, obj, target, key) {
    let prop;

    // Check for previously applied global substitution
    if (target != null && typeof target === 'object' && target._global_prop && target._global_prop[key]) {
        prop = target._global_prop[key];
    }
    // Check string for new global substitution
    else if (typeof obj === 'string' && obj.slice(0, 7) === 'global.') {
        prop = obj;
    }

    // Found global property to substitute
    if (prop) {
        // Mark property as global substitution
        if (target._global_prop == null) {
            Object.defineProperty(target, '_global_prop', { value: {} });
        }
        target._global_prop[key] = prop;

        // Get current global value
        let val = globals[prop];
        let stack;
        while (typeof val === 'string' && val.slice(0, 7) === 'global.') {
            // handle globals that refer to other globals, detecting any cyclical references
            stack = stack || [prop];
            if (stack.indexOf(val) > -1) {
                log({ level: 'warn', once: true }, 'Global properties: cyclical reference detected', stack);
                val = null;
                break;
            }
            stack.push(val);
            val = globals[val];
        }

        // Create getter/setter
        Object.defineProperty(target, key, {
            enumerable: true,
            get: function () {
                return val; // return substituted value
            },
            set: function (v) {
                // clear the global substitution and remove the getter/setter
                delete target._global_prop[key];
                delete target[key];
                target[key] = v; // save the new value
            }
        });
    }
    // Loop through object keys or array indices
    else if (Array.isArray(obj)) {
        for (let p = 0; p < obj.length; p++) {
            applyGlobalProperties(globals, obj[p], obj, p);
        }
    }
    else if (typeof obj === 'object') {
        for (const p in obj) {
            applyGlobalProperties(globals, obj[p], obj, p);
        }
    }
    return obj;
}
