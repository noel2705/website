import "dotenv/config";
import pgPromise from "pg-promise";

const pgp = pgPromise({ capSQL: true });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL fehlt. Bitte in Railway/Umgebung setzen.");
}

export const db = pgp({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});
