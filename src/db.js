import Fuse from 'fuse.js'
import sqlite from 'better-sqlite3'

const db = sqlite('./data/db.sqlite')
db.pragma('journal_mode = WAL')
db.pragma('foreign_keys = ON')
db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY,
        user_id TEXT NOT NULL,
        thread_id TEXT UNIQUE
    ) STRICT;

    CREATE TABLE IF NOT EXISTS nodes (
        id INTEGER PRIMARY KEY,
        parent_id INTEGER REFERENCES nodes ON DELETE CASCADE,
        kind TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        significant INTEGER NOT NULL
    ) STRICT;
    CREATE INDEX IF NOT EXISTS nodes_parent_id ON nodes (parent_id);

    CREATE TABLE IF NOT EXISTS subscriptions (
        node_id INTEGER REFERENCES nodes ON DELETE CASCADE,
        user_id TEXT,
        PRIMARY KEY (node_id, user_id)
    ) WITHOUT ROWID, STRICT;

    INSERT OR IGNORE INTO nodes (id, kind, name, description, significant)
        VALUES (1, 'buttons', 'Create a Ticket', '', FALSE);
`)

const createTicketStatement = db.prepare('INSERT INTO tickets (user_id) VALUES (?) RETURNING id;')
export const createTicket = (userId) => createTicketStatement.get(userId).id

const updateTicketStatement = db.prepare('UPDATE TICKETS SET thread_id = ? WHERE id = ?;')
export const updateTicket = (ticketId, threadId) => updateTicketStatement.run(threadId, ticketId)

const getTicketStatement = db.prepare('SELECT id, user_id FROM tickets WHERE thread_id = ?;')
export const getTicket = (threadId) => getTicketStatement.get(threadId)

const getRootNodeIdStatement = db.prepare('SELECT id FROM nodes WHERE parent_id IS NULL;')
export const getRootNodeId = () => getRootNodeIdStatement.get().id

const getNodeStatement = db.prepare('SELECT id, kind, name, description FROM nodes WHERE id = ?;')
const getOptionsStatement = db.prepare('SELECT id, name FROM nodes WHERE parent_id = ?;')
const getAncestryStatement = db.prepare(`
    WITH RECURSIVE n(i) AS (
        SELECT ? UNION ALL SELECT parent_id FROM nodes, n WHERE id = i
    ) SELECT id, name, significant FROM nodes, n WHERE id = i;
`)
export const getNode = (nodeId) => {
    const node = getNodeStatement.get(nodeId)
    if (!node) {
        return
    }
    node.options = getOptionsStatement.all(nodeId)
    node.ancestry = getAncestryStatement.all(nodeId).reverse()
    return node
}

export const formatAncestry = (node, includeInsigificant = false) => {
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
    keys: ['name', { // name has weight 1
        name: 'ancestry',
        weight: 0.5,
    }],
})
let nodeAncestries
const getAllNodesStatement = db.prepare('SELECT id, parent_id, name FROM nodes ORDER BY id;')
const updateFuse = () => {
    const nodes = getAllNodesStatement.all()
    const nodeChildren = new Map(nodes.map(n => [n.id, []]))
    for (const node of nodes) {
        nodeChildren.get(node.parent_id)?.push(node)
    }
    const buildAncestry = (node) => {
        for (const child of nodeChildren.get(node.id)) {
            child.ancestry = `${node.ancestry} > ${child.name}`
            buildAncestry(child)
        }
    }
    const root = nodes.find(n => n.parent_id === null)
    root.ancestry = root.name
    buildAncestry(root)
    nodeAncestries = new Map()
    for (const node of nodes) {
        nodeAncestries.set(node.ancestry, node.id)
    }
    fuse.setCollection(nodes)
}
updateFuse()

export const searchNodes = (query) => {
    if (query === '') {
        // fuse returns no results for empty queries
        return fuse.getIndex().docs.slice(0, 25)
    }
    const results = fuse.search(query, { limit: 25 })
    return results.map(result => result.item)
}

export const resolveNode = (idOrAncestry) => {
    if (/^\d+$/.test(idOrAncestry)) {
        return parseInt(idOrAncestry)
    }
    return nodeAncestries.get(idOrAncestry)
}

const deleteNodeStatement = db.prepare('DELETE FROM nodes WHERE id = ?;')
export const deleteNode = (nodeId) => {
    deleteNodeStatement.run(nodeId)
    updateFuse()
}

const createNodeStatement = db.prepare('INSERT INTO nodes (parent_id, kind, name, description, significant) VALUES (?, ?, ?, ?, ?) RETURNING id;')
export const createNode = ({ parentId, kind, name, description, significant }) => {
    const nodeId = createNodeStatement.get(parentId, kind, name, description, significant ? 1 : 0).id
    updateFuse()
    return nodeId
}

const updateNodeStatement = db.prepare('UPDATE nodes SET name = ?, description = ? WHERE id = ?;')
export const updateNode = (nodeId, { name, description }) => {
    updateNodeStatement.run(name, description, nodeId)
    updateFuse()
}

const createSubscriptionStatement = db.prepare('INSERT INTO subscriptions (node_id, user_id) values (?, ?);')
export const createSubscription = (nodeId, userId) => {
    try {
        createSubscriptionStatement.run(nodeId, userId)
        return true
    } catch (e) {
        if (e instanceof sqlite.SqliteError && e.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
            return false
        }
        throw e
    }
}

const deleteSubscriptionStatement = db.prepare('DELETE FROM subscriptions WHERE node_id = ? AND user_id = ?;')
export const deleteSubscription = (nodeId, userId) => {
    const result = deleteSubscriptionStatement.run(nodeId, userId)
    return result.changes > 0
}

const getSubscriptionsStatement = db.prepare(`
    WITH RECURSIVE n(i) AS (
        SELECT ? UNION ALL SELECT parent_id FROM nodes, n WHERE id = i
    ) SELECT DISTINCT user_id FROM subscriptions, n WHERE node_id = i;
`)
export const getSubscriptions = (nodeId) => getSubscriptionsStatement.all(nodeId).map(row => row.user_id)
