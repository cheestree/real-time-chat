import { ConversationSummary, DirectMessageCreateInput } from '@rtchat/shared'
import { BadRequestError } from '../domain/error/Error'
import { Message } from '../domain/message/Message'
import { AuthenticatedUser } from '../domain/user/AuthenticatedUser'
import IDirectMessageRepository from '../repository/interfaces/IDirectMessageRepository'
import { IUserRepository } from '../repository/interfaces/IUserRepository'
import { isNotEmptyString } from '../utils/stringValidation'
import { IDirectMessageService } from './interfaces/IDirectMessageService'
import { requireOrThrow } from './utils/requireOrThrow'

class DirectMessageService implements IDirectMessageService {
    users: IUserRepository
    directMessages: IDirectMessageRepository

    constructor(userRepo: IUserRepository, dmRepo: IDirectMessageRepository) {
        this.users = userRepo
        this.directMessages = dmRepo
    }

    sendDirectMessage = async (
        user: AuthenticatedUser,
        input: DirectMessageCreateInput
    ): Promise<Message> => {
        requireOrThrow(
            BadRequestError,
            isNotEmptyString(input.content),
            "Content can't be an empty string."
        )

        requireOrThrow(
            BadRequestError,
            await this.users.userExists(input.recipientId),
            "Recipient user doesn't exist."
        )

        requireOrThrow(
            BadRequestError,
            input.recipientId !== user.publicId,
            'Cannot send message to yourself.'
        )

        return await this.directMessages.sendDirectMessage(
            user.publicId,
            input.recipientId,
            input.content,
            user.profile.username,
            undefined
        )
    }

    getDirectMessages = async (
        user: AuthenticatedUser,
        recipientId: string,
        limit: number,
        nextPageState?: string
    ): Promise<{ messages: Message[]; nextPageState?: string }> => {
        requireOrThrow(
            BadRequestError,
            await this.users.userExists(recipientId),
            "Recipient user doesn't exist."
        )

        return await this.directMessages.getDirectMessages(
            user.publicId,
            recipientId,
            limit,
            nextPageState
        )
    }

    getUserConversations = async (
        user: AuthenticatedUser
    ): Promise<ConversationSummary[]> => {
        return await this.directMessages.getUserConversations(user.publicId)
    }
}

export default DirectMessageService
