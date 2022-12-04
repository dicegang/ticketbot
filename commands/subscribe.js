const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { getNode, createSubscription, formatAncestry } = require('../db')

const data = new SlashCommandBuilder()
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
        .setDescription('The user to subscribe (defaults to you)')
    )

const execute = async interaction => {
    const nodeId = parseInt(interaction.options.getString('node'))
    const user = interaction.options.getUser('user') ?? interaction.user
    const result = await createSubscription(nodeId, user.id)
    const node = getNode(nodeId)
    const ancestry = formatAncestry(node, true)
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

module.exports = {
    data,
    execute,
}
