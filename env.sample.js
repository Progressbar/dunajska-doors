module.exports = {
  path: __dirname + '/',
  hash: (key) => key.split('').reverse().join(''),
  port: 8080
}
