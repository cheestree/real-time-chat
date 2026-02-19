import { UserLoginSchema, UserRegisterSchema } from '@rtchat/shared'
import { Router } from 'express'
import HybridServerController from '../controller/HybridServerController'
import UserController from '../controller/UserController'
import authenticatorWithServices from '../http/middleware/Authenticator'
import { validateZod } from '../http/middleware/ValidateZod'
import { Path } from '../http/path/Path'
import { createServerRepository } from '../repository/server/createServerRepository'
import { createUserRepository } from '../repository/user/createUserRepository'
import ServerServices from '../services/ServerService'
import UserServices from '../services/UserService'

class UserRoutes {
    public router = Router()
    public userServices: UserServices
    private userController: UserController
    private hybridServerController: HybridServerController

    constructor() {
        const userRepository = createUserRepository()
        this.userServices = new UserServices(userRepository)
        this.userController = new UserController(this.userServices)

        const serverRepository = createServerRepository()
        const serverServices = new ServerServices(
            serverRepository,
            userRepository
        )
        this.hybridServerController = new HybridServerController(
            serverServices,
            this.userServices
        )

        this.initRoutes()
    }

    private initRoutes() {
        this.router.post(
            Path.USERS.LOGIN,
            validateZod(UserLoginSchema),
            this.userController.login
        )
        this.router.post(
            Path.USERS.LOGOUT,
            authenticatorWithServices(this.userServices),
            this.hybridServerController.logout
        )
        this.router.post(
            Path.USERS.REGISTER,
            validateZod(UserRegisterSchema),
            this.userController.register
        )
        this.router.get(
            Path.USERS.AUTH,
            authenticatorWithServices(this.userServices),
            this.userController.checkAuth
        )
    }
}

const userRoutes = new UserRoutes()
export { userRoutes }
