const fs = require('fs');
const paths = require('./paths');

// append to file
const logFileStream = fs.createWriteStream(paths.logFile, { flags: 'a' });

const log = (msg, options = {}) => {
  const {
    display = true,
    write = true,
    sse = false,
  } = options;

  const str = `${new Date().toJSON()}|${msg}`;

  if (write) {
    logFileStream.write(`${str}\n`);
  }

  if (display) {
    // eslint-disable-next-line no-console
    console.log(str);
  }

  if (sse) {
    console.log(msg);
    sse.send(msg);
  }
};



module.exports = log;
