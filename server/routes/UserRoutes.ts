import { Router } from 'express'
import UserController from '../controller/UserController'
import { UserLoginInputModelValidation } from '../domain/user/input/UserLoginInputModel'
import { UserRegisterInputModelValidation } from '../domain/user/input/UserRegisterInputModel'
import authenticatorWithServices from '../middleware/Authenticator'
import { ValidateInput } from '../middleware/ValidateInput'
import UserDataMem from '../repository/user/UserDataMem'
import UserServices from '../services/UserServices'

const userRouter = Router()
const userRepository = new UserDataMem()
//  const userRepository = new UserRepository()
const userServices = new UserServices(userRepository)
const userController = new UserController(userServices)

userRouter.post(
    '/login',
    UserLoginInputModelValidation,
    ValidateInput,
    userController.login
)
userRouter.post('/logout', userController.logout)
userRouter.post(
    '/register',
    UserRegisterInputModelValidation,
    ValidateInput,
    userController.register
)
userRouter.get(
    '/auth',
    authenticatorWithServices(userServices),
    userController.checkAuth
)

export { userRouter, userServices }
