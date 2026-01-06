import { AuthenticatedUser } from '../../../../domain/user/AuthenticatedUser'

export interface LoginResult {
    token: string
    options: object
    user: AuthenticatedUser
}
