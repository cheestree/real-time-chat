import { Message } from '../../domain/message/Message'
import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'
import { MessageCreateInput } from '../../http/model/input/message/MessageCreateInput'

export interface IMessageServices {
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
