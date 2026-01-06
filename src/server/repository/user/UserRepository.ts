import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { Database, UserInsertable, UserSelectable } from '../Database'
import { IUserRepository } from '../interfaces/IUserRepository'
import {
    withErrorHandling,
    withErrorHandlingBoolean,
} from '../utils/errorHandling'

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
        return withErrorHandling(
            () =>
                this.db
                    .selectFrom('rtchat.users')
                    .selectAll()
                    .where('id', '=', uuid)
                    .executeTakeFirst(),
            'Error fetching user by UUID'
        )
    }

    async userExists(id: string): Promise<boolean> {
        return withErrorHandlingBoolean(async () => {
            const user = await this.db
                .selectFrom('rtchat.users')
                .select('id')
                .where('id', '=', id)
                .executeTakeFirst()
            return !!user
        }, 'Error checking if user exists')
    }

    async getUserByUsername(
        username: string
    ): Promise<UserSelectable | undefined> {
        return withErrorHandling(
            () =>
                this.db
                    .selectFrom('rtchat.users')
                    .selectAll()
                    .where('username', '=', username)
                    .executeTakeFirst(),
            'Error fetching user by username'
        )
    }

    async getUserById(id: number): Promise<UserSelectable | undefined> {
        return withErrorHandling(
            () =>
                this.db
                    .selectFrom('rtchat.users')
                    .selectAll()
                    .where('internal_id', '=', id)
                    .executeTakeFirst(),
            'Error fetching user by internal ID'
        )
    }

    async createUser(user: UserInsertable): Promise<string | undefined> {
        return withErrorHandling(async () => {
            const result = await this.db
                .insertInto('rtchat.users')
                .values(user)
                .returning('id')
                .executeTakeFirst()
            return result?.id
        }, 'Error creating user')
    }
}

export default UserRepository
