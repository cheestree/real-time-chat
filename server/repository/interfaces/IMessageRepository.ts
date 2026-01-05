import { ChannelType } from '../../domain/channel/Channel'
import { Message } from '../../domain/message/Message'

interface IMessageRepository {
    messageChannel(
        channelId: string,
        authorId: number,
        type: ChannelType,
        message: string,
        serverId?: string
    ): Promise<Message>

    getPagedMessages(
        channelId: string,
        limit: number,
        nextPageState?: string
    ): Promise<{ messages: Message[]; nextPageState?: string }>
}

export default IMessageRepository
