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
    'open'
]

for (let command of commands) {
    bot.command(command, openDoor)
    bot.hears(command, openDoor)
}

bot.startPolling()
