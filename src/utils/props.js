// Get a value for a nested property with path provided as an array (`a.b.c` => ['a', 'b', 'c'])
export function getPropertyPath (object, path) {
    const prop = path[path.length - 1];
    return getPropertyPathTarget(object, path)?.[prop];
}

// Set a value for a nested property with path provided as an array (`a.b.c` => ['a', 'b', 'c'])
export function setPropertyPath (object, path, value) {
    const prop = path[path.length - 1];
    const target = getPropertyPathTarget(object, path);
    if (target) {
        target[prop] = value;
    }
}

// Get the immediate parent object for a property path name provided as an array
// e.g. for a single-depth path, this is just `object`, for path ['a', 'b'], this is `object[a]`
export function getPropertyPathTarget (object, path) {
    if (path.length === 0) {
        return;
    }

    let target = object;
    for (let i = 0; i < path.length - 1; i++) {
        const prop = path[i];
        target = target[prop];
        if (target == null) {
            return;
        }
    }
    return target;
}
