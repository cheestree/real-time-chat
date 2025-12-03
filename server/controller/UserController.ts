import { RequestHandler } from 'express'
import { UserLoginInputModel } from '../domain/user/input/UserLoginInputModel'
import { UserRegisterInputModel } from '../domain/user/input/UserRegisterInputModel'
import UserServices from '../services/UserServices'

class UserController {
    private services: UserServices
    constructor(services: UserServices) {
        this.services = services
    }
    login: RequestHandler = async (req, res, next) => {
        try {
            const loginCreds: UserLoginInputModel = req.body
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
            const registerCreds: UserRegisterInputModel = req.body
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
