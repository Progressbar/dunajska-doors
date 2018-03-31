const { request } = require('http');

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
    req.end();
    return req;
  },
}
