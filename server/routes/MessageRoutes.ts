import { Router } from 'express'
import MessageController from '../controller/MessageController'
import { createMessageRepository } from '../repository/messages/createMessageRepository'
import { createServerRepository } from '../repository/server/createServerRepository'
import MessageServices from '../services/MessageServices'

class MessageRoutes {
    public router = Router()
    public messageServices: MessageServices
    private messageController: MessageController

    constructor() {
        const serverRepository = createServerRepository()
        const messageRepository = createMessageRepository()
        this.messageServices = new MessageServices(
            serverRepository,
            messageRepository
        )
        this.messageController = new MessageController(this.messageServices)
        this.initRoutes()
    }

    private initRoutes() {}
}

const messageRoutes = new MessageRoutes()
export { messageRoutes }
