// Deep/recursive merge of one or more source objects into a destination object
export default function mergeObjects (dest, ...sources) {
    for (let source of sources) {
        if (!source) {
            continue;
        }
        for (let key in source) {
            let value = source[key];
            // Recursively merge the source into the destination if it is a a non-null key/value object
            // (e.g. don't merge arrays, those are treated as scalar values; null values will overwrite/erase
            // the previous destination value)
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                dest[key] = mergeObjects(dest[key] || {}, value);
            }
            // Overwrite the previous destination value if the source property is: a scalar (number/string),
            // an array, or a null value
            else {
                dest[key] = value;
            }
        }

    }
    return dest;
}
