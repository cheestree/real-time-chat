import { Channel } from '../domain/channel/Channel'
import { BadRequestError } from '../domain/error/Error'
import { Server } from '../domain/server/Server'
import { AuthenticatedUser } from '../domain/user/AuthenticatedUser'
import { ServerCreateInput } from '../http/model/input/server/ServerCreateInput'
import { ServerLeaveInput } from '../http/model/input/server/ServerLeaveInput'
import { ChannelSummary } from '../http/model/output/server/ChannelSummary'
import { ServerDetail } from '../http/model/output/server/ServerDetail'
import { ServerSummary } from '../http/model/output/server/ServerSummary'
import { IServerRepository } from '../repository/interfaces/IServerRepository'
import { IUserRepository } from '../repository/interfaces/IUserRepository'
import IServerServices from './interfaces/IServerServices'
import { requireOrThrow } from './utils/requireOrThrow'

class ServerServices implements IServerServices {
    servers: IServerRepository
    users: IUserRepository
    constructor(serverRepo: IServerRepository, userRepo: IUserRepository) {
        this.servers = serverRepo
        this.users = userRepo
    }
    getUserServers = async (userId: string): Promise<ServerSummary[]> => {
        requireOrThrow(
            BadRequestError,
            await this.users.userExists(userId),
            'User does not exist.'
        )
        const user = await this.users.getUserByUUID(userId)
        return await this.servers
            .getUserServers(user!.internal_id)
            .then((servers) => {
                return servers.map((server) => {
                    return server.toSummary()
                })
            })
    }
    getServerById = async (serverId: number): Promise<Server> => {
        const server = await this.servers.getServerById(serverId)
        requireOrThrow(
            BadRequestError,
            server !== undefined,
            "Server doesn't exist."
        )
        return server
    }
    serverExists = async (serverId: number) => {
        return await this.servers.serverExists(serverId)
    }
    createServer = async (
        user: AuthenticatedUser,
        input: ServerCreateInput
    ): Promise<Server> => {
        const serverNameTrimmed = input.name.trim()
        const serverDescriptionTrimmed = input.description?.trim()
        requireOrThrow(
            BadRequestError,
            !(!serverNameTrimmed || !serverDescriptionTrimmed),
            "Server name/description can't be an empty string."
        )
        return await this.servers.createServer(
            serverNameTrimmed,
            user.internalId,
            serverDescriptionTrimmed,
            input.icon
        )
    }
    createChannel = async (
        user: AuthenticatedUser,
        input: { serverId: number; name: string; description?: string }
    ): Promise<ChannelSummary> => {
        const serverExists = await this.servers.serverExists(input.serverId)
        const nameTrimmed = input.name.trim()
        const trimmedDescription = input.description?.trim() || ''
        requireOrThrow(BadRequestError, serverExists, "Server doesn't exist.")
        requireOrThrow(
            BadRequestError,
            !(!nameTrimmed || !trimmedDescription),
            "Server name/description can't be an empty string."
        )
        return await this.servers
            .createChannel(input.serverId, nameTrimmed, trimmedDescription)
            .then((channel: Channel) => channel.toSummary())
    }
    addUserToServer = async (
        user: AuthenticatedUser,
        serverId: number
    ): Promise<Server> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(serverId),
            "Server doesn't exist."
        )
        requireOrThrow(
            BadRequestError,
            !(await this.servers.containsUser(serverId, user.internalId)),
            'User is already a member of the server.'
        )
        return await this.servers.addUserToServer(serverId, user.internalId)
    }
    leaveServer = async (
        user: AuthenticatedUser,
        input: ServerLeaveInput
    ): Promise<boolean> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(input.id),
            "Server doesn't exist."
        )
        return await this.servers.leaveServer(input.id, user.internalId)
    }
    deleteServer = async (
        user: AuthenticatedUser,
        input: { id: number }
    ): Promise<boolean> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(input.id),
            "Server doesn't exist."
        )
        requireOrThrow(
            BadRequestError,
            await this.servers.isServerOwner(input.id, user.internalId),
            'Only the server owner can delete the server.'
        )
        return await this.servers.deleteServer(input.id, user.internalId)
    }
    getServerDetails = async (serverId: number): Promise<ServerDetail> => {
        const server = await this.servers.getServerById(serverId)
        requireOrThrow(
            BadRequestError,
            server !== undefined,
            "Server doesn't exist."
        )
        const channelIds = await this.servers.getChannelIdsByServerId(serverId)
        const userIds = await this.servers.getUserIdsByServerId(serverId)
        return {
            id: server.id,
            name: server.name,
            description: server.description,
            icon: server.icon,
            ownerIds: server.owners,
            channelIds,
            userIds,
        }
    }
}

export default ServerServices
