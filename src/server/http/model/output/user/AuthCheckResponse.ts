import { AuthenticatedUser } from '../../../../domain/user/AuthenticatedUser'

export interface AuthCheckResponse {
    authenticated: true
    user: AuthenticatedUser
}
