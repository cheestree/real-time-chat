import { RequestHandler } from 'express'
import { asyncHandler } from '../http/middleware/asyncHandler'
import { AuthenticatedRequest } from '../http/middleware/Authenticator'
import { ServerCreateInput } from '../http/model/input/server/ServerCreateInput'
import ServerServices from '../services/ServerServices'

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
        const summaries = servers.map((s) => s)
        res.status(200).json(summaries)
    })

    getServerDetails: RequestHandler = asyncHandler(async (req, res) => {
        const serverId = req.params.serverId
        const serverDetails = await this.services.getServerDetails(serverId)
        res.status(200).json(serverDetails)
    })

    createServer: RequestHandler = asyncHandler(async (req, res) => {
        const authReq = req as AuthenticatedRequest
        const input: ServerCreateInput = req.body
        const server = await this.services.createServer(
            authReq.authenticatedUser,
            input
        )
        // Note: For now, there's no server-wide notification for server creation,
        // as only the creator is in the server. If we add invitations, they would be notified.
        res.status(201).json(server)
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
        res.status(200).json(channels.map((c) => c.toSummary()))
    })

    getServerUsers: RequestHandler = asyncHandler(async (req, res) => {
        const authReq = req as AuthenticatedRequest
        const serverId = req.params.serverId

        const users = await this.services.getServerUsers(
            authReq.authenticatedUser,
            serverId
        )
        res.status(200).json(users)
    })
}

export default ServerController
