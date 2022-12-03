const createEnum = values => {
    const enumObject = {}
    for (const val of values) {
        enumObject[val] = val.toLowerCase()
    }
    return Object.freeze(enumObject)
}

const FlowType = createEnum(['Ticket', 'Subscribe', 'Unsubscribe', 'Note'])

module.exports = {
    FlowType,
}
