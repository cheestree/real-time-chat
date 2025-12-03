import { User } from '../../domain/user/User'

export interface UserRepositoryInterface {
    getUserByUsername: (username: string) => Promise<User>
    getUserById: (id: number) => Promise<User>
    createUser: (
        username: string,
        password: string,
        email: string
    ) => Promise<number>
}
