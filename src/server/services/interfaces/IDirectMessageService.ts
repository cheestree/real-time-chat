import { ConversationSummary, DirectMessageCreateInput } from '@rtchat/shared'
import { Message } from '../../domain/message/Message'
import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'

export interface IDirectMessageService {
    sendDirectMessage(
        user: AuthenticatedUser,
        input: DirectMessageCreateInput
    ): Promise<Message>

    getDirectMessages(
        user: AuthenticatedUser,
        recipientId: string,
        limit: number,
        nextPageState?: string
    ): Promise<{ messages: Message[]; nextPageState?: string }>

    getUserConversations(
        user: AuthenticatedUser
    ): Promise<ConversationSummary[]>
}
