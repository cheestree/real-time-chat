import { Router } from 'express'
import DirectMessageController from '../controller/DirectMessageController'
import authenticatorWithServices from '../http/middleware/Authenticator'
import { Path } from '../http/path/Path'
import { createDirectMessageRepository } from '../repository/directMessages/createDirectMessageRepository'
import { createUserRepository } from '../repository/user/createUserRepository'
import DirectMessageService from '../services/DirectMessageService'
import UserService from '../services/UserService'

class DirectMessageRoutes {
    public router = Router()
    public userServices: UserService
    public dmServices: DirectMessageService
    private dmController: DirectMessageController

    constructor() {
        const userRepository = createUserRepository()
        const dmRepository = createDirectMessageRepository()

        this.userServices = new UserService(userRepository)
        this.dmServices = new DirectMessageService(userRepository, dmRepository)
        this.dmController = new DirectMessageController(this.dmServices)
        this.initRoutes()
    }

    private initRoutes() {
        const auth = authenticatorWithServices(this.userServices)
        this.router.get(
            `${Path.DIRECT_MESSAGES}`,
            auth,
            this.dmController.getUserConversations
        )
        this.router.get(
            `${Path.DIRECT_MESSAGES}/:recipientId${Path.MESSAGES}`,
            auth,
            this.dmController.getDirectMessages
        )
    }
}

const directMessageRoutes = new DirectMessageRoutes()
export { directMessageRoutes }
