import {db} from '../utils/db';

export class User {
    name: string
    mc_uuid: string
    password: string
    created_at: Date
    role: string


    constructor({ name, mc_uuid, created_at, password, role}: { name: string, mc_uuid: string, created_at: Date, password: string, role: string }) {
        this.name = name
        this.mc_uuid = mc_uuid
        this.created_at = created_at
        this.password = password
        this.role = role
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





}