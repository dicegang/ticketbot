import * as menuCommand from './menu.js'
import * as closeCommand from './close.js'
import * as subscribeCommand from './subscribe.js'
import * as unsubscribeCommand from './unsubscribe.js'
import * as deleteCommand from './delete.js'
import * as createCommand from './create.js'
import * as updateCommand from './update.js'

const commands = [
    menuCommand,
    closeCommand,
    subscribeCommand,
    unsubscribeCommand,
    deleteCommand,
    createCommand,
    updateCommand,
]

export default new Map(commands.map(c => [c.data.name, c]))
