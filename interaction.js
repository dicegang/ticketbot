const { MessageFlags } = require('discord.js')
const { makeModal, makeMessage } = require('./menu')
const { getNode, searchNodes } = require('./db')

const updateInteraction = (interaction, message) => {
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
const continueMenu = async (interaction, nodeId) => {
    const node = getNode(nodeId)
    if (node.options.length === 0) {
        // leaf node, ask for ticket description
        await interaction.showModal(makeModal(node))
        return
    }
    const message = makeMessage(node)
    await updateInteraction(interaction, message)
}

const handleAutocomplete = async interaction => {
    const query = interaction.options.getFocused()
    const results = searchNodes(query).map(result => ({
        name: result.ancestry,
        value: result.id.toString()
    }))
    await interaction.respond(results)
}

module.exports = {
    continueMenu,
    handleAutocomplete,
    updateInteraction,
}
