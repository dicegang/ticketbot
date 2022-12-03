const sqlite = require('better-sqlite3')

const db = sqlite('./data/db.sqlite')
db.defaultSafeIntegers()
db.pragma('journal_mode = WAL')
db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
        id INTEGER PRIMARY KEY,
        channel_id TEXT UNIQUE
    );

    CREATE TABLE IF NOT EXISTS subscriptions (
        id INTEGER PRIMARY KEY,
        user_id TEXT NOT NULL,
        path TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY,
        path TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL
    );
`)

const createTicketStatement = db.prepare('insert into tickets default values returning id;')
const getTicketId = () => createTicketStatement.get().id

const updateTicketStatement = db.prepare('update tickets set channel_id = ? where id = ?;')
const updateTicketChannel = (ticketId, channelId) => updateTicketStatement.run(channelId, ticketId)

const getTicketStatement = db.prepare('select id from tickets where channel_id = ?;')
const getTicket = channelId => getTicketStatement.get(channelId)

const createSubscriptionStatement = db.prepare('insert into subscriptions (user_id, path) values (?, ?);')
const createSubscription = (userId, path) => createSubscriptionStatement.run(userId, path)

const getSubscriptionsStatement = db.prepare('select user_id from subscriptions where path = ?;')
const getSubscriptions = path => getSubscriptionsStatement.all(path).map(row => row.user_id)

const deleteSubscriptionStatement = db.prepare('delete from subscriptions where user_id = ? and path = ?;')
const deleteSubscription = (userId, path) => deleteSubscriptionStatement.run(userId, path)

const getNoteStatement = db.prepare('select content from notes where path = ?;')
const getNote = path => getNoteStatement.get(path)?.content

const putNoteStatement = db.prepare('insert into notes (path, content) values (?, ?) on conflict (path) do update set content = excluded.content;')
const putNote = (path, content) => putNoteStatement.run(path, content)

module.exports = {
    getTicketId,
    updateTicketChannel,
    getTicket,
    createSubscription,
    getSubscriptions,
    deleteSubscription,
    getNote,
    putNote,
}
