const fs = require('fs');
const env = require('./env');
const { hash } = env;

module.exports = (token, name, privileges, cb=()=>{}) =>
  fs.writeFile(env.path + 'token-hashes.txt', `${hash(token)}|${name}|${privileges.join(' ')}\n`, { flag: 'a' }, cb);
