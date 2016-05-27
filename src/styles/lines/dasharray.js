// Renders an array specifying a line pattern of alternating dashes and spaces,
// similar to an SVG `dasharray` or Canvas setLineDash(), into a byte array of RGBA pixels
// Returns:
// {
//    pixel: rendered image in Uint8Array buffer
//    length: pixel length of rendered dash pattern (sum of all dashes and spaces)
// }
//
// https://www.w3.org/TR/SVG/painting.html#StrokeDasharrayProperty
// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray
// https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setLineDash

const default_dash_color = [255, 255, 255, 255];
const default_background_color = [0, 0, 0, 0];

export default function renderDashArray (pattern, options = {}) {
    const dash_pixel = options.dash_color || default_dash_color;
    const background_color = options.background_color || default_background_color;
    const dashes = pattern;

    // If pattern is odd, repeat it to make it even (see SVG spec)
    if (dashes.length % 2 === 1) {
        Array.prototype.push.apply(dashes, dashes);
    }

    let dash = true;
    let pixels = [];
    for (let i=0; i < dashes.length; i++) {
        let segment = dashes[i];
        for (let s=0; s < segment; s++) {
            Array.prototype.push.apply(pixels, dash ? dash_pixel : background_color);
        }
        dash = !dash; // alternate between dashes and spaces
    }

    pixels = new Uint8Array(pixels); // convert to typed array
    const length = pixels.length / 4; // one RGBA byte sequences to one pixel

    return { pixels, length };
}
