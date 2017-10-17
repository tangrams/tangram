// Deep/recursive merge of one or more source objects into a destination object
const array_merge_op = '...';

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
            let is_array = Array.isArray(value);
            if (value !== null && typeof value === 'object' && !is_array) {
                if (dest[key] !== null && typeof dest[key] === 'object' && !Array.isArray(dest[key])) {
                    dest[key] = mergeObjects(dest[key], value);
                }
                else {
                    dest[key] = mergeObjects({}, value); // destination not an object, overwrite
                }
            }
            // Overwrite the previous destination value if the source property is: a scalar (number/string),
            // an array (unless using array merge operator below), or a null value
            else if (value !== undefined) {
                let merge_index = is_array && value.indexOf(array_merge_op); // special array merge syntax
                if (is_array && dest[key] != null && merge_index > -1) {
                    // If the source value includes the '...' operator, the previous destination value will be
                    // merged into the source value in its place.
                    //
                    // Example 1: append values
                    //   dest: [1, 2 3]
                    //   source: ['...', 4, 5, 6]
                    //   -> merge result: [1, 2, 3, 4, 5, 6]
                    //
                    // Example 2: insert in middle
                    //   dest: [1, 2 3]
                    //   source: ['a', '...', 'b']
                    //   -> merge result: ['a', 1, 2, 3, 'b']
                    //
                    // Example 3: existing scalar value in destination is treated as a single-element array
                    //   dest: 'x'
                    //   source: [1, 2, 3, '...']
                    //   -> merge result: [1, 2, 3, 'x']
                    //
                    if (!Array.isArray(dest[key])) {
                        dest[key] = [dest[key]]; // convert destination to array
                    }
                    let prev = dest[key];                           // previous destination values, which will be merged
                    dest[key] = value.slice(0);                     // copy source values
                    let args = [merge_index, 1];                    // index at which to merge in new values (and delete operator string)
                    Array.prototype.push.apply(args, prev);         // add previous destination values to splice arguments
                    Array.prototype.splice.apply(dest[key], args);  // merge in previous destination values
                }
                else {
                    dest[key] = value; // just overwrite previous value
                }
            }
            // Undefined source properties are ignored
        }

    }
    return dest;
}
