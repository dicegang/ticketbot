import { EmbedBuilder } from '@discordjs/builders'
import { ThreadAutoArchiveDuration, ChannelType } from 'discord.js'
import { createTicket, updateTicket, getSubscriptions, formatAncestry } from './db.js'

export const makeTicket = async ({ user, channel, description, node }) => {
    const ticketId = createTicket(user.id)
    const ancestry = formatAncestry(node)
    const name = `[${ticketId}] ${ancestry} (${user.username})`

    const thread = await channel.threads.create({
        name,
        autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
        type: ChannelType.PrivateThread,
        invitable: false,
    })
    updateTicket(ticketId, thread.id)

    const embed = new EmbedBuilder()
        .setTitle(ancestry)
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
    await thread.send({ content, embeds: [embed] })

    return thread
}
