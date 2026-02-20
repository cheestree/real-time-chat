import { LoginResult, UserLoginInput, UserRegisterInput } from '@rtchat/shared'
import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'

interface IUserService {
    login(input: UserLoginInput): Promise<LoginResult>
    logout(user: AuthenticatedUser): Promise<boolean>
    register(input: UserRegisterInput): Promise<AuthenticatedUser>
    checkAuth(token: string): Promise<AuthenticatedUser | undefined>
    getUserById(id: number): Promise<{ id: string; username: string }>
}

export default IUserService
