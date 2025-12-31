import { Router } from 'express'
import UserController from '../controller/UserController'
import authenticatorWithServices from '../http/middleware/Authenticator'
import { validateZod } from '../http/middleware/ValidateZod'
import { UserLoginSchema } from '../http/model/input/user/UserLoginInput'
import { UserRegisterSchema } from '../http/model/input/user/UserRegisterInput'
import { Path } from '../http/path/Path'
import { createUserRepository } from '../repository/user/createUserRepository'
import UserServices from '../services/UserServices'

class UserRoutes {
    public router = Router()
    public userServices: UserServices
    private userController: UserController

    constructor() {
        const userRepository = createUserRepository()
        this.userServices = new UserServices(userRepository)
        this.userController = new UserController(this.userServices)
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
            this.userController.logout
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
