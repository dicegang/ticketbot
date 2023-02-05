import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import { getNode, getRootNodeId, deleteNode, formatAncestry, resolveNode } from '../db.js'

export const data = new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Delete a ticket topic')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
        option.setName('node')
        .setDescription('The node to delete')
        .setAutocomplete(true)
        .setRequired(true)
    )

export const execute = async (interaction) => {
    const nodeId = resolveNode(interaction.options.getString('node'))
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
