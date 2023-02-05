import { SlashCommandBuilder, PermissionFlagsBits, TextInputBuilder, ModalBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js'
import { getNode, resolveNode } from '../db.js'

export const data = new SlashCommandBuilder()
    .setName('update')
    .setDescription('Update a ticket topic')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
        option.setName('node')
        .setDescription('The node to update')
        .setAutocomplete(true)
        .setRequired(true)
    )

export const execute = async (interaction) => {
    const nodeId = resolveNode(interaction.options.getString('node'))
    const node = getNode(nodeId)
    const modal = new ModalBuilder()
        // TODO: use modal session id
        .setCustomId(JSON.stringify({ type: 'update', nodeId }))
        .setTitle('Update a node')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('name')
                    .setLabel('Node name')
                    .setStyle(TextInputStyle.Short)
                    .setValue(node.name)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('description')
                    .setLabel('Node description')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(false)
                    .setValue(node.description)
            ),
        )
    await interaction.showModal(modal)
}
