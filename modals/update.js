const { updateNode } = require('../db')

const execute = async (interaction, metadata) => {
    const { nodeId } = JSON.parse(metadata)
    const name = interaction.fields.getTextInputValue('name')
    const description = interaction.fields.getTextInputValue('description')
    await updateNode(nodeId, { name, description })
    await interaction.reply({
        content: ':white_check_mark: Updated node',
        ephemeral: true,
    })
}

module.exports = {
    execute,
    name: 'update',
}
