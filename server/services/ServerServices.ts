import { Channel } from '../domain/channel/Channel'
import { BadRequestError } from '../domain/error/Error'
import { Server } from '../domain/server/Server'
import { AuthenticatedUser } from '../domain/user/AuthenticatedUser'
import { ServerCreateInput } from '../http/model/input/server/ServerCreateInput'
import { ServerDeleteInput } from '../http/model/input/server/ServerDeleteInput'
import { ServerDetailsInput } from '../http/model/input/server/ServerDetailsInput'
import { ServerExistsInput } from '../http/model/input/server/ServerExistsInput'
import { ServerJoinInput } from '../http/model/input/server/ServerJoinInput'
import { ServerLeaveInput } from '../http/model/input/server/ServerLeaveInput'
import { UserServersInput } from '../http/model/input/server/UserServersInput'
import { ChannelSummary } from '../http/model/output/server/ChannelSummary'
import { ServerDetail } from '../http/model/output/server/ServerDetail'
import { ServerSummary } from '../http/model/output/server/ServerSummary'
import { IServerRepository } from '../repository/interfaces/IServerRepository'
import { IUserRepository } from '../repository/interfaces/IUserRepository'
import { allNotEmpty } from '../utils/stringValidation'
import IServerServices from './interfaces/IServerServices'
import { requireOrThrow } from './utils/requireOrThrow'

class ServerServices implements IServerServices {
    servers: IServerRepository
    users: IUserRepository
    constructor(serverRepo: IServerRepository, userRepo: IUserRepository) {
        this.servers = serverRepo
        this.users = userRepo
    }
    getUserServers = async (
        input: UserServersInput
    ): Promise<ServerSummary[]> => {
        requireOrThrow(
            BadRequestError,
            await this.users.userExists(input.userId),
            'User does not exist.'
        )
        const user = await this.users.getUserByUUID(input.userId)
        return await this.servers
            .getUserServers(user!.internal_id)
            .then((servers) => {
                return servers.map((server) => {
                    return server.toSummary()
                })
            })
    }
    getServerById = async (input: ServerDetailsInput): Promise<Server> => {
        const server = await this.servers.getServerById(input.id)
        requireOrThrow(
            BadRequestError,
            server !== undefined,
            "Server doesn't exist."
        )
        return server
    }
    serverExists = async (input: ServerExistsInput) => {
        return await this.servers.serverExists(input.id)
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
            allNotEmpty(nameTrimmed, trimmedDescription),
            "Channel name/description can't be an empty string."
        )
        return await this.servers
            .createChannel(input.serverId, nameTrimmed, trimmedDescription)
            .then((channel: Channel) => channel.toSummary())
    }
    addUserToServer = async (
        user: AuthenticatedUser,
        input: ServerJoinInput
    ): Promise<Server> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(input.id),
            "Server doesn't exist."
        )
        requireOrThrow(
            BadRequestError,
            !(await this.servers.containsUser(input.id, user.internalId)),
            'User is already a member of the server.'
        )
        return await this.servers.addUserToServer(input.id, user.internalId)
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
        input: ServerDeleteInput
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
    getServerDetails = async (
        input: ServerDetailsInput
    ): Promise<ServerDetail> => {
        const server = await this.servers.getServerById(input.id)
        requireOrThrow(
            BadRequestError,
            server !== undefined,
            "Server doesn't exist."
        )
        const channelIds = await this.servers.getChannelIdsByServerId(input.id)
        const userIds = await this.servers.getUserIdsByServerId(input.id)
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
