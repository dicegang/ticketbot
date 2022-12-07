import { createNode, formatAncestry, getNode } from '../db.js'

export const execute = async (interaction, metadata) => {
    const { parentId, kind, significant } = JSON.parse(metadata)
    if (parentId === null) {
        await interaction.reply({
            content: ':x: Invalid parent',
            ephemeral: true,
        })
        return
    }
    const name = interaction.fields.getTextInputValue('name')
    const description = interaction.fields.getTextInputValue('description')
    const nodeId = await createNode({
        parentId,
        kind,
        name,
        description,
        significant,
    })
    const ancestry = formatAncestry(getNode(nodeId), true)
    await interaction.reply({
        content: `:white_check_mark: Created \`${ancestry}\``,
        ephemeral: true,
    })
}

export const name = 'create'
