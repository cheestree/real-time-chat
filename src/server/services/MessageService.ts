import { MessageCreateInput } from '@rtchat/shared'
import { ChannelType } from '../domain/channel/Channel'
import { BadRequestError } from '../domain/error/Error'
import { Message } from '../domain/message/Message'
import { AuthenticatedUser } from '../domain/user/AuthenticatedUser'
import IMessageRepository from '../repository/interfaces/IMessageRepository'
import { IServerRepository } from '../repository/interfaces/IServerRepository'
import { isNotEmptyString } from '../utils/stringValidation'
import { IMessageService } from './interfaces/IMessageService'
import { requireOrThrow } from './utils/requireOrThrow'

class MessageService implements IMessageService {
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
                user.publicId,
                ChannelType.DM,
                input.content,
                undefined,
                user.profile.username
            )
        } else {
            requireOrThrow(
                BadRequestError,
                await this.servers.serverExists(input.serverId),
                "Server doesn't exist."
            )
            requireOrThrow(
                BadRequestError,
                await this.servers.containsUser(input.serverId, user.publicId),
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
                user.publicId,
                ChannelType.SERVER,
                input.content,
                input.serverId,
                user.profile.username
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
                await this.servers.containsUser(serverId, user.publicId),
                'User is not a member of the server.'
            )
            requireOrThrow(
                BadRequestError,
                await this.servers.channelExists(serverId, channelId),
                "Channel doesn't exist."
            )
        }

        return await this.messages.getPagedMessages(
            channelId,
            limit,
            nextPageState
        )
    }
}

export default MessageService
