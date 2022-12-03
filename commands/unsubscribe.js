const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { makeMessage } = require('../menu')
const { menus } = require('../config')
const { FlowType } = require('../const')

const data = new SlashCommandBuilder()
    .setName('unsubscribe')
    .setDescription('Unsubscribe from a ticket topic')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

const execute = async interaction => {
    const message = makeMessage(FlowType.Unsubscribe, menus)
    await interaction.reply({
        ...message,
        content: 'Select a topic to unsubscribe from',
        ephemeral: true,
    })
}

module.exports = {
    data,
    execute,
}
