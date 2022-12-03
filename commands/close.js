const { SlashCommandBuilder } = require('discord.js')
const { closeTicket } = require('../ticket')

const data = new SlashCommandBuilder()
    .setName('close')
    .setDescription('Close a ticket')

const execute = async interaction => {
    if (await closeTicket(interaction.channel)) {
        await interaction.reply({
            content: ':white_check_mark: Ticket closed!',
            ephemeral: true,
        })
    } else {
        await interaction.reply({
            content: ':x: This is not a ticket!',
            ephemeral: true,
        })
    }
}

module.exports = {
    data,
    execute,
}
