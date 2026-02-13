import { RequestHandler } from 'express'
import { asyncHandler } from '../http/middleware/asyncHandler'
import { AuthenticatedRequest } from '../http/middleware/Authenticator'
import { ServerCreateInput } from '../http/model/input/server/ServerCreateInput'
import { ApiResponse } from '../http/model/output/ApiResponse'
import ServerServices from '../services/ServerService'

class ServerController {
    private services: ServerServices
    constructor(services: ServerServices) {
        this.services = services
    }

    listServers: RequestHandler = asyncHandler(async (req, res) => {
        const authReq = req as AuthenticatedRequest
        const servers = await this.services.getUserServers({
            userId: authReq.authenticatedUser.publicId,
        })

        const serverDetails = await Promise.all(
            servers.map(async (server) => {
                return await this.services.getServerDetails(server.id)
            })
        )

        const response: ApiResponse<typeof serverDetails> = {
            success: true,
            data: serverDetails,
        }

        res.status(200).json(response)
    })

    getServerDetails: RequestHandler = asyncHandler(async (req, res) => {
        const serverId = req.params.serverId
        const serverDetails = await this.services.getServerDetails(serverId)

        const response: ApiResponse<typeof serverDetails> = {
            success: true,
            data: serverDetails,
        }

        res.status(200).json(response)
    })

    createServer: RequestHandler = asyncHandler(async (req, res) => {
        const authReq = req as AuthenticatedRequest
        const input: ServerCreateInput = req.body
        const server = await this.services.createServer(
            authReq.authenticatedUser,
            input
        )

        const response: ApiResponse<typeof server> = {
            success: true,
            data: server,
        }

        // Note: For now, there's no server-wide notification for server creation,
        // as only the creator is in the server. If we add invitations, they would be notified.
        res.status(201).json(response)
    })

    getPagedChannels: RequestHandler = asyncHandler(async (req, res) => {
        const authReq = req as AuthenticatedRequest
        const serverId = req.params.serverId
        const limit = parseInt(req.query.limit as string) || 50
        const offset = parseInt(req.query.offset as string) || 0

        const channels = await this.services.getPagedChannels(
            authReq.authenticatedUser,
            serverId,
            limit,
            offset
        )

        const channelSummaries = channels.map((c) => c.toSummary())

        const response: ApiResponse<typeof channelSummaries> = {
            success: true,
            data: channelSummaries,
        }

        res.status(200).json(response)
    })

    getServerUsers: RequestHandler = asyncHandler(async (req, res) => {
        const authReq = req as AuthenticatedRequest
        const serverId = req.params.serverId

        const users = await this.services.getServerUsers(
            authReq.authenticatedUser,
            serverId
        )

        const response: ApiResponse<typeof users> = {
            success: true,
            data: users,
        }

        res.status(200).json(response)
    })
}

export default ServerController
