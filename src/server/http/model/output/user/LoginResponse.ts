import { AuthenticatedUser } from '../../../../domain/user/AuthenticatedUser'

export interface LoginResponse {
    success: true
    data: {
        token: string
        user: AuthenticatedUser
    }
}
