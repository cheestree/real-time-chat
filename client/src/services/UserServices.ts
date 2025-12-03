import { get, post } from '@/services/requests/requests'

class UserServices {
    private readonly url: string
    constructor(user_url: string) {
        this.url = user_url
    }
    async login(username: string, password: string): Promise<Response> {
        return post(this.url + '/login', true, {
            username: username,
            password: password,
        })
    }
    async logout(): Promise<boolean> {
        return await post(this.url + '/logout', true, null).then(
            async (response) => {
                return response.ok
            }
        )
    }
    async register(
        username: string,
        email: string,
        password: string
    ): Promise<Response> {
        return post(this.url + '/register', false, {
            username: username,
            email: email,
            password: password,
        })
    }
    async checkAuth(): Promise<Response> {
        return get(this.url + '/auth', true)
    }
}

export default UserServices
