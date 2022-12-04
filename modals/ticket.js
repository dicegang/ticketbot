const { getNode } = require('../db')
const { createTicket } = require('../ticket')
const { updateInteraction } = require('../interaction')

const execute = async (interaction, nodeId) => {
    const node = getNode(parseInt(nodeId))
    const description = interaction.fields.getTextInputValue('ticket')
    const category = interaction.message.channel.parent
    await createTicket(interaction.user, description, category, node)
    await updateInteraction(interaction, {
        content: ':white_check_mark: Created a ticket',
    })
}

module.exports = {
    execute,
    name: 'ticket',
}
