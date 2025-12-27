import { Channel } from '../domain/channel/Channel'
import { BadRequestError } from '../domain/error/Error'
import { Message } from '../domain/message/Message'
import { Server } from '../domain/server/Server'
import { AuthenticatedUser } from '../domain/user/AuthenticatedUser'
import { IServerRepository } from '../repository/interfaces/IServerRepository'
import { IUserRepository } from '../repository/interfaces/IUserRepository'
import { requireOrThrow } from './utils/requireOrThrow'

class ServerServices {
    servers: IServerRepository
    users: IUserRepository
    constructor(serverRepo: IServerRepository, userRepo: IUserRepository) {
        this.servers = serverRepo
        this.users = userRepo
    }
    getUserServers = async (userId: string) => {
        requireOrThrow(
            BadRequestError,
            await this.users.userExists(userId),
            'User does not exist.'
        )
        const user = await this.users.getUserByUUID(userId)
        return await this.servers.getUserServers(user!.internalId)
    }
    getServerById = async (serverId: number) => {
        return await this.servers.getServerById(serverId)
    }
    serverExists = async (serverId: number) => {
        return await this.servers.serverExists(serverId)
    }
    createServer = async (
        serverName: string,
        serverDescription: string,
        user: AuthenticatedUser,
        icon: string
    ): Promise<Server> => {
        const serverNameTrimmed = serverName.trim()
        const serverDescriptionTrimmed = serverDescription.trim()
        requireOrThrow(
            BadRequestError,
            !(!serverNameTrimmed || !serverDescriptionTrimmed),
            "Server name/description can't be an empty string."
        )
        return await this.servers.createServer(
            serverNameTrimmed,
            serverDescriptionTrimmed,
            user.internalId,
            icon
        )
    }
    createChannel = async (
        serverId: number,
        channelName: string,
        channelDescription: string
    ): Promise<Channel> => {
        const serverExists = await this.servers.serverExists(serverId)
        const channelNameTrimmed = channelName.trim()
        const channelDescriptionTrimmed = channelDescription.trim()
        requireOrThrow(BadRequestError, serverExists, "Server doesn't exist.")
        requireOrThrow(
            BadRequestError,
            !(!channelNameTrimmed || !channelDescriptionTrimmed),
            "Server name/description can't be an empty string."
        )
        return await this.servers.createChannel(
            serverId,
            channelDescriptionTrimmed,
            channelDescriptionTrimmed
        )
    }
    addUserToServer = async (
        serverId: number,
        authenticatedUser: AuthenticatedUser
    ): Promise<Server> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(serverId),
            "Server doesn't exist."
        )
        requireOrThrow(
            BadRequestError,
            (await this.servers.containsUser(
                serverId,
                authenticatedUser.internalId
            )) === false,
            'User is already a member of the server.'
        )
        return await this.servers.addUserToServer(
            serverId,
            authenticatedUser.internalId
        )
    }
    messageChannel = async (
        serverId: number,
        channelId: number,
        message: Message
    ): Promise<Message> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.channelExists(serverId, channelId),
            "Channel doesn't exist."
        )
        requireOrThrow(
            BadRequestError,
            message.content.trim() != '',
            "Content can't be an empty string."
        )
        return await this.servers.messageChannel(channelId, message)
    }
    leaveServer = async (
        serverId: number,
        authenticatedUser: AuthenticatedUser
    ): Promise<boolean> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(serverId),
            "Server doesn't exist."
        )
        return await this.servers.leaveServer(
            serverId,
            authenticatedUser.internalId
        )
    }
    deleteServer = async (
        serverId: number,
        authenticatedUser: AuthenticatedUser
    ): Promise<boolean> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(serverId),
            "Server doesn't exist."
        )
        requireOrThrow(
            BadRequestError,
            await this.servers.isServerOwner(
                serverId,
                authenticatedUser.internalId
            ),
            'Only the server owner can delete the server.'
        )
        return await this.servers.deleteServer(
            serverId,
            authenticatedUser.internalId
        )
    }
}

export default ServerServices
