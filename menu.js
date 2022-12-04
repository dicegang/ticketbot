const { TextInputStyle, ModalBuilder, TextInputBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js')
const { formatAncestry } = require('./db')

const makeModal = (node) => {
    const modal = new ModalBuilder()
        .setCustomId('ticket:' + node.id)
        .setTitle('Create a ticket')

    const ticketInput = new TextInputBuilder()
        .setCustomId('ticket')
        .setLabel('What do you need help with?')
        .setStyle(TextInputStyle.Paragraph)

    modal.addComponents(new ActionRowBuilder().addComponents(ticketInput))
    return modal
}

// make a message from a node
const makeMessage = (node) => {
    const embed = new EmbedBuilder()
        .setTitle(formatAncestry(node))
        .setDescription(node.description)
    const row = new ActionRowBuilder()

    if (node.kind === 'buttons') {
        row.addComponents(
            node.options.map(option => (
                new ButtonBuilder()
                    .setCustomId(option.id.toString())
                    .setLabel(option.name)
                    .setStyle(ButtonStyle.Primary)
            ))
        )
    } else if (node.kind === 'select') {
        row.addComponents(
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
    }

    return {
        embeds: [embed],
        components: [row],
    }
}

module.exports = {
    makeModal,
    makeMessage,
}
