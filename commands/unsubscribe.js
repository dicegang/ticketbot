const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { deleteSubscription, getNode, formatAncestry } = require('../db')

const data = new SlashCommandBuilder()
    .setName('unsubscribe')
    .setDescription('Unsubscribe from a ticket topic')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
        option.setName('node')
        .setDescription('The node to unsubscribe from')
        .setAutocomplete(true)
        .setRequired(true)
    )
    .addUserOption(option =>
        option.setName('user')
        .setDescription('The user to unsubscribe (defaults to you)')
    )

const execute = async interaction => {
    const nodeId = parseInt(interaction.options.getString('node'))
    const user = interaction.options.getUser('user') ?? interaction.user
    const result = await deleteSubscription(nodeId, user.id)
    const node = getNode(nodeId)
    const ancestry = formatAncestry(node, true)
    if (!result) {
        await interaction.reply({
            content: `:x: <@${user.id}> is not subscribed to \`${ancestry}\``,
            ephemeral: true,
        })
        return
    }
    await interaction.reply({
        content: `:white_check_mark: Unsubscribed <@${user.id}> from \`${ancestry}\``,
        ephemeral: true,
    })
}

module.exports = {
    data,
    execute,
}
