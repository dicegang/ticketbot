import { SlashCommandBuilder, PermissionFlagsBits } from 'discord.js'
import { makeMessage } from '../menu.js'
import { getRootNodeId, getNode } from '../db.js'

export const data = new SlashCommandBuilder()
    .setName('menu')
    .setDescription('Send a help menu message')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)

export const execute = async interaction => {
    const message = makeMessage(getNode(getRootNodeId()))
    await interaction.channel.send(message)
    await interaction.reply({
        content: ':white_check_mark: Sent help menu message',
        ephemeral: true,
    })
}
