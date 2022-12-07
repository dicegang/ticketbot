import { updateNode, formatAncestry, getNode } from '../db.js'

export const execute = async (interaction, metadata) => {
    const { nodeId } = JSON.parse(metadata)
    const name = interaction.fields.getTextInputValue('name')
    const description = interaction.fields.getTextInputValue('description')
    await updateNode(nodeId, { name, description })
    const ancestry = formatAncestry(getNode(nodeId), true)
    await interaction.reply({
        content: `:white_check_mark: Updated \`${ancestry}\``,
        ephemeral: true,
    })
}

export const name = 'update'
