const { createNode } = require('../db')

const execute = async (interaction, metadata) => {
    const { parentId, kind, significant } = JSON.parse(metadata)
    const name = interaction.fields.getTextInputValue('name')
    const description = interaction.fields.getTextInputValue('description')
    await createNode({
        parentId,
        kind,
        name,
        description,
        significant,
    })
    await interaction.reply({
        content: ':white_check_mark: Created node',
        ephemeral: true,
    })
}

module.exports = {
    execute,
    name: 'create',
}
