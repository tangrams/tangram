var version;
export default version = {
    get string() { return `v${version.major}.${version.minor}.${version.patch}`; },
    major: 0,
    minor: 5,
    patch: 1,
    pre: false
};
