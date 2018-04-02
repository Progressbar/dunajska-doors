const express = require('express');
const bodyParser = require('body-parser');
const SSE = require('express-sse');

const sse = new SSE('connected');

const fs = require('fs');

const env = require('./env');
const addTokenHash = require('./add-token-hash');
const paths = require('./paths');
const phoneInput = require('./phone-input');
const phoneCommands = require('./phone-commands');
const msgBar = require('./msg-bar');

// append to file
const logFileStream = fs.createWriteStream(paths.logFile, { flags: 'a' });

const log = (msg, options = {}) => {
  const {
    display = true,
    write = true,
    useSSE = false,
  } = options;

  const str = `${new Date().toJSON()}|${msg}`;

  if (write) {
    logFileStream.write(`${str}\n`);
  }

  if (display) {
    // eslint-disable-next-line no-console
    console.log(str);
  }

  if (useSSE) {
    console.log(msg);
    sse.send(msg);
  }
};

const { hash: hashFn } = env;

const actions = {
  open: {
    debounce: phoneCommands.openTime,
  },
  answer: {
    debounce: phoneCommands.answerTime,
  },
};
let phoneNextAvailableDate = Date.now();

let users = {};

const usersUpdateDebounce = 2 * 1000;
let lastUsersUpdate = Date.now() - usersUpdateDebounce;
const updateUsers = (cb = () => {}) => {
  fs.readFile(paths.userDB, 'utf8', (err, data) => {
    if (err) {
      log('user: no user file found. Assuming no users. Creating user file');
      fs.open(paths.userDB, 'wx', (errOpening, fd) => {
        if (errOpening) {
          log('user: something went wrong with creating the user file');
          log(errOpening);
          cb(errOpening);
        } else {
          log('user: created user file');
          cb();

          fs.closeSync(fd);
        }
      });
    }

    const lines = data.split('\n').filter(line => line.trim().length > 0);
    users = lines.map((line) => {
      const [hash, name, privilegesString] = line.split('|');
      return { hash, name, privileges: privilegesString.split(' ') };
    });

    cb();
  });
};

const testTokenStrength = (token) => {
  const errors = [];

  if (token.length < 9) {
    errors.push('must be longer than 9 chars');
  }
  if (token.toLowerCase() === token) {
    errors.push('must contain at least 1 uppercase character');
  }
  if (token.toUpperCase() === token) {
    errors.push('must contain at least 1 lowercase character');
  }
  if (!token.match(/\d/)) {
    errors.push('must contain at least 1 decimal digit');
  }

  if (errors.length > 0) {
    return { err: errors.join(', ') };
  }

  return { ok: true };
};


log('user: updating users at initialization');
updateUsers(() => log('user: updated users at initialization'));

const app = express();
app.use(bodyParser.json());

app.get('/sse', sse.init);
let isPhoneRinging = phoneInput.state;
phoneInput.addListener((isPhoneBeingUsed) => {
  const now = Date.now();
  if (isPhoneBeingUsed && now > phoneNextAvailableDate) {
    isPhoneRinging = true;
    log('phone: ringing', { useSSE: true });
    msgBar.displayTemporary('@@@@@@@@ PHONE IS RINGING @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@', 40 * 1000);
  }

  if (!isPhoneBeingUsed && isPhoneRinging) {
    isPhoneRinging = false;
    log('phone: stopped ringing', { useSSE: true });
  }
  return true;
});

const apiRoute = express.Router();
app.use('/api', apiRoute);
app.use(express.static(paths.staticHTML));

apiRoute.get('/users/update', (req, res) => {
  const now = Date.now();
  if (now - lastUsersUpdate > usersUpdateDebounce) {
    log('user: updating users from request');
    updateUsers(() => {
      lastUsersUpdate = now;
      log('user: updated users from request');

      res.send('OK: updated user list');
    });

    return;
  }

  log('user: attempted updating users. Debounced');

  res.send('ERROR: the user list was updated less than 2 seconds ago');
});
apiRoute.get('/phone/:fn/:token/', (req, res) => {
  const fromUser = users.find(user => user.hash === hashFn(req.params.token));
  const { fn: action } = req.params;

  if (fromUser) {
    const now = Date.now();
    if (now >= phoneNextAvailableDate) {
      if (actions[action]) {
        phoneNextAvailableDate = now + actions[action].debounce;
        phoneCommands[action]();
        log(`phone: "${fromUser.name}" used action "${action}" succesfully`, { useSSE: true });

        const displayText = `${fromUser.name.substring(0, 34).split('<')[0]}\nopened doors through "${action}"`;
        msgBar.displayTemporary(displayText, 5000, (msgBarRequest) => {
          msgBarRequest.on('error', (err) => {
            log(`requests: could not connect to towcpi: ${err}`);
          });
        });

        res.send('OK: your token is valid. Opening doors in 14s :)');
      } else {
        log(`phone: "${fromUser.name}" tried invalid action "${action}"`);
        res.send('ERROR: your action is invalid. Try "open" or "answer"');
      }
    } else {
      log(`phone: "${fromUser.name}" tried action "${action}" but was debounced`);
      res.send(`ERROR: already processing a different request, try again in ${phoneNextAvailableDate - now}ms. If the problem persists, contact Matei Copot: matei@copot.eu`);
    }
  } else {
    log('phone: someone tried to open with an invalid token');
    res.send('ERROR: your token is invalid. Try some other token :/');
  }
});
apiRoute.post('/users', (req, res) => {
  const { fromToken, action = 'add user' } = req.body;
  if (!fromToken) {
    return res.send('ERROR: no fromToken');
  }

  const user = users.find(({ hash }) => hash === hashFn(fromToken));
  if (!user) {
    return res.send('ERROR: invalid token');
  }

  switch (action) {
    case 'add user':
      if (user.privileges.includes('add-user')) {
        const { name, token, privileges = [] } = req.body;
        if (!name) {
          res.send('ERROR: missing parameter "name"');
        } else if (!token) {
          res.send('ERROR: missing parameter "token"');
        } else {
          const strengthCheck = testTokenStrength(token);

          if (strengthCheck.err) {
            res.send(`ERROR: token not strong enough: ${strengthCheck.err}`);
            return;
          }

          addTokenHash(token, name, privileges, (err) => {
            if (err) {
              log(`user: error while trying to add the user: ${err}`);
              return res.send('ERROR: internal server error while trying to add the user');
            }

            log(`user: "${user.name}" added "${name}" with privileges "${privileges.join(' ')}"`);
            updateUsers();
            res.send(`OK: added user "${name}"`);
          });
        }
      } else {
        log(`user: "${user.name}" attempted using missing privilege "add-user"`);
        res.send('ERROR: missing permission "add-user"');
      }
      break;
    case 'remove user':
      if (user.privileges.includes('remove-user')) {
        const { name } = req.body;
        if (!name) {
          res.send('ERROR: missing parameter "name"');
        } else {
          res.send('ERROR: not implemented yet');
        }
      } else {
        log(`user: "${user.name}" attempted using missing privilege "remove-user"`);
        res.send('ERROR: missing permission "remove-user"');
      }
      break;
    case 'list users':
      if (user.privileges.includes('read-list')) {
        res.json(users);
      } else {
        log(`user: "${user.name}" attempted using missing privilege "read-list"`);
        res.send('ERROR: missing permission "read-list"');
      }
      break;
    default:
      log(`user: "${user.name}" tried to use action "${action}", but it doesn't exist`);
      res.send(`ERROR: no action "${action}"`);
  }
});
app.listen(env.port, () => {
  log('info: web server started');
});
