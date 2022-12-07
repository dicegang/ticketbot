import { SlashCommandBuilder } from 'discord.js'
import { closeTicket } from '../ticket.js'

export const data = new SlashCommandBuilder()
    .setName('close')
    .setDescription('Close a ticket')

export const execute = async (interaction) => {
    if (!await closeTicket(interaction.channel)) {
        await interaction.reply({
            content: ':x: This is not a ticket!',
            ephemeral: true,
        })
        return
    }
    await interaction.reply({
        content: ':white_check_mark: Ticket closed!',
        ephemeral: true,
    })
}
