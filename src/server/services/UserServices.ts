import { BadRequestError } from '../domain/error/Error'
import { AuthenticatedUser } from '../domain/user/AuthenticatedUser'
import { UserDomain } from '../domain/user/UserDomain'
import { UserProfile } from '../domain/user/UserProfile'
import { UserLoginInput } from '../http/model/input/user/UserLoginInput'
import { UserRegisterInput } from '../http/model/input/user/UserRegisterInput'
import { LoginResult } from '../http/model/output/user/LoginResult'
import { IUserRepository } from '../repository/interfaces/IUserRepository'
import IUserServices from './interfaces/IUserServices'
import { requireOrThrow } from './utils/requireOrThrow'

class UserServices implements IUserServices {
    private repo: IUserRepository
    private domain: UserDomain
    constructor(repo: IUserRepository) {
        this.repo = repo
        this.domain = new UserDomain()
    }
    async login(input: UserLoginInput): Promise<LoginResult> {
        const user = await this.repo.getUserByUsername(input.username)
        requireOrThrow(BadRequestError, user !== undefined, 'User not found')

        const verifyPassword = await this.domain.verifyPassword(
            input.password,
            user.password
        )

        requireOrThrow(BadRequestError, verifyPassword, 'Password doesnt match')

        const tokenPromise = await this.domain.createToken(
            user.internal_id,
            user.id,
            input.username,
            input.password,
            this.domain.getExpireTime()
        )
        const expireTime = this.domain.getExpireTime()
        const options = {
            httpOnly: true,
            secure: true,
            maxAge: expireTime,
        }
        const authUser: AuthenticatedUser = {
            internalId: user.internal_id,
            publicId: user.id,
            profile: { id: user.id, username: user.username },
        }
        return { token: tokenPromise, options, user: authUser }
    }
    async logout(user: AuthenticatedUser): Promise<boolean> {
        return true
    }
    async register(register: UserRegisterInput): Promise<UserProfile> {
        const hashedPassword = await this.domain.hashPassword(register.password)
        const id = await this.repo.createUser({
            username: register.username,
            email: register.email,
            password: hashedPassword,
        })
        requireOrThrow(
            BadRequestError,
            id !== undefined,
            'ID generation failed'
        )
        return new UserProfile(id, register.username)
    }
    async checkAuth(token: string): Promise<AuthenticatedUser | undefined> {
        const credentials = await this.domain.validateToken(token)
        requireOrThrow(
            BadRequestError,
            credentials !== undefined,
            'Something happened while validating token'
        )
        const user = await this.repo.getUserById(credentials.internalId)
        requireOrThrow(
            BadRequestError,
            user !== undefined,
            'Something happened while fetching user'
        )
        return {
            internalId: user.internal_id,
            publicId: user.id,
            profile: { id: user.id, username: user.username },
        }
    }
    async getUserById(id: number): Promise<{ id: string; username: string }> {
        const user = await this.repo.getUserById(id)
        requireOrThrow(
            BadRequestError,
            user !== undefined,
            'Something happened while fetching user'
        )
        return new UserProfile(user.id, user.username)
    }
}

export default UserServices
