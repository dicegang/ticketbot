const { EmbedBuilder } = require('@discordjs/builders')
const { ChannelType, PermissionFlagsBits } = require('discord.js')
const { getTicketId, updateTicketChannel, getTicket } = require('./db')

const createTicket = async (category, user, title, description, subscribers) => {
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
        .setTitle(title)
        .setDescription(description)
        .setAuthor({
            name: user.username,
            iconURL: user.avatarURL(),
        })

    const pingSubs = (subscribers.length > 0) ? subscribers.map(sub => `<@${sub}>`).join(' ') : 'none'

    await channel.send({
        content: `Use \`/close\` to close this ticket.\n\n${user.toString()}\nSubscribers: ${pingSubs}`,
        embeds: [embed],
    })
}

const closeTicket = async channel => {
    const ticket = getTicket(channel.id)
    if (ticket !== undefined) {
        await channel.delete()
        return true
    }
    return false
}

module.exports = {
    createTicket,
    closeTicket,
}
