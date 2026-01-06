import { RequestHandler } from 'express'

interface IMessageController {
    messageServer: RequestHandler
}

export default IMessageController
