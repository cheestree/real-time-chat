import { AuthenticatedUser } from '@rtchat/shared'

export interface AuthActionResult {
    success: boolean
    message?: string
}

export interface AuthContextType {
    login: (username: string, password: string) => Promise<AuthActionResult>
    register: (
        username: string,
        email: string,
        password: string
    ) => Promise<AuthActionResult>
    logout: () => Promise<void>
    checkAuth: () => Promise<void>
    loggedUser: AuthenticatedUser | undefined
    isLoggedIn: boolean
    isLoading: boolean
    error: string | null
}
