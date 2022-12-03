const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { makeMessage } = require('../menu')
const { menus } = require('../config')
const { FlowType } = require('../const')

const data = new SlashCommandBuilder()
    .setName('menu')
    .setDescription('Send a help menu message')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

const execute = async interaction => {
    const message = makeMessage(FlowType.Ticket, menus)
    await interaction.channel.send(message)
    await interaction.reply({
        content: ':white_check_mark: Sent a help menu message',
        ephemeral: true,
    })
}

module.exports = {
    data,
    execute,
}
