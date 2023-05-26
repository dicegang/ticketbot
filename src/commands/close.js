import { SlashCommandBuilder } from 'discord.js'
import { getTicket } from '../db.js'

export const data = new SlashCommandBuilder()
    .setName('close')
    .setDescription('Close a ticket')

export const execute = async (interaction) => {
    const ticket = getTicket(interaction.channel.id)
    if (!ticket) {
        await interaction.reply({
            content: ':x: This is not a ticket!',
            ephemeral: true,
        })
    } else {
        await interaction.reply({
            content: ':white_check_mark: Closing ticket...',
            ephemeral: true,
        })
        await interaction.channel.edit({
            archived: true,
            locked: true,
        })
    }
}
