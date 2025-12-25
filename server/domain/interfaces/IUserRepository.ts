import { User } from '../user/User'

export interface UserRepositoryInterface {
    getUserByUsername: (username: string) => Promise<User | undefined>
    getUserById: (id: number) => Promise<User | undefined>
    createUser: (
        username: string,
        password: string,
        email: string
    ) => Promise<number | undefined>
}
