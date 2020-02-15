// Rearranges element array for triangles into a new element array that draws a wireframe
// Used for debugging
export default function makeWireframeForTriangleElementData (element_data) {
    const wireframe_data = new Uint16Array(element_data.length * 2);

    // Draw triangles as lines:
    // Make a copy of element_data, and for every group of three vertices, duplicate
    // each vertex according to the following pattern:
    // [1, 2, 3] => [1, 2, 2, 3, 3, 1]
    // This takes three vertices which would have been interpreted as a triangle,
    // and converts them into three 2-vertex line segments.
    for (let i = 0; i < element_data.length; i += 3) {
        wireframe_data.set(
            [
                element_data[i],
                element_data[i+1],
                element_data[i+1],
                element_data[i+2],
                element_data[i+2],
                element_data[i]
            ],
            i * 2
        );
    }
    return wireframe_data;
}
