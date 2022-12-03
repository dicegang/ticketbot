const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, MessageFlags, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { FlowType } = require('./const');
const { createSubscription, getSubscriptions, deleteSubscription, getNote, putNote } = require('./db');
const { getMenu, makeMessage, getDisplay } = require("./menu")
const { createTicket } = require('./ticket')

// process a selection from a menu
const continueInteraction = async (interaction, type, path) => {
    const menu = getMenu(path)
    if (!menu) {
        // we've reached a leaf, so now we do whatever type is
        if (type === FlowType.Ticket) {
            if (interaction.isModalSubmit()) {
                const category = interaction.message.channel.parent
                const user = interaction.user
                const title = getDisplay(path)
                const description = interaction.fields.getTextInputValue('ticket')
                const subscribers = getSubscriptions(path)
                await createTicket(category, user, title, description, subscribers)
                await interaction.update({
                    content: ':white_check_mark: Ticket created!',
                    embeds: [],
                    components: [],
                })
            } else { // if (interaction.isButton()) {
                const confirm = path.endsWith('!')
                if (confirm) {
                    path = path.slice(0, -1)
                }

                const note = getNote(path)

                if (note && !confirm) {
                    const embed = new EmbedBuilder()
                        .setTitle(getDisplay(path))
                        .setDescription(note)

                    const row = new ActionRowBuilder()
                    row.addComponents(
                        new ButtonBuilder()
                            .setCustomId(`${type}-${path}!`)
                            .setLabel('I still need help')
                            .setStyle(ButtonStyle.Primary)
                    )

                    await interaction.update({
                        content: 'Administrators added the following note to this topic:',
                        embeds: [embed],
                        components: [row],
                    })
                } else {
                    const modal = new ModalBuilder()
                        .setCustomId(`${type}-${path}`)
                        .setTitle('Create a ticket')

                    const ticketInput = new TextInputBuilder()
                        .setCustomId('ticket')
                        .setLabel('What do you need help with?')
                        .setStyle(TextInputStyle.Paragraph)

                    modal.addComponents(new ActionRowBuilder().addComponents(ticketInput))

                    await interaction.showModal(modal)
                }
            }
        } else if (type === FlowType.Subscribe) {
            createSubscription(interaction.user.id, path)
            await interaction.update({
                content: ':white_check_mark: Subscribed!',
                embeds: [],
                components: [],
            })
        } else if (type === FlowType.Unsubscribe) {
            deleteSubscription(interaction.user.id, path)
            await interaction.update({
                content: ':white_check_mark: Unsubscribed!',
                embeds: [],
                components: [],
            })
        } else if (type === FlowType.Note) {
            if (interaction.isModalSubmit()) {
                const note = interaction.fields.getTextInputValue('note')
                putNote(path, note)
                await interaction.update({
                    content: ':white_check_mark: Note updated!',
                    embeds: [],
                    components: [],
                })
            } else {
                const note = getNote(path) ?? ''
                const modal = new ModalBuilder()
                    .setCustomId(`${type}-${path}`)
                    .setTitle('Edit topic note')

                const noteInput = new TextInputBuilder()
                    .setCustomId('note')
                    .setLabel('Topic note')
                    .setStyle(TextInputStyle.Paragraph)
                    .setValue(note)
                    .setRequired(false)

                modal.addComponents(new ActionRowBuilder().addComponents(noteInput))

                await interaction.showModal(modal)
            }
        }
        return
    }
    const message = makeMessage(type, menu);

    if (interaction.message.flags.has(MessageFlags.Ephemeral)) {
        await interaction.update(message);
    } else {
        await interaction.reply({
            ...message,
            ephemeral: true,
        });
    }
};

module.exports = {
    continueInteraction,
}
