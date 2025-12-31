import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { Database, UserInsertable, UserSelectable } from '../Database'
import { IUserRepository } from '../interfaces/IUserRepository'

class UserRepository implements IUserRepository {
    private db: Kysely<Database>

    constructor() {
        this.db = new Kysely<Database>({
            dialect: new PostgresDialect({
                pool: new Pool({
                    user: process.env.POSTGRES_USER,
                    host: process.env.POSTGRES_HOST,
                    database: process.env.POSTGRES_DB,
                    password: process.env.POSTGRES_PASSWORD,
                    port: process.env.POSTGRES_PORT
                        ? parseInt(process.env.POSTGRES_PORT)
                        : 5432,
                }),
            }),
        })
    }
    async getUserByUUID(uuid: string): Promise<UserSelectable | undefined> {
        try {
            return await this.db
                .selectFrom('rtchat.users')
                .selectAll()
                .where('id', '=', uuid)
                .executeTakeFirst()
        } catch (error) {
            console.error(error)
            return undefined
        }
    }

    async userExists(id: string): Promise<boolean> {
        try {
            const user = await this.db
                .selectFrom('rtchat.users')
                .select('id')
                .where('id', '=', id)
                .executeTakeFirst()
            return !!user
        } catch (error) {
            console.error(error)
            return false
        }
    }

    async getUserByUsername(
        username: string
    ): Promise<UserSelectable | undefined> {
        try {
            return await this.db
                .selectFrom('rtchat.users')
                .selectAll()
                .where('username', '=', username)
                .executeTakeFirst()
        } catch (error) {
            console.error(error)
            return undefined
        }
    }

    async getUserById(id: number): Promise<UserSelectable | undefined> {
        try {
            return await this.db
                .selectFrom('rtchat.users')
                .selectAll()
                .where('internal_id', '=', id)
                .executeTakeFirst()
        } catch (error) {
            console.error(error)
            return undefined
        }
    }

    async createUser(user: UserInsertable): Promise<string | undefined> {
        try {
            const result = await this.db
                .insertInto('rtchat.users')
                .values(user)
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
