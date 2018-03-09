const path = require('path');
const env = require('./env');

// these will be rendered as `path.join(env.path, <path>)`
const relativePaths = {
  userDB: 'user.db',
  logFile: 'logs.log',
  staticHTML: 'static-html',
};

module.exports = {
  ...Object.entries(relativePaths).reduce((acc, [key, localPath]) => {
    acc[key] = path.join(env.path, localPath);
    return acc;
  }, {}),
};
