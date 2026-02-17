import { ApiResponse, AuthenticatedUser } from '@rtchat/shared'

export type LoginResponse = ApiResponse<{
    token: string
    user: AuthenticatedUser
}>

export type RegisterResponse = ApiResponse<{
    user: AuthenticatedUser
}>

export type AuthCheckResponse = {
    authenticated: true
    user: AuthenticatedUser
}

export type LogoutResponse = ApiResponse<null>
