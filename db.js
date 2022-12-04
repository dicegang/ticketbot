const Fuse = require('fuse.js')
const sqlite = require('better-sqlite3')

const db = sqlite('./data/db.sqlite')
db.pragma('journal_mode = WAL')
db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY,
        channel_id TEXT UNIQUE
    ) STRICT;

    CREATE TABLE IF NOT EXISTS nodes (
        id INTEGER PRIMARY KEY,
        parent_id INTEGER REFERENCES nodes(id) ON DELETE CASCADE,
        kind TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        significant INTEGER NOT NULL
    ) STRICT;

    CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY,
        node_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        UNIQUE (node_id, user_id)
    ) STRICT;

    INSERT OR IGNORE INTO nodes (id, kind, name, significant)
        VALUES (1, 'button', 'Create a Ticket', FALSE);
`)

const createTicketStatement = db.prepare('INSERT INTO tickets DEFAULT VALUES RETURNING id;')
const getTicketId = () => createTicketStatement.get().id

const updateTicketStatement = db.prepare('UPDATE TICKETS SET channel_id = ? WHERE id = ?;')
const updateTicketChannel = (ticketId, channelId) => updateTicketStatement.run(channelId, ticketId)

const getTicketStatement = db.prepare('SELECT id FROM tickets WHERE channel_id = ?;')
const getTicket = channelId => getTicketStatement.get(channelId)

const getRootNodeIdStatement = db.prepare('SELECT id FROM nodes WHERE parent_id IS NULL;')
const getRootNodeId = () => getRootNodeIdStatement.get().id

const getNodeStatement = db.prepare('SELECT id, kind, name, description FROM nodes WHERE id = ?;')
const getOptionsStatement = db.prepare('SELECT id, name FROM nodes WHERE parent_id = ?;')
const getAncestryStatement = db.prepare(`
    WITH RECURSIVE n(i) AS (
        SELECT ? UNION ALL SELECT parent_id FROM nodes, n WHERE id = i
    ) SELECT id, name, significant FROM nodes, n WHERE id = i;
`)
const getNode = nodeId => {
    const node = getNodeStatement.get(nodeId)
    node.options = getOptionsStatement.all(nodeId)
    node.ancestry = getAncestryStatement.all(nodeId).reverse()
    return node
}

const formatAncestry = (node, includeInsigificant = false) => {
    let ancestry = node.ancestry
    if (!includeInsigificant) {
        ancestry = ancestry.filter(n => n.significant)
        if (ancestry.length === 0) {
            ancestry = node.ancestry
        }
    }
    return ancestry.map(n => n.name).join(' > ')
}

const fuse = new Fuse([], {
    keys: ['name', {
        name: 'ancestry',
        weight: 0.5,
    }],
})
const getAllNodesStatement = db.prepare('SELECT id, parent_id, name FROM nodes ORDER BY id;')
const updateFuse = () => {
    const nodes = getAllNodesStatement.all()
    const nodeParents = new Map(nodes.map(n => [n.id, []]))
    for (const node of nodes) {
        nodeParents.get(node.parent_id)?.push(node)
    }
    const buildAncestry = (node) => {
        for (const child of nodeParents.get(node.id)) {
            child.ancestry = `${node.ancestry} > ${child.name}`
            buildAncestry(child)
        }
    }
    const root = nodes.find(n => n.parent_id === null)
    root.ancestry = root.name
    buildAncestry(root)
    fuse.setCollection(nodes)
}
updateFuse()

const searchNodes = query => {
    if (query === '') {
        // fuse returns no results for empty queries
        return fuse.getIndex().docs
    }
    const results = fuse.search(query, { limit: 25 })
    return results.map(result => result.item)
}

const deleteNodeStatement = db.prepare('DELETE FROM nodes WHERE id = ?;')
const deleteNode = nodeId => {
    deleteNodeStatement.run(nodeId)
    updateFuse()
}

const createNodeStatement = db.prepare('INSERT INTO nodes (parent_id, kind, name, description, significant) VALUES (?, ?, ?, ?, ?) RETURNING id;')
const createNode = ({ parentId, kind, name, description, significant }) => {
    const nodeId = createNodeStatement.get(parentId, kind, name, description, significant ? 1 : 0).id
    updateFuse()
    return nodeId
}

const updateNodeStatement = db.prepare('UPDATE nodes SET name = ?, description = ? WHERE id = ?;')
const updateNode = (nodeId, { name, description }) => {
    updateNodeStatement.run(name, description, nodeId)
    updateFuse()
}

const createSubscriptionStatement = db.prepare('INSERT INTO subscriptions (node_id, user_id) values (?, ?);')
const createSubscription = (nodeId, userId) => {
    try {
        createSubscriptionStatement.run(nodeId, userId)
        return true
    } catch (e) {
        if (e instanceof sqlite.SqliteError && e.code === 'SQLITE_CONSTRAINT') {
            return false
        }
        throw e
    }
}

const deleteSubscriptionStatement = db.prepare('DELETE FROM subscriptions WHERE node_id = ? AND user_id = ?;')
const deleteSubscription = (nodeId, userId) => {
    const result = deleteSubscriptionStatement.run(nodeId, userId)
    return result.changes > 0
}

const getSubscriptionsStatement = db.prepare(`
    WITH RECURSIVE n(i) AS (
        SELECT ? UNION ALL SELECT parent_id FROM nodes, n WHERE id = i
    ) SELECT user_id FROM subscriptions, n WHERE node_id = i;
`)
const getSubscriptions = nodeId => getSubscriptionsStatement.all(nodeId).map(row => row.user_id)

module.exports = {
    getTicketId,
    updateTicketChannel,
    getTicket,
    getRootNodeId,
    deleteNode,
    createNode,
    updateNode,
    formatAncestry,
    getNode,
    searchNodes,
    createSubscription,
    deleteSubscription,
    getSubscriptions,
}
