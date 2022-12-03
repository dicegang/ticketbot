const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, StringSelectMenuBuilder } = require('discord.js')

const { menus } = require('./config')

const pathToMenu = new Map()
const pathToDisplay = new Map()

// returns new path when at a menu and selected the index-th option
const newPath = (path, index) => `${path}.${index}`

// get menu by path
const getMenu = path => pathToMenu.get(path)

// get display by path
const getDisplay = path => pathToDisplay.get(path)

// preprocess menus so we can get a submenu by path
const parseMenu = (menu, path, display) => {
    pathToMenu.set(path, menu)
    pathToDisplay.set(path, display.slice(3))

    // we're at a leaf node so don't recurse
    if (menu == null) {
        return
    }

    menu.path = path

    for (let i = 0; i < menu.choices.length; i++) {
        parseMenu(
            menu.choices[i].child,
            newPath(path, i),
            `${display} > ${menu.choices[i].label}`
        )
    }
}
parseMenu(menus, '', '')

// make a message from a menu object
const makeMessage = (type, { kind, title, description, choices, path }) => {
    const embed = new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
    const row = new ActionRowBuilder()

    if (kind === 'buttons') {
        row.addComponents(
            choices.map(({ label }, idx) => (
                new ButtonBuilder()
                    .setCustomId(`${type}-${newPath(path, idx)}`)
                    .setLabel(label)
                    .setStyle(ButtonStyle.Primary)
            ))
        )
    } else { // if (kind === 'select') {
        row.addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('select')
                .setPlaceholder('Select an option')
                .addOptions(
                    choices.map(({ label }, idx) => ({
                        label,
                        value: `${type}-${newPath(path, idx)}`,
                    }))
                )
        )
    }

    return ({
        embeds: [embed],
        components: [row],
    })
}

module.exports = {
    newPath,
    getMenu,
    getDisplay,
    makeMessage,
}
