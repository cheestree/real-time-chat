import { Message } from '../../domain/message/Message'

interface IMessageRepository {
    messageChannel(channelId: number, message: Message): Promise<Message>
}

export default IMessageRepository
