import { RequestHandler } from 'express'
import { asyncHandler } from '../http/middleware/asyncHandler'
import { AuthenticatedRequest } from '../http/middleware/Authenticator'
import MessageServices from '../services/MessageServices'
import IMessageController from './interfaces/IMessageController'

class MessageController implements IMessageController {
    private messageServices: MessageServices

    constructor(messageServices: MessageServices) {
        this.messageServices = messageServices
    }
    messageServer: RequestHandler = asyncHandler(async (req, res) => {
        res.status(501).send('Not implemented')
    })

    getPagedMessages: RequestHandler = asyncHandler(async (req, res) => {
        const authReq = req as AuthenticatedRequest
        const serverId = req.params.serverId
        const channelId = req.params.channelId
        const limit = parseInt(req.query.limit as string) || 50
        const nextPageState = req.query.nextPageState as string | undefined

        const result = await this.messageServices.getPagedMessages(
            authReq.authenticatedUser,
            channelId,
            limit,
            nextPageState,
            serverId
        )

        res.status(200).json({
            messages: result.messages.map((m) => m.toSummary()),
            nextPageState: result.nextPageState,
            serverId,
            channelId,
        })
    })
}

export default MessageController
