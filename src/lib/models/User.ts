import {db} from '../db';

export class User {
    name: string
    uuid: string
    created_at: Date


    constructor({ name, uuid, created_at }: { name: string, uuid: string, created_at: Date }) {
        this.name = name
        this.uuid = uuid
        this.created_at = created_at
    }

    static async getByUUID(uuid: string) {
        try {
            const userData = await db.oneOrNone('SELECT * FROM users WHERE mc_uuid = $1', uuid)
            return userData ? new User(userData) : null
        } catch (error) {
            console.error('Error fetching user by UUID:', error);
            throw error;
        }
    }


    static async create(name: string, uuid: string) {
        const sql = 'INSERT INTO users (mc_name, mc_uuid) VALUES ($1, $2)'
        const row = await db.one(sql, [name, uuid])

        return new User(row)
    }

}