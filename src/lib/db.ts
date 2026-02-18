import pgPromise from "pg-promise"

const pgp = pgPromise({
    capSQL: true,
})

const createDb = () =>  pgp(process.env.DATABASE_URL ?? '')

declare global {
    var db: ReturnType<typeof createDb> | undefined
}

export const db = global.db ?? createDb()

if (process.env.NODE_ENV !== "production") {
    global.db = db
}





