// Deep/recursive merge of one or more source objects into a destination object
export default function mergeObjects (dest, ...sources) {
    for (let s=0; s < sources.length; s++) {
        let source = sources[s];
        if (!source) {
            continue;
        }
        for (let key in source) {
            let value = source[key];
            // Recursively merge the source into the destination if it is a a non-null key/value object
            // (e.g. don't merge arrays, those are treated as scalar values; null values will overwrite/erase
            // the previous destination value)
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                if (dest[key] !== null && typeof dest[key] === 'object' && !Array.isArray(dest[key])) {
                    dest[key] = mergeObjects(dest[key], value);
                }
                else {
                    dest[key] = mergeObjects({}, value); // destination not an object, overwrite
                }
            }
            // Overwrite the previous destination value if the source property is: a scalar (number/string),
            // an array, or a null value
            else if (value !== undefined) {
                dest[key] = value;
            }
            // Undefined source properties are ignored
        }

    }
    return dest;
}
