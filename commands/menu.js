const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { makeMessage } = require('../menu')
const { getRootNodeId, getNode } = require('../db')

const data = new SlashCommandBuilder()
    .setName('menu')
    .setDescription('Send a help menu message')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

const execute = async interaction => {
    const message = makeMessage(getNode(getRootNodeId()))
    await interaction.channel.send(message)
    await interaction.reply({
        content: ':white_check_mark: Sent help menu message',
        ephemeral: true,
    })
}

module.exports = {
    data,
    execute,
}
