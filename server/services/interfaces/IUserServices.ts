import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'
import { UserLoginInput } from '../../http/model/input/user/UserLoginInput'
import { UserRegisterInput } from '../../http/model/input/user/UserRegisterInput'
import { LoginResult } from '../../http/model/output/user/LoginResult'

interface IUserServices {
    login(input: UserLoginInput): Promise<LoginResult>
    logout(user: AuthenticatedUser): Promise<boolean>
    register(input: UserRegisterInput): Promise<{ id: string }>
    checkAuth(token: string): Promise<AuthenticatedUser | undefined>
}

export default IUserServices
