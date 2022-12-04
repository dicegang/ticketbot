const menuCommand = require('./menu')
const closeCommand = require('./close')
const subscribeCommand = require('./subscribe')
const unsubscribeCommand = require('./unsubscribe')
const deleteCommand = require('./delete')
const createCommand = require('./create')
const updateCommand = require('./update')

const commands = [
    menuCommand,
    closeCommand,
    subscribeCommand,
    unsubscribeCommand,
    deleteCommand,
    createCommand,
    updateCommand,
]

module.exports = new Map(commands.map(c => [c.data.name, c]))
