require('dotenv/config')
const { Client, Events, GatewayIntentBits, REST, Routes } = require('discord.js')
const { continueMenu, handleAutocomplete } = require('./interaction')
const commands = require('./commands')
const modals = require('./modals')

const token = process.env.APP_DISCORD_TOKEN
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.MessageContent,
    ]
})
const rest = new REST().setToken(token)

client.once(Events.ClientReady, async evt => {
    console.log(`Ready! Logged in as ${evt.user.tag}`)
    await rest.put(
        Routes.applicationGuildCommands(evt.user.id, process.env.APP_DISCORD_GUILD),
        { body: Array.from(commands.values(), c => c.data.toJSON()) },
    )
    console.log('Successfully reloaded commands.')
})

client.on(Events.InteractionCreate, async interaction => {
    try {
        if (interaction.isChatInputCommand()) {
            const command = commands.get(interaction.commandName)
            await command.execute(interaction)
        } else if (interaction.isAutocomplete()) {
            await handleAutocomplete(interaction)
        } else if (interaction.isButton()) {
            await continueMenu(interaction, parseInt(interaction.customId))
        } else if (interaction.isStringSelectMenu()) {
            await continueMenu(interaction, parseInt(interaction.values[0]))
        } else if (interaction.isModalSubmit()) {
            const [, type, value] = interaction.customId.match(/^(.*?):(.*)$/)
            const modal = modals.get(type)
            await modal.execute(interaction, value)
        }
    } catch (e) {
        console.error(e)
        await interaction.reply({
            content: 'There was an error!',
            ephemeral: true,
        })
    }
})

client.login(token)
