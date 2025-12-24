import { RequestHandler } from 'express'
import { UserLogin } from '../http/model/input/user/UserLogin'
import { UserRegister } from '../http/model/input/user/UserRegister'
import UserServices from '../services/UserServices'

class UserController {
    private services: UserServices
    constructor(services: UserServices) {
        this.services = services
    }
    login: RequestHandler = async (req, res, next) => {
        try {
            const loginCreds: UserLogin = req.body
            const [token, options, user] = await this.services.login(loginCreds)
            res.status(200)
                .cookie('token', token, options)
                .json({ token: token, user: user })
        } catch (error) {
            next(error)
        }
    }
    logout: RequestHandler = async (req, res, next) => {
        try {
            res.clearCookie('token').status(200).end()
        } catch (error) {
            next(error)
        }
    }
    register: RequestHandler = async (req, res, next) => {
        try {
            const registerCreds: UserRegister = req.body
            const userId = await this.services.register(registerCreds)
            res.status(201).json({ id: userId })
        } catch (error) {
            next(error)
        }
    }
    checkAuth: RequestHandler = async (req, res, next) => {
        try {
            const user = await this.services.getUserById(
                parseInt(<string>res.getHeader('user'))
            )
            res.status(200).json(user)
        } catch (error) {
            next(error)
        }
    }
}

export default UserController
