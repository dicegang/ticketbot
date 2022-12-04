import { EmbedBuilder } from '@discordjs/builders'
import { ChannelType, PermissionFlagsBits } from 'discord.js'
import { getTicketId, updateTicketChannel, getTicket, getSubscriptions, formatAncestry } from './db.js'

export const createTicket = async (user, description, category, node) => {
    const ticketId = getTicketId()
    const channelName = `${ticketId}-${user.username}`

    const channel = await category.guild.channels.create({
        name: channelName,
        type: ChannelType.GuildText,
        parent: category,
        permissionOverwrites: [
            {
                id: user.id,
                allow: [PermissionFlagsBits.ViewChannel],
                type: 'member',
            },
            {
                id: category.guildId,
                deny: [PermissionFlagsBits.ViewChannel],
                type: 'role',
            },
        ]
    })
    updateTicketChannel(ticketId, channel.id)

    const embed = new EmbedBuilder()
        .setTitle(formatAncestry(node))
        .setDescription(description)
        .setAuthor({
            name: user.username,
            iconURL: user.avatarURL(),
        })

    let content = `Use \`/close\` to close this ticket.\n\n${user}`
    const subscribers = getSubscriptions(node.id)
    if (subscribers.length > 0) {
        content += `\nSubscribers: ${subscribers.map(sub => `<@${sub}>`).join(' ')}`
    }
    await channel.send({ content, embeds: [embed] })
}

export const closeTicket = async channel => {
    const ticket = getTicket(channel.id)
    if (ticket !== undefined) {
        await channel.delete()
        return true
    }
    return false
}
