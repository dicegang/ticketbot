const { Client, Events, GatewayIntentBits } = require('discord.js')

const { token } = require('./config')
const commands = require('./commands')
const { continueInteraction, endInteraction } = require('./interaction')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
    ]
})

client.once(Events.ClientReady, c => {
    console.log(`Ready! Logged in as ${c.user.tag}`)
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) {
        return
    }

    const command = commands.get(interaction.commandName)

    try {
        await command.execute(interaction)
    } catch (error) {
        console.error(error)
        await interaction.reply({
            content: 'There was an error while executing this command!',
            ephemeral: true,
        })
    }
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton() && !interaction.isModalSubmit()) {
        return
    }

    const value = interaction.customId
    const [type, path] = value.split('-')
    await continueInteraction(interaction, type, path)
})

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isStringSelectMenu()) {
        return
    }

    const value = interaction.values[0]
    const [type, path] = value.split('-')
    await continueInteraction(interaction, type, path)
})

client.login(token)
