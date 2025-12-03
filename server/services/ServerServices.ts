import { CustomChannel } from '../domain/CustomChannel'
import { CustomServer } from '../domain/CustomServer'
import { Message } from '../domain/Message'
import { BadRequestError } from '../domain/error/Error'
import { UserProfile } from '../domain/user/UserProfile'
import { requireOrThrow } from '../middleware/requireOrThrow'
import { ServerRepositoryInterface } from '../repository/server/ServerRepositoryInterface'

class ServerServices {
    servers: ServerRepositoryInterface
    constructor(serverRepo: ServerRepositoryInterface) {
        this.servers = serverRepo
    }
    getUserServers = async (user: UserProfile) => {
        return await this.servers.getUserServers(user)
    }
    createServer = async (
        serverName: string,
        serverDescription: string,
        owner: UserProfile,
        icon: string
    ): Promise<CustomServer> => {
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
            owner,
            icon
        )
    }
    createChannel = async (
        serverId: number,
        channelName: string,
        channelDescription: string
    ): Promise<CustomChannel> => {
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
        user: UserProfile
    ): Promise<CustomServer> => {
        requireOrThrow(
            BadRequestError,
            serverId > 0,
            "Server ID can't be a negative number."
        )
        return await this.servers.addUserToServer(serverId, user)
    }
    messageChannel = async (
        serverId: number,
        channelId: number,
        message: Message
    ): Promise<Message> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(serverId),
            "Server doesn't exist."
        )
        requireOrThrow(
            BadRequestError,
            await this.servers.channelExists(serverId, channelId),
            "Channel doesn't exist."
        )
        requireOrThrow(
            BadRequestError,
            message.message.trim() != '',
            "Message can't be an empty string."
        )
        return await this.servers.messageChannel(serverId, channelId, message)
    }
    leaveServer = async (
        serverId: number,
        user: UserProfile
    ): Promise<number> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(serverId),
            "Server doesn't exist."
        )
        return await this.servers.leaveServer(serverId, user)
    }
    deleteServer = async (
        serverId: number,
        user: UserProfile
    ): Promise<UserProfile[]> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(serverId),
            "Server doesn't exist."
        )
        return await this.servers.deleteServer(serverId, user)
    }
}

export default ServerServices
