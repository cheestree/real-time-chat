import { ApiResponse, AuthenticatedUser } from '@rtchat/shared'
import { Request, RequestHandler, Response } from 'express'
import { asyncHandler } from '../http/middleware/asyncHandler'
import { AuthenticatedRequest } from '../http/middleware/Authenticator'
import { UserLoginInput } from '../http/model/input/user/UserLoginInput'
import { UserRegisterInput } from '../http/model/input/user/UserRegisterInput'
import UserServices from '../services/UserService'
import IUserController from './interfaces/IUserController'

type AuthCheckResponse = { authenticated: true; user: AuthenticatedUser }
type LoginResponse = ApiResponse<{ token: string; user: AuthenticatedUser }>
type RegisterResponse = ApiResponse<{ user: AuthenticatedUser }>

class UserController implements IUserController {
    private services: UserServices
    constructor(services: UserServices) {
        this.services = services
    }
    login: RequestHandler = asyncHandler(
        async (req: Request, res: Response) => {
            const loginCreds: UserLoginInput = req.body
            const result = await this.services.login(loginCreds)

            const response: LoginResponse = {
                success: true,
                data: {
                    token: result.token,
                    user: result.user,
                },
            }

            res.status(200)
                .cookie('token', result.token, result.options)
                .json(response)
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
            const user = await this.services.register(registerCreds)

            const response: RegisterResponse = {
                success: true,
                data: {
                    user,
                },
            }

            res.status(201).json(response)
        }
    )
    checkAuth: RequestHandler = asyncHandler(
        async (req: Request, res: Response) => {
            const authReq = req as AuthenticatedRequest

            const response: AuthCheckResponse = {
                authenticated: true,
                user: authReq.authenticatedUser,
            }

            res.status(200).json(response)
        }
    )
}

export default UserController
