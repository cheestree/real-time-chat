import { Message } from '../../domain/message/Message'
import IMessageRepository from '../interfaces/IMessageRepository'

class MessageRepository implements IMessageRepository {
    async messageChannel(
        channelId: number,
        message: Message
    ): Promise<Message> {
        // Implementation for storing the message
        // This is a placeholder; actual implementation would interact with a database
        return message
    }
}
