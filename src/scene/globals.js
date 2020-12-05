import log from '../utils/log';
import { getPropertyPathTarget } from '../utils/props';

// prefix used to identify global property references
const GLOBAL_PREFIX = 'global.';
const GLOBAL_PREFIX_LENGTH = GLOBAL_PREFIX.length;

// name of 'hidden' (non-enumerable) property used to track global property references on an object
const GLOBAL_REGISTRY = '__global_prop';

// Property name references a global property?
export function isGlobalReference (val) {
    return val?.slice(0, GLOBAL_PREFIX_LENGTH) === GLOBAL_PREFIX;
}

// Has object property been substitued with a value from a global reference?
// Property provided as a single-depth string name, or nested path array (`a.b.c` => ['a', 'b', 'c'])
export function isGlobalSubstitution (object, prop_or_path) {
    const path = Array.isArray(prop_or_path) ? prop_or_path : [prop_or_path];
    const target = getPropertyPathTarget(object, path);
    const prop = path[path.length - 1];
    return target?.[GLOBAL_REGISTRY]?.[prop] !== undefined;
}

// Flatten nested global properties for simpler string look-ups
export function flattenGlobalProperties (obj, prefix = null, globals = {}) {
    prefix = prefix ? (prefix + '.') : GLOBAL_PREFIX;

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
    if (target?.[GLOBAL_REGISTRY]?.[key]) {
        prop = target[GLOBAL_REGISTRY][key];
    }
    // Check string for new global substitution
    else if (typeof obj === 'string' && obj.slice(0, GLOBAL_PREFIX_LENGTH) === GLOBAL_PREFIX) {
        prop = obj;
    }

    // Found global property to substitute
    if (prop) {
        // Mark property as global substitution
        if (target[GLOBAL_REGISTRY] == null) {
            Object.defineProperty(target, GLOBAL_REGISTRY, { value: {} });
        }
        target[GLOBAL_REGISTRY][key] = prop;

        // Get current global value
        let val = globals[prop];
        let stack;
        while (typeof val === 'string' && val.slice(0, GLOBAL_PREFIX_LENGTH) === GLOBAL_PREFIX) {
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
                delete target[GLOBAL_REGISTRY][key];
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
