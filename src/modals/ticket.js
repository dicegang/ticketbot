import { getNode } from '../db.js'
import { createTicket } from '../ticket.js'
import { updateInteraction } from '../interaction.js'

export const execute = async (interaction, nodeId) => {
    const node = getNode(parseInt(nodeId))
    const description = interaction.fields.getTextInputValue('ticket')
    const category = interaction.message.channel.parent
    await createTicket(interaction.user, description, category, node)
    await updateInteraction(interaction, {
        content: ':white_check_mark: Created a ticket',
    })
}

export const name = 'ticket'
