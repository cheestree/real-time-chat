import { ChannelType } from '../domain/channel/Channel'
import { BadRequestError } from '../domain/error/Error'
import { Message } from '../domain/message/Message'
import { AuthenticatedUser } from '../domain/user/AuthenticatedUser'
import { MessageCreateInput } from '../http/model/input/message/MessageCreateInput'
import IMessageRepository from '../repository/interfaces/IMessageRepository'
import { IServerRepository } from '../repository/interfaces/IServerRepository'
import { isNotEmptyString } from '../utils/stringValidation'
import { IMessageServices } from './interfaces/IMessageServices'
import { requireOrThrow } from './utils/requireOrThrow'

class MessageServices implements IMessageServices {
    servers: IServerRepository
    messages: IMessageRepository
    constructor(
        serverRepo: IServerRepository,
        messageRepo: IMessageRepository
    ) {
        this.servers = serverRepo
        this.messages = messageRepo
    }

    sendMessage = async (
        user: AuthenticatedUser,
        input: MessageCreateInput
    ): Promise<Message> => {
        requireOrThrow(
            BadRequestError,
            isNotEmptyString(input.content),
            "Content can't be an empty string."
        )
        if (input.serverId === undefined) {
            return await this.messages.messageChannel(
                input.channelId,
                user.internalId,
                ChannelType.DM,
                input.content
            )
        } else {
            requireOrThrow(
                BadRequestError,
                await this.servers.serverExists(input.serverId),
                "Server doesn't exist."
            )
            requireOrThrow(
                BadRequestError,
                await this.servers.containsUser(
                    input.serverId,
                    user.internalId
                ),
                'User is not a member of the server.'
            )
            requireOrThrow(
                BadRequestError,
                await this.servers.channelExists(
                    input.serverId,
                    input.channelId
                ),
                "Channel doesn't exist."
            )
            return await this.messages.messageChannel(
                input.channelId,
                user.internalId,
                ChannelType.SERVER,
                input.content,
                input.serverId
            )
        }
    }

    getPagedMessages = async (
        user: AuthenticatedUser,
        channelId: string,
        limit: number,
        nextPageState?: string,
        serverId?: string
    ): Promise<{ messages: Message[]; nextPageState?: string }> => {
        if (serverId) {
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
            requireOrThrow(
                BadRequestError,
                await this.servers.channelExists(serverId, channelId),
                "Channel doesn't exist."
            )
        }
        // For DMs, we might need extra checks here in the future

        return await this.messages.getPagedMessages(
            channelId,
            limit,
            nextPageState
        )
    }
}

export default MessageServices
