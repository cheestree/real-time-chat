import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'
import { UserLoginInput } from '../../http/model/input/user/UserLoginInput'
import { UserRegisterInput } from '../../http/model/input/user/UserRegisterInput'
import { LoginResult } from '../../http/model/output/user/LoginResult'

interface IUserServices {
    login(input: UserLoginInput): Promise<LoginResult>
    logout(user: AuthenticatedUser): Promise<boolean>
    register(
        input: UserRegisterInput
    ): Promise<{ id: string; username: string }>
    checkAuth(token: string): Promise<AuthenticatedUser | undefined>
    getUserById(id: number): Promise<{ id: string; username: string }>
}

export default IUserServices
