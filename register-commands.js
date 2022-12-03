const fs = require('node:fs')

const { REST, Routes } = require('discord.js')

const { clientId, guildId, token } = require('./config')
const commands = require('./commands')

const rest = new REST({ version: '10' }).setToken(token)

;(async () => {
	try {
		console.log('Started refreshing commands.')

		await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: Array.from(commands.values(), c => c.data.toJSON()) },
		)

		console.log('Successfully reloaded commands.')
	} catch (error) {
		console.error(error)
	}
})()
