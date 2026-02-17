import { Kysely, PostgresDialect } from 'kysely'
import { Database, UserInsertable, UserSelectable } from '../Database'
import { IUserRepository } from '../interfaces/IUserRepository'
import { getPostgresPool } from '../utils/databaseClients'
import {
    withErrorHandling,
    withErrorHandlingBoolean,
} from '../utils/errorHandling'

class UserRepository implements IUserRepository {
    private db: Kysely<Database>

    constructor() {
        this.db = new Kysely<Database>({
            dialect: new PostgresDialect({
                pool: getPostgresPool(),
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

    async getUsersByIds(ids: number[]): Promise<UserSelectable[]> {
        if (ids.length === 0) return []
        return withErrorHandling(
            () =>
                this.db
                    .selectFrom('rtchat.users')
                    .selectAll()
                    .where('internal_id', 'in', ids)
                    .execute(),
            'Error fetching users by internal IDs'
        ).then((users) => users || [])
    }

    async createUser(
        user: UserInsertable
    ): Promise<{ id: string; internal_id: number } | undefined> {
        return withErrorHandling(async () => {
            const result = await this.db
                .insertInto('rtchat.users')
                .values(user)
                .returning(['id', 'internal_id'])
                .executeTakeFirst()
            return result
                ? { id: result.id, internal_id: result.internal_id }
                : undefined
        }, 'Error creating user')
    }
}

export default UserRepository
