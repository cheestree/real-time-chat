import { ApiResponse, ConversationSummary } from '@rtchat/shared'
import { RequestHandler } from 'express'
import { asyncHandler } from '../http/middleware/asyncHandler'
import { AuthenticatedRequest } from '../http/middleware/Authenticator'
import DirectMessageService from '../services/DirectMessageService'
import IDirectMessageController from './interfaces/IDirectMessageController'

type GetDirectMessagesResponse = {
    messages: any[]
    nextPageState?: string
    recipientId: string
    hasMore: boolean
}

class DirectMessageController implements IDirectMessageController {
    private dmService: DirectMessageService

    constructor(dmService: DirectMessageService) {
        this.dmService = dmService
    }

    getDirectMessages: RequestHandler = asyncHandler(async (req, res) => {
        const authReq = req as AuthenticatedRequest
        const recipientId = req.params.recipientId
        const limit = parseInt(req.query.limit as string) || 50
        const nextPageState = req.query.nextPageState as string | undefined

        const result = await this.dmService.getDirectMessages(
            authReq.authenticatedUser,
            recipientId,
            limit,
            nextPageState
        )

        const responseData: GetDirectMessagesResponse = {
            messages: result.messages.map((m) => m.toSummary()),
            nextPageState: result.nextPageState,
            recipientId,
            hasMore: !!result.nextPageState,
        }

        const response: ApiResponse<GetDirectMessagesResponse> = {
            success: true,
            data: responseData,
        }

        res.status(200).json(response)
    })

    getUserConversations: RequestHandler = asyncHandler(async (req, res) => {
        // Not needed - users initiate DMs by clicking on other users
        // TODO: Implement a "recent conversations" API if we want to show a list of past DMs
        const response: ApiResponse<ConversationSummary[]> = {
            success: true,
            data: [],
        }

        res.status(200).json(response)
    })
}

export default DirectMessageController
