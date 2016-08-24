let fs = require('fs');
let pkg = JSON.parse(fs.readFileSync(__dirname + '/../../package.json', 'utf8'));
let version;
export default version = 'v' + pkg.version;
