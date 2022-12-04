const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { getNode, getRootNodeId, deleteNode, formatAncestry } = require('../db')

const data = new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Delete a ticket topic')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
        option.setName('node')
        .setDescription('The node to delete')
        .setAutocomplete(true)
        .setRequired(true)
    )

const execute = async interaction => {
    const nodeId = parseInt(interaction.options.getString('node'))
    if (nodeId === getRootNodeId()) {
        await interaction.reply({
            content: ':x: Cannot delete the root node',
            ephemeral: true,
        })
        return
    }
    const ancestry = formatAncestry(getNode(nodeId), true)
    deleteNode(nodeId)
    await interaction.reply({
        content: `:white_check_mark: Deleted \`${ancestry}\``,
        ephemeral: true,
    })
}

module.exports = {
    data,
    execute,
}
