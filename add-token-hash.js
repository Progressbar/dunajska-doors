const fs = require('fs');
const { hash } = require('./env');

module.exports = (token, name, privileges, cb=()=>{}) =>
  fs.writeFile('token-hashes.txt', `${hash(token)}|${name}|${privileges.join(' ')}\n`, { flag: 'a' }, cb);
