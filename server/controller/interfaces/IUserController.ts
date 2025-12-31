import { RequestHandler } from 'express'

interface IUserController {
    login: RequestHandler
    logout: RequestHandler
    register: RequestHandler
    checkAuth: RequestHandler
}

export default IUserController
