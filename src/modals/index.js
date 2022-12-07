import * as ticketModal from './ticket.js'
import * as createModal from './create.js'
import * as updateModal from './update.js'

const modals = [
    ticketModal,
    createModal,
    updateModal,
]

export default new Map(modals.map(c => [c.name, c]))
