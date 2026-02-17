import { Channel } from '../domain/channel/Channel'
import { BadRequestError } from '../domain/error/Error'
import { Server } from '../domain/server/Server'
import { AuthenticatedUser } from '../domain/user/AuthenticatedUser'
import { ServerCreateInput } from '../http/model/input/server/ServerCreateInput'
import { ServerDeleteInput } from '../http/model/input/server/ServerDeleteInput'
import { ServerExistsInput } from '../http/model/input/server/ServerExistsInput'
import { ServerJoinInput } from '../http/model/input/server/ServerJoinInput'
import { ServerLeaveInput } from '../http/model/input/server/ServerLeaveInput'
import { UserServersInput } from '../http/model/input/server/UserServersInput'
import { ServerDetail } from '../http/model/output/server/ServerDetail'
import { UserSummary } from '../http/model/output/user/UserSummary'
import { IServerRepository } from '../repository/interfaces/IServerRepository'
import { IUserRepository } from '../repository/interfaces/IUserRepository'
import { allNotEmpty } from '../utils/stringValidation'
import IServerService from './interfaces/IServerService'
import { requireOrThrow } from './utils/requireOrThrow'

class ServerService implements IServerService {
    servers: IServerRepository
    users: IUserRepository
    constructor(serverRepo: IServerRepository, userRepo: IUserRepository) {
        this.servers = serverRepo
        this.users = userRepo
    }
    getUserServers = async (
        input: UserServersInput
    ): Promise<ServerDetail[]> => {
        requireOrThrow(
            BadRequestError,
            await this.users.userExists(input.userId),
            'User does not exist.'
        )
        const user = await this.users.getUserByUUID(input.userId)
        return await this.servers.getUserServers(user!.internal_id)
    }
    getServerById = async (serverId: string): Promise<Server> => {
        const server = await this.servers.getServerById(serverId)
        requireOrThrow(
            BadRequestError,
            server !== undefined,
            "Server doesn't exist."
        )
        return server
    }
    serverExists = async (input: ServerExistsInput) => {
        return await this.servers.serverExists(input.serverId)
    }
    createServer = async (
        user: AuthenticatedUser,
        input: ServerCreateInput
    ): Promise<ServerDetail> => {
        const serverNameTrimmed = input.name.trim()
        const serverDescriptionTrimmed = input.description?.trim()
        requireOrThrow(
            BadRequestError,
            !(!serverNameTrimmed || !serverDescriptionTrimmed),
            "Server name/description can't be an empty string."
        )
        const server = await this.servers.createServer(
            serverNameTrimmed,
            user.internalId,
            serverDescriptionTrimmed,
            input.icon
        )
        // Return full server details with populated channels
        return await this.getServerDetails(server.id)
    }
    createChannel = async (
        user: AuthenticatedUser,
        input: { serverId: string; name: string; description?: string }
    ): Promise<Channel> => {
        const serverExists = await this.servers.serverExists(input.serverId)
        const nameTrimmed = input.name.trim()
        const trimmedDescription = input.description?.trim() || ''
        requireOrThrow(BadRequestError, serverExists, "Server doesn't exist.")
        requireOrThrow(
            BadRequestError,
            allNotEmpty(nameTrimmed, trimmedDescription),
            "Channel name/description can't be an empty string."
        )
        return await this.servers.createChannel(
            input.serverId,
            nameTrimmed,
            trimmedDescription
        )
    }
    addUserToServer = async (
        user: AuthenticatedUser,
        input: ServerJoinInput
    ): Promise<ServerDetail> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(input.serverId),
            "Server doesn't exist."
        )
        requireOrThrow(
            BadRequestError,
            !(await this.servers.containsUser(input.serverId, user.internalId)),
            'User is already a member of the server.'
        )
        await this.servers.addUserToServer(input.serverId, user.internalId)
        return await this.getServerDetails(input.serverId)
    }
    leaveServer = async (
        user: AuthenticatedUser,
        input: ServerLeaveInput
    ): Promise<boolean> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(input.serverId),
            "Server doesn't exist."
        )
        return await this.servers.leaveServer(input.serverId, user.internalId)
    }
    deleteServer = async (
        user: AuthenticatedUser,
        input: ServerDeleteInput
    ): Promise<boolean> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(input.serverId),
            "Server doesn't exist."
        )
        requireOrThrow(
            BadRequestError,
            await this.servers.isServerOwner(input.serverId, user.internalId),
            'Only the server owner can delete the server.'
        )
        return await this.servers.deleteServer(input.serverId, user.internalId)
    }
    deleteChannel = async (
        user: AuthenticatedUser,
        serverId: string,
        channelId: string
    ): Promise<boolean> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(serverId),
            "Server doesn't exist."
        )
        requireOrThrow(
            BadRequestError,
            await this.servers.isServerOwner(serverId, user.internalId),
            'Only the server owner can delete channels.'
        )
        requireOrThrow(
            BadRequestError,
            await this.servers.channelExists(serverId, channelId),
            "Channel doesn't exist in this server."
        )
        return await this.servers.deleteChannel(serverId, channelId)
    }
    getServerDetails = async (serverId: string): Promise<ServerDetail> => {
        const server = await this.servers.getServerById(serverId)
        requireOrThrow(
            BadRequestError,
            server !== undefined,
            "Server doesn't exist."
        )

        const channels = await this.servers.getPagedChannels(serverId, 100, 0)
        const channelDetails = channels.map((c) => ({
            id: c.id,
            name: c.name,
            description: c.description,
            serverId: c.serverId,
        }))

        const userIds = await this.servers.getUserIdsByServerId(serverId)
        const users = await this.users.getUsersByIds(userIds)
        const userSummaries: UserSummary[] = users.map((user) => ({
            id: user.id,
            username: user.username,
            icon: '',
        }))

        return {
            id: server.id,
            name: server.name,
            description: server.description,
            icon: server.icon,
            ownerIds: server.owners,
            channels: channelDetails,
            users: userSummaries,
        }
    }
    getPagedChannels = async (
        user: AuthenticatedUser,
        serverId: string,
        limit: number,
        offset: number
    ): Promise<Channel[]> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(serverId),
            "Server doesn't exist."
        )
        requireOrThrow(
            BadRequestError,
            await this.servers.containsUser(serverId, user.internalId),
            'User is not a member of the server.'
        )
        return await this.servers.getPagedChannels(serverId, limit, offset)
    }

    getServerUsers = async (
        user: AuthenticatedUser,
        serverId: string
    ): Promise<UserSummary[]> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(serverId),
            "Server doesn't exist."
        )
        requireOrThrow(
            BadRequestError,
            await this.servers.containsUser(serverId, user.internalId),
            'User is not a member of the server.'
        )
        const userIds = await this.servers.getUserIdsByServerId(serverId)
        const users = await this.users.getUsersByIds(userIds)
        return users.map((user) => ({
            id: user.id,
            username: user.username,
        }))
    }
}

export default ServerService
