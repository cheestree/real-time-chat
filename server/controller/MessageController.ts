import { Request, RequestHandler, Response } from 'express'
import { asyncHandler } from '../http/middleware/asyncHandler'
import MessageServices from '../services/MessageServices'
import IMessageController from './interfaces/IMessageController'

class MessageController implements IMessageController {
    private messageServices: MessageServices

    constructor(messageServices: MessageServices) {
        this.messageServices = messageServices
    }
    messageServer: RequestHandler = asyncHandler(
        async (req: Request, res: Response) => {
            res.status(501).send('Not implemented')
        }
    )
}

export default MessageController
