import { Router } from 'express'
import UserController from '../controller/UserController'
import authenticatorWithServices from '../http/middleware/Authenticator'
import { ValidateInput } from '../http/middleware/ValidateInput'
import { UserLoginValidation } from '../http/model/input/user/UserLogin'
import { UserRegisterValidation } from '../http/model/input/user/UserRegister'
import { Path } from '../http/path/Path'
import UserDataMem from '../repository/user/UserDataMem'
import UserServices from '../services/UserServices'

class UserRoutes {
    public router = Router()
    public userServices: UserServices
    private userController: UserController

    constructor() {
        const userRepository = new UserDataMem()
        //  const userRepository = new UserRepository();
        this.userServices = new UserServices(userRepository)
        this.userController = new UserController(this.userServices)
        this.initRoutes()
    }

    private initRoutes() {
        this.router.post(
            Path.USERS.LOGIN,
            UserLoginValidation,
            ValidateInput,
            this.userController.login
        )
        this.router.post(Path.USERS.LOGOUT, this.userController.logout)
        this.router.post(
            Path.USERS.REGISTER,
            UserRegisterValidation,
            ValidateInput,
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
