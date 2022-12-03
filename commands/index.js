const menuCommand = require('./menu')
const closeCommand = require('./close')
const subscribeCommand = require('./subscribe')
const unsubscribeCommand = require('./unsubscribe')
const noteCommand = require('./note')

const commands = [
    menuCommand,
    closeCommand,
    subscribeCommand,
    unsubscribeCommand,
    noteCommand,
]

module.exports = new Map(commands.map(c => [c.data.name, c]))
