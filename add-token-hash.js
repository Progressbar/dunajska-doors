const fs = require('fs');
const env = require('./env');
const paths = require('./paths');

const { hash } = env;

module.exports = (token, name, privileges, cb = () => {}) =>
  fs.writeFile(paths.userDB, `${hash(token)}|${name}|${privileges.join(' ')}\n`, { flag: 'a' }, cb);
