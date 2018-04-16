const { request } = require('http');
const log = require('./logger');

const opts = {
  hostname: 'pi.towc',
  port: 8080,
  method: 'GET',
};

module.exports = {
  displayTemporary: (text, ms=5000, cb) => {
    const req = request({
      ...opts,
      path: `/api/msg-bar/display-temporary/${encodeURIComponent(text)}/${ms}`,
    });
    if(cb) {
      cb(req);
    }
    req.on('error', (err) => {
      log(`requests: could not connect to towcpi: ${err}`);
    });
    req.end();
    return req;
  },
}
