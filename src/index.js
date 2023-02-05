import 'dotenv/config'
import { Client, Events, GatewayIntentBits, REST, Routes, PermissionFlagsBits } from 'discord.js'
import { continueMenu, handleAutocomplete } from './interaction.js'
import { getTicket } from './db.js'
import commands from './commands/index.js'
import modals from './modals/index.js'

const token = process.env.APP_DISCORD_TOKEN
const guildId = process.env.APP_DISCORD_GUILD

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
})
const rest = new REST().setToken(token)

client.once(Events.ClientReady, async (evt) => {
    console.log(`Ready! Logged in as ${evt.user.tag}`)
    await rest.put(
        Routes.applicationGuildCommands(evt.user.id, guildId),
        { body: Array.from(commands.values(), c => c.data.toJSON()) },
    )
    console.log('Successfully reloaded commands.')
})

client.on(Events.InteractionCreate, async (interaction) => {
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
            const meta = JSON.parse(interaction.customId)
            const modal = modals.get(meta.type)
            await modal.execute(interaction, meta)
        }
    } catch (e) {
        console.error(e)
        await interaction.reply({
            content: ':x: There was an error!',
            ephemeral: true,
        })
    }
})

client.on(Events.ThreadUpdate, async (_oldThread, newThread) => {
    // re-lock manually unlocked ticket threads
    if (!getTicket(newThread.id)) {
        return
    }
    if (!newThread.archived && !newThread.locked) {
        await newThread.setLocked(true)
    }
})

client.on(Events.ThreadMembersUpdate, async (_addedMembers, removedMembers, thread) => {
    // archive ticket threads if user leaves
    const ticket = getTicket(thread.id)
    if (!ticket) {
        return
    }
    if (removedMembers.has(ticket.user_id)) {
        await thread.setArchived(true)
    }
})

client.login(token)
