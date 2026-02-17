import { RequestHandler } from 'express'
import { asyncHandler } from '../http/middleware/asyncHandler'
import { AuthenticatedRequest } from '../http/middleware/Authenticator'
import { ApiResponse, MessageSummary } from '@rtchat/shared'
import MessageServices from '../services/MessageService'
import IMessageController from './interfaces/IMessageController'

type GetPagedMessagesResponse = {
    messages: MessageSummary[]
    nextPageState?: string
    serverId: string
    channelId: string
    hasMore: boolean
}

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

        const responseData: GetPagedMessagesResponse = {
            messages: result.messages.map((m) => m.toSummary()),
            nextPageState: result.nextPageState,
            serverId,
            channelId,
            hasMore: !!result.nextPageState,
        }

        const response: ApiResponse<GetPagedMessagesResponse> = {
            success: true,
            data: responseData,
        }

        res.status(200).json(response)
    })
}

export default MessageController
