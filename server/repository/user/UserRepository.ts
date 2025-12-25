import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { IUserRepository } from '../../repository/interfaces/IUserRepository'
import { Database } from '../Database'
import { UserSelectable } from '../selectables/UserSelectable'

class UserRepository implements IUserRepository {
    private db: Kysely<Database>

    constructor() {
        this.db = new Kysely<Database>({
            dialect: new PostgresDialect({
                pool: new Pool({
                    user: process.env.DB_USER,
                    host: process.env.DB_HOST,
                    database: process.env.DB_NAME,
                    password: process.env.DB_PASSWORD,
                    port: process.env.DB_PORT
                        ? parseInt(process.env.DB_PORT)
                        : 5432,
                }),
            }),
        })
    }

    async getUserByUsername(
        username: string
    ): Promise<UserSelectable | undefined> {
        try {
            const user = await this.db
                .selectFrom('rt-chat.users')
                .selectAll()
                .where('username', '=', username)
                .executeTakeFirst()
            return user
        } catch (error) {
            console.error(error)
            return undefined
        }
    }

    async getUserById(id: number): Promise<UserSelectable | undefined> {
        try {
            const user = await this.db
                .selectFrom('rt-chat.users')
                .selectAll()
                .where('id', '=', id)
                .executeTakeFirst()
            return user
        } catch (error) {
            console.error(error)
            return undefined
        }
    }

    async createUser(
        username: string,
        password: string,
        email: string
    ): Promise<number | undefined> {
        try {
            const result = await this.db
                .insertInto('rt-chat.users')
                .values({ username, email, password })
                .returning('id')
                .executeTakeFirst()
            return result?.id
        } catch (e) {
            console.log(e)
            return undefined
        }
    }
}

export default UserRepository
