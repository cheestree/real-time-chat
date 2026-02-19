import { ConversationSummary } from '@rtchat/shared'
import { Message } from '../../domain/message/Message'

interface IDirectMessageRepository {
    sendDirectMessage(
        senderId: string,
        recipientId: string,
        content: string,
        senderUsername: string,
        senderIcon?: string
    ): Promise<Message>

    getDirectMessages(
        userId: string,
        otherUserId: string,
        limit: number,
        nextPageState?: string
    ): Promise<{ messages: Message[]; nextPageState?: string }>

    getUserConversations(userId: string): Promise<ConversationSummary[]>
}

export default IDirectMessageRepository
