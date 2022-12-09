import { getNode } from '../db.js'
import { makeTicket } from '../ticket.js'
import { updateInteraction } from '../interaction.js'

export const name = 'ticket'

export const execute = async (interaction, nodeId) => {
    const thread = await makeTicket({
        channel: interaction.channel,
        user: interaction.user,
        description: interaction.fields.getTextInputValue('ticket'),
        node: getNode(parseInt(nodeId)),
    })
    await updateInteraction(interaction, {
        content: `:white_check_mark: Created ${thread}`,
    })
}
