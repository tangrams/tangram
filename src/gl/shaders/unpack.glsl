
// Unpack normalized shorts back to their original integer values
#define SHORT(x) (x * 32767.)
#define UNSIGNED_SHORT(x) (x * 65535.)

// Used for cases where an attribute is stored as a normalized int type,
// but is a floating point value that needs a range greater than [0, 1] or [-1, 1].
// The integer value is "scaled" to an 8.8 fixed point style integer before it is
// normalized in the VBO. Used for cases where low precision is suitable for both
// the integer and fractional portions of the number.
// Examples are extrusion vectors for dynamic lines, and screen-space size for point sprites.
#define SCALE_8(x) (x * 256.)
