export default function sliceObject (obj, keys) {
    let sliced = {};
    keys.forEach(k => sliced[k] = obj[k]);
    return sliced;
}
