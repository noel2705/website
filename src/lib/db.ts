import pgPromise from 'pg-promise'

const pgp = pgPromise({ capSQL: true })

const createDb = () =>
    pgp({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false,
        },
    })

declare global {
    var db: ReturnType<typeof createDb> | undefined
}

export const db = global.db ?? createDb()

if (process.env.NODE_ENV !== 'production') {
    global.db = db
}