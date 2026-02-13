import { AuthenticatedUser } from '../../../../domain/user/AuthenticatedUser'

export interface RegisterResponse {
    success: true
    data: {
        user: AuthenticatedUser
    }
}
