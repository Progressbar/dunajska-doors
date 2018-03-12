const http = require('http')
const Telegraf = require('telegraf')
const { telegrafBotToken } = require('./env')

const token = telegrafBotToken
const bot = new Telegraf(token)

const extractToken = (msg) => {
    const [ command, token ] = msg.split(' ')

    return token
}

const openDoor = (ctx) => {
    ctx.reply('Opening 🚪 in 14s ⚡️ (maybe 😂)')
    const token = extractToken(ctx.message.text)
    http.get(`http://door.bar/api/phone/open/${token}`)
}

const commands = [
    'o',
    'open',
    'O',
    'Open'
];
const slashCommands = commands.map(command => `/${command}`);
const allCommands = [...commands, ...slashCommands];

bot.on('text', (ctx, next) => {
  const [ command ] = ctx.message.text.split(' ');
  if (allCommands.includes(command)) {
    openDoor(ctx); 
  }

  next();
})

bot.startPolling()
