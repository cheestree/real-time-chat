import {
    ApiResponse,
    ChannelCreateInput,
    ServerDeleteInput,
    ServerJoinInput,
} from '@rtchat/shared'
import { Request, RequestHandler } from 'express'
import { Server } from 'socket.io'
import { asyncHandler } from '../http/middleware/asyncHandler'
import { AuthenticatedRequest } from '../http/middleware/Authenticator'
import ServerServices from '../services/ServerService'
import UserServices from '../services/UserService'

interface SocketRequest extends Request {
    io: Server
}

class HybridServerController {
    constructor(
        private serverServices: ServerServices,
        private userServices: UserServices
    ) {}

    joinServer: RequestHandler = asyncHandler(async (req, res) => {
        const authReq = req as AuthenticatedRequest
        const input: ServerJoinInput = req.body
        const serverDetails = await this.serverServices.addUserToServer(
            authReq.authenticatedUser,
            input
        )
        const io = (req as unknown as SocketRequest).io
        io.to(`server_${serverDetails.id}`).emit('userJoinedServer', {
            serverId: serverDetails.id,
            user: authReq.authenticatedUser.profile,
        })

        const response: ApiResponse<typeof serverDetails> = {
            success: true,
            data: serverDetails,
        }
        res.status(200).json(response)
    })

    createChannel: RequestHandler = asyncHandler(async (req, res) => {
        const authReq = req as AuthenticatedRequest
        const input: ChannelCreateInput = req.body
        const channel = await this.serverServices.createChannel(
            authReq.authenticatedUser,
            input
        )
        const io = (req as unknown as SocketRequest).io
        const channelSummary = channel.toSummary()
        io.to(`server_${input.serverId}`).emit('channelCreated', channelSummary)

        const response: ApiResponse<typeof channelSummary> = {
            success: true,
            data: channelSummary,
        }
        res.status(201).json(response)
    })

    deleteChannel: RequestHandler = asyncHandler(async (req, res) => {
        const authReq = req as AuthenticatedRequest
        const serverId = req.params.serverId
        const channelId = req.params.channelId

        await this.serverServices.deleteChannel(
            authReq.authenticatedUser,
            serverId,
            channelId
        )

        const io = (req as unknown as SocketRequest).io
        io.to(`server_${serverId}`).emit('channelDeleted', {
            serverId,
            channelId,
        })

        const response: ApiResponse<{ success: boolean }> = {
            success: true,
            data: { success: true },
        }
        res.status(200).json(response)
    })

    deleteServer: RequestHandler = asyncHandler(async (req, res) => {
        const authReq = req as AuthenticatedRequest
        const input: ServerDeleteInput = req.body

        const server = await this.serverServices.getServerById(input.serverId)

        await this.serverServices.deleteServer(authReq.authenticatedUser, input)

        const io = (req as unknown as SocketRequest).io

        io.to(`server_${input.serverId}`).emit('serverDeleted', {
            serverId: input.serverId,
        })

        const response: ApiResponse<{ success: boolean }> = {
            success: true,
            data: { success: true },
        }
        res.status(200).json(response)
    })

    logout: RequestHandler = asyncHandler(async (req, res) => {
        const authReq = req as AuthenticatedRequest
        const io = (req as unknown as SocketRequest).io

        const userRoomId = `user_${authReq.authenticatedUser.internalId}`
        const connectedSockets = await io.in(userRoomId).fetchSockets()

        for (const socket of connectedSockets) {
            socket.disconnect(true)
        }

        await this.userServices.logout(authReq.authenticatedUser)

        res.clearCookie('token').status(200).end()
    })
}

export default HybridServerController
