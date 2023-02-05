import { updateNode, formatAncestry, getNode } from '../db.js'

export const name = 'update'

export const execute = async (interaction, meta) => {
    const { nodeId } = meta
    const name = interaction.fields.getTextInputValue('name')
    const description = interaction.fields.getTextInputValue('description')
    await updateNode(nodeId, { name, description })
    const ancestry = formatAncestry(getNode(nodeId), true)
    await interaction.reply({
        content: `:white_check_mark: Updated \`${ancestry}\``,
        ephemeral: true,
    })
}
