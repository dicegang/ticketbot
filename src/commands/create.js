import { SlashCommandBuilder, PermissionFlagsBits, TextInputBuilder, ModalBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js'
import { resolveNode } from '../db.js'

export const data = new SlashCommandBuilder()
    .setName('create')
    .setDescription('Create a ticket topic')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
        option.setName('parent')
        .setDescription('The parent of this node')
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('kind')
        .setDescription('The kind of node to create')
        .setRequired(true)
        .setChoices(
            { name: 'Buttons', value: 'buttons' },
            { name: 'Select', value: 'select' },
        )
    )
    .addBooleanOption(option =>
        option.setName('significant')
        .setDescription('Whether this node should be shown in ancestry (default true)')
    )

export const execute = async (interaction) => {
    const parentId = resolveNode(interaction.options.getString('parent'))
    const kind = interaction.options.getString('kind')
    const significant = interaction.options.getBoolean('significant') ?? true
    const modal = new ModalBuilder()
        // TODO: use modal session id
        .setCustomId(JSON.stringify({ type: 'create', parentId, kind, significant }))
        .setTitle('Create a node')
        .addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('name')
                    .setLabel('Node name')
                    .setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder()
                    .setCustomId('description')
                    .setLabel('Node description')
                    .setRequired(false)
                    .setStyle(TextInputStyle.Paragraph)
            ),
        )
    await interaction.showModal(modal)
}
