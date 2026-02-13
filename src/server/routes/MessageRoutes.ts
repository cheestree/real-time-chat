import { Router } from 'express'
import MessageController from '../controller/MessageController'
import authenticatorWithServices from '../http/middleware/Authenticator'
import { Path } from '../http/path/Path'
import { createMessageRepository } from '../repository/messages/createMessageRepository'
import { createServerRepository } from '../repository/server/createServerRepository'
import { createUserRepository } from '../repository/user/createUserRepository'
import MessageServices from '../services/MessageService'
import UserServices from '../services/UserService'

class MessageRoutes {
    public router = Router()
    public userServices: UserServices
    public messageServices: MessageServices
    private messageController: MessageController

    constructor() {
        const userRepository = createUserRepository()
        const serverRepository = createServerRepository()
        const messageRepository = createMessageRepository()
        this.userServices = new UserServices(userRepository)
        this.messageServices = new MessageServices(
            serverRepository,
            messageRepository
        )
        this.messageController = new MessageController(this.messageServices)
        this.initRoutes()
    }

    private initRoutes() {
        const auth = authenticatorWithServices(this.userServices)
        this.router.get(
            `${Path.SERVERS}/:serverId${Path.CHANNELS}/:channelId${Path.MESSAGES}`,
            auth,
            this.messageController.getPagedMessages
        )
    }
}

const messageRoutes = new MessageRoutes()
export { messageRoutes }
