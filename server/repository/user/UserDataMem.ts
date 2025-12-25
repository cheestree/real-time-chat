import { BadRequestError } from '../../domain/error/Error'
import { UserRepositoryInterface } from '../../domain/interfaces/IUserRepository'
import { User } from '../../domain/user/User'

class UserDataMem implements UserRepositoryInterface {
    users: User[] = []

    async createUser(
        username: string,
        password: string,
        email: string
    ): Promise<number> {
        const id = this.users.length + 1
        const user: User = { id, username, email, password }
        this.users.push(user)
        return id
    }

    async userExists(id: number): Promise<boolean> {
        return this.users.some((user) => user.id == id)
    }

    async getUserById(id: number): Promise<User> {
        const user = this.users.find((user) => user.id == id)
        if (user) {
            return user
        }
        throw new BadRequestError('UserProfile not found')
    }

    async getUserByUsername(username: string): Promise<User | undefined> {
        const user = this.users.find((user) => user.username == username)
        if (user) {
            return user
        }
        throw new BadRequestError('UserProfile not found')
    }
}

export default UserDataMem
