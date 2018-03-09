const path = require('path');

module.exports = {
  path: path.join(__dirname, '/'),
  hash: key => key.split('').reverse().join(''),
  port: 8080,
};
