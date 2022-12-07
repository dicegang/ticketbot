import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import { createSubscription, getNode, formatAncestry } from '../db.js'

export const data = new SlashCommandBuilder()
    .setName('subscribe')
    .setDescription('Subscribe to a ticket topic')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
        option.setName('node')
        .setDescription('The node to subscribe to')
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addUserOption(option =>
        option.setName('user')
        .setDescription('The user to subscribe (default you)')
    )

export const execute = async (interaction) => {
    const nodeId = parseInt(interaction.options.getString('node'))
    const user = interaction.options.getUser('user') ?? interaction.user
    const result = await createSubscription(nodeId, user.id)
    const ancestry = formatAncestry(getNode(nodeId), true)
    if (!result) {
        await interaction.reply({
            content: `:x: <@${user.id}> is already subscribed to \`${ancestry}\``,
            ephemeral: true,
        })
        return
    }
    await interaction.reply({
        content: `:white_check_mark: Subscribed <@${user.id}> to \`${ancestry}\``,
        ephemeral: true,
    })
}
