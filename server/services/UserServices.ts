import { BadRequestError } from '../domain/error/Error'
import { Credentials } from '../domain/user/Credentials'
import { UserDomain } from '../domain/user/UserDomain'
import { UserProfile } from '../domain/user/UserProfile'
import { UserLogin } from '../http/model/input/user/UserLogin'
import { UserRegister } from '../http/model/input/user/UserRegister'
import { IUserRepository } from '../repository/interfaces/IUserRepository'
import { requireOrThrow } from './utils/requireOrThrow'

class UserServices {
    private repo: IUserRepository
    private domain: UserDomain
    constructor(repo: IUserRepository) {
        this.repo = repo
        this.domain = new UserDomain()
    }
    async login(login: UserLogin): Promise<[string, object, object]> {
        const user = await this.repo.getUserByUsername(login.username)
        requireOrThrow(
            BadRequestError,
            user !== undefined,
            'Something happened while fetching user'
        )

        const verifiyPassword = await this.domain.verifyPassword(
            login.password,
            user!.password
        )

        requireOrThrow(
            BadRequestError,
            verifiyPassword,
            'Password doesnt match'
        )

        const tokenPromise = await this.domain.createToken(
            user!.id,
            login.username,
            login.password,
            this.domain.getExpireTime()
        )
        const expireTime = this.domain.getExpireTime()
        const options = {
            httpOnly: true,
            secure: true,
            maxAge: expireTime,
        }
        return [
            tokenPromise,
            options,
            { id: user!.id, username: user!.username },
        ]
    }
    /*
    async logout(res): Promise<boolean> {

    }
    */
    async register(register: UserRegister): Promise<number> {
        const hashedPassword = await this.domain.hashPassword(register.password)
        const id = await this.repo.createUser(
            register.username,
            hashedPassword,
            register.email
        )
        requireOrThrow(
            BadRequestError,
            id !== undefined,
            'Something happened while registering'
        )
        return id!
    }
    async checkAuth(token: string): Promise<Credentials | undefined> {
        return await this.domain.validateToken(token)
    }
    async getUserById(id: number): Promise<UserProfile> {
        const user = await this.repo.getUserById(id)
        requireOrThrow(
            BadRequestError,
            id !== undefined,
            'Something happened while fetching user'
        )
        return { id: user!.id, username: user!.username }
    }
}

export default UserServices
