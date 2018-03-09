const addTokenHash = require('./add-token-hash');

const [token, name, privileges = ''] = process.argv.slice(2);

if (!token || !name) {
  console.log(`usage: node add-token-hash-cli "<token>" "<assigned name>" ["<privileges>"]
 where <privileges> is a space-delimited list of privileges, between "add-user remove-user read-list"`);
} else {
  addTokenHash(token, name, privileges.split(' '), err => console.log(err || 'succesfully added token'));
}
