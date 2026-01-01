import { ChannelType } from '../domain/channel/Channel'
import { BadRequestError } from '../domain/error/Error'
import { Message } from '../domain/message/Message'
import { AuthenticatedUser } from '../domain/user/AuthenticatedUser'
import { MessageCreateInput } from '../http/model/input/message/MessageCreateInput'
import { MessageSummary } from '../http/model/output/server/MessageSummary'
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
    ): Promise<MessageSummary> => {
        requireOrThrow(
            BadRequestError,
            isNotEmptyString(input.content),
            "Content can't be an empty string."
        )
        if (input.serverId === undefined) {
            return await this.messages
                .messageChannel(
                    input.channelId,
                    user.internalId,
                    ChannelType.DM,
                    input.content
                )
                .then((message: Message) => message.toSummary())
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
            return await this.messages
                .messageChannel(
                    input.channelId,
                    user.internalId,
                    ChannelType.SERVER,
                    input.content,
                    input.serverId
                )
                .then((message: Message) => message.toSummary())
        }
    }
}

export default MessageServices
