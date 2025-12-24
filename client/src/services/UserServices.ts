import { Path } from '@/http/path'
import { get, post } from '@/http/requests'

class UserServices {
    async login(username: string, password: string): Promise<Response> {
        return post(process.env.NEXT_PUBLIC_API_URL + Path.LOGIN, true, {
            username: username,
            password: password,
        })
    }
    async logout(): Promise<boolean> {
        return await post(
            process.env.NEXT_PUBLIC_API_URL + Path.LOGOUT,
            true,
            null
        ).then(async (response) => {
            return response.ok
        })
    }
    async register(
        username: string,
        email: string,
        password: string
    ): Promise<Response> {
        return post(process.env.NEXT_PUBLIC_API_URL + Path.REGISTER, false, {
            username: username,
            email: email,
            password: password,
        })
    }
    async checkAuth(): Promise<Response> {
        return get(process.env.NEXT_PUBLIC_API_URL + Path.AUTH_CHECK, true)
    }
}

export default UserServices
