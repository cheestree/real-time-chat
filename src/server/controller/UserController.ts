import { Request, RequestHandler, Response } from 'express'
import { asyncHandler } from '../http/middleware/asyncHandler'
import { AuthenticatedRequest } from '../http/middleware/Authenticator'
import { UserLoginInput } from '../http/model/input/user/UserLoginInput'
import { UserRegisterInput } from '../http/model/input/user/UserRegisterInput'
import UserServices from '../services/UserServices'
import IUserController from './interfaces/IUserController'

class UserController implements IUserController {
    private services: UserServices
    constructor(services: UserServices) {
        this.services = services
    }
    login: RequestHandler = asyncHandler(
        async (req: Request, res: Response) => {
            const loginCreds: UserLoginInput = req.body
            const result = await this.services.login(loginCreds)
            res.status(200)
                .cookie('token', result.token, result.options)
                .json({ token: result.token, user: result.user })
        }
    )
    logout: RequestHandler = asyncHandler(
        async (req: Request, res: Response) => {
            const authReq = req as AuthenticatedRequest
            await this.services.logout(authReq.authenticatedUser)
            res.clearCookie('token').status(200).end()
        }
    )
    register: RequestHandler = asyncHandler(
        async (req: Request, res: Response) => {
            const registerCreds: UserRegisterInput = req.body
            const userId = await this.services.register(registerCreds)
            res.status(201).json({ id: userId })
        }
    )
    checkAuth: RequestHandler = asyncHandler(
        async (req: Request, res: Response) => {
            const authReq = req as AuthenticatedRequest
            res.status(200).json(authReq.authenticatedUser)
        }
    )
}

export default UserController
