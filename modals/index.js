const ticketModal = require('./ticket')
const createModal = require('./create')
const updateModal = require('./update')

const modals = [
    ticketModal,
    createModal,
    updateModal,
]

module.exports = new Map(modals.map(c => [c.name, c]))
