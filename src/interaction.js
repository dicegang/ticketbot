import { MessageFlags } from 'discord.js'
import { makeModal, makeMessage } from './menu.js'
import { getNode, searchNodes } from './db.js'

export const updateInteraction = (interaction, message) => {
    if (interaction.message.flags.has(MessageFlags.Ephemeral)) {
        return interaction.update({
            embeds: [],
            components: [],
            ...message,
        })
    } else {
        return interaction.reply({
            ...message,
            ephemeral: true,
        })
    }
}

// process a selection from a menu
export const continueMenu = async (interaction, nodeId) => {
    const node = getNode(nodeId)
    if (node.options.length === 0) {
        // leaf node, ask for ticket description
        await interaction.showModal(makeModal(node))
        return
    }
    const message = makeMessage(node)
    await updateInteraction(interaction, message)
}

export const handleAutocomplete = async interaction => {
    const query = interaction.options.getFocused()
    const results = searchNodes(query).map(result => ({
        name: result.ancestry,
        value: result.id.toString()
    }))
    await interaction.respond(results)
}
