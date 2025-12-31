import { ChannelType } from '../../domain/channel/Channel'
import { Message } from '../../domain/message/Message'

interface IMessageRepository {
    messageChannel(
        channelId: number,
        authorId: number,
        type: ChannelType,
        message: string,
        serverId?: number
    ): Promise<Message>
}

export default IMessageRepository
