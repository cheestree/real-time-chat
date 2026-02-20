import { MessageCreateInput } from '@rtchat/shared'
import { Message } from '../../domain/message/Message'
import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'

export interface IMessageService {
    sendMessage(
        user: AuthenticatedUser,
        input: MessageCreateInput
    ): Promise<Message>

    getPagedMessages(
        user: AuthenticatedUser,
        channelId: string,
        limit: number,
        nextPageState?: string,
        serverId?: string
    ): Promise<{ messages: Message[]; nextPageState?: string }>
}
