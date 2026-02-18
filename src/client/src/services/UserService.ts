import { Path } from '@/http/path'
import { get, post } from '@/http/requests'
import {
    AuthCheckResponse,
    LoginResponse,
    UserLoginInput as LoginSchema,
    LogoutResponse,
    RegisterResponse,
    UserRegisterInput as RegisterSchema,
    UserLoginSchema,
    UserRegisterSchema,
} from '@rtchat/shared'

class UserService {
    async login(data: LoginSchema): Promise<LoginResponse> {
        try {
            UserLoginSchema.parse(data)
            const response = await post(
                process.env.NEXT_PUBLIC_API_URL + Path.LOGIN,
                true,
                data
            )
            if (response.ok) {
                return await response.json()
            } else {
                return { success: false, error: 'Login failed' }
            }
        } catch (error) {
            console.error('Login error:', error)
            return { success: false, error: 'Login failed' }
        }
    }
    async logout(): Promise<LogoutResponse> {
        try {
            const response = await post(
                process.env.NEXT_PUBLIC_API_URL + Path.LOGOUT,
                true,
                null
            )
            if (response.ok) {
                return { success: true, data: null }
            } else {
                return { success: false, error: 'Logout failed' }
            }
        } catch (error) {
            console.error('Logout error:', error)
            return { success: false, error: 'Logout failed' }
        }
    }
    async register(data: RegisterSchema): Promise<RegisterResponse> {
        try {
            UserRegisterSchema.parse(data)
            const response = await post(
                process.env.NEXT_PUBLIC_API_URL + Path.REGISTER,
                false,
                data
            )
            if (response.ok) {
                return await response.json()
            } else {
                return { success: false, error: 'Registration failed' }
            }
        } catch (error) {
            console.error('Register error:', error)
            return { success: false, error: 'Registration failed' }
        }
    }
    async checkAuth(): Promise<AuthCheckResponse | null> {
        try {
            const response = await get(
                process.env.NEXT_PUBLIC_API_URL + Path.AUTH_CHECK,
                true
            )
            if (response.ok) {
                return await response.json()
            }
            return null
        } catch (error) {
            console.error('Auth check error:', error)
            return null
        }
    }
}

export const userService = new UserService()
