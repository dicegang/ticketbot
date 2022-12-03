const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { makeMessage } = require('../menu')
const { menus } = require('../config')
const { FlowType } = require('../const')

const data = new SlashCommandBuilder()
    .setName('subscribe')
    .setDescription('Subscribe to a ticket topic')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

const execute = async interaction => {
    const message = makeMessage(FlowType.Subscribe, menus)
    await interaction.reply({
        ...message,
        content: 'Select a topic to subscribe to',
        ephemeral: true,
    })
}

module.exports = {
    data,
    execute,
}
