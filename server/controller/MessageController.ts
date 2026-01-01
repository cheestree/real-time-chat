import { RequestHandler } from 'express'
import MessageServices from '../services/MessageServices'
import IMessageController from './interfaces/IMessageController'

class MessageController implements IMessageController {
    private messageServices: MessageServices

    constructor(messageServices: MessageServices) {
        this.messageServices = messageServices
    }
    messageServer: RequestHandler = async (req, res) => {
        res.status(501).send('Not implemented')
    }
}

export default MessageController
