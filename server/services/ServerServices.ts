import { Channel } from '../domain/channel/Channel'
import { BadRequestError } from '../domain/error/Error'
import { Message } from '../domain/message/Message'
import { Server } from '../domain/server/Server'
import { UserProfile } from '../domain/user/UserProfile'
import { IServerRepository } from '../repository/interfaces/IServerRepository'
import { requireOrThrow } from './utils/requireOrThrow'

class ServerServices {
    servers: IServerRepository
    constructor(serverRepo: IServerRepository) {
        this.servers = serverRepo
    }
    getUserServers = async (user: UserProfile) => {
        return await this.servers.getUserServers(user.id)
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
        owner: UserProfile,
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
            owner.id,
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
        user: UserProfile
    ): Promise<Server> => {
        requireOrThrow(
            BadRequestError,
            serverId > 0,
            "Server ID can't be a negative number."
        )
        return await this.servers.addUserToServer(serverId, user.id)
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
        user: UserProfile
    ): Promise<boolean> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(serverId),
            "Server doesn't exist."
        )
        return await this.servers.leaveServer(serverId, user.id)
    }
    deleteServer = async (
        serverId: number,
        user: UserProfile
    ): Promise<boolean> => {
        requireOrThrow(
            BadRequestError,
            await this.servers.serverExists(serverId),
            "Server doesn't exist."
        )
        return await this.servers.deleteServer(serverId, user.id)
    }
}

export default ServerServices
