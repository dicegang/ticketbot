import { TextInputStyle, ModalBuilder, TextInputBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } from 'discord.js'
import { formatAncestry } from './db.js'

export const makeModal = (node) => new ModalBuilder()
    .setCustomId(JSON.stringify({ type: 'ticket', nodeId: node.id }))
    .setTitle('Create a ticket')
    .addComponents(
        new ActionRowBuilder().addComponents(
            new TextInputBuilder()
                .setCustomId('ticket')
                .setLabel('What do you need help with?')
                .setStyle(TextInputStyle.Paragraph)
        )
    )

// make a message from a node
export const makeMessage = (node) => {
    const embed = new EmbedBuilder()
        .setTitle(formatAncestry(node))
    if (node.description) {
        embed.setDescription(node.description)
    }
    const rows = []

    if (node.kind === 'buttons') {
        for (let i = 0; i < node.options.length; i += 5) {
            const row = new ActionRowBuilder().addComponents(
                node.options.slice(i, i + 5).map(option => (
                    new ButtonBuilder()
                        .setCustomId(option.id.toString())
                        .setLabel(option.name)
                        .setStyle(ButtonStyle.Primary)
                ))
            )
            rows.push(row)
        }
    } else if (node.kind === 'select') {
        const row = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select')
                .setPlaceholder('Select an option')
                .addOptions(
                    node.options.map(option => ({
                        label: option.name,
                        value: option.id.toString(),
                    }))
                )
        )
        rows.push(row)
    } else {
        throw new Error(`Invalid node kind: ${node.kind}`)
    }

    return { embeds: [embed], components: rows }
}
