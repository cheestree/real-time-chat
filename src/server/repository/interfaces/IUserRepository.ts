import { UserInsertable, UserSelectable } from '../Database'

export interface IUserRepository {
    getUserByUsername: (username: string) => Promise<UserSelectable | undefined>
    getUserById: (id: number) => Promise<UserSelectable | undefined>
    getUserByUUID: (uuid: string) => Promise<UserSelectable | undefined>
    createUser: (
        user: UserInsertable
    ) => Promise<{ id: string; internal_id: number } | undefined>
    userExists: (id: string) => Promise<boolean>
}
