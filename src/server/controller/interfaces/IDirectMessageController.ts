import { RequestHandler } from 'express'

interface IDirectMessageController {
    getDirectMessages: RequestHandler
    getUserConversations: RequestHandler
}

export default IDirectMessageController
