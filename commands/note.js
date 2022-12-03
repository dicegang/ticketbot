const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js')
const { makeMessage } = require('../menu')
const { menus } = require('../config')
const { FlowType } = require('../const')

const data = new SlashCommandBuilder()
    .setName('note')
    .setDescription('Edit note for a topic')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)

const execute = async interaction => {
    const message = makeMessage(FlowType.Note, menus)
    await interaction.reply({
        ...message,
        content: 'Select a topic to edit',
        ephemeral: true,
    })
}

module.exports = {
    data,
    execute,
}
