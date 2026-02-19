import { LoginResult } from '@rtchat/shared'
import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'
import { UserLoginInput } from '../../http/model/input/user/UserLoginInput'
import { UserRegisterInput } from '../../http/model/input/user/UserRegisterInput'

interface IUserService {
    login(input: UserLoginInput): Promise<LoginResult>
    logout(user: AuthenticatedUser): Promise<boolean>
    register(input: UserRegisterInput): Promise<AuthenticatedUser>
    checkAuth(token: string): Promise<AuthenticatedUser | undefined>
    getUserById(id: number): Promise<{ id: string; username: string }>
}

export default IUserService
