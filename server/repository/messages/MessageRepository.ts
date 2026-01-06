import * as Cassandra from 'cassandra-driver'
import { ChannelType } from '../../domain/channel/Channel'
import { Message } from '../../domain/message/Message'
import IMessageRepository from '../interfaces/IMessageRepository'
import { createCassandraClient } from '../utils/databaseClients'

class MessageRepository implements IMessageRepository {
    private cdb: Cassandra.Client

    constructor() {
        this.cdb = createCassandraClient()
    }

    async messageChannel(
        channelId: string,
        authorId: string,
        type: ChannelType,
        message: string,
        serverId?: string,
        authorUsername?: string,
        authorIcon?: string
    ): Promise<Message> {
        const id = Cassandra.types.Uuid.random()
        const timestamp = new Date()
        const channelUuid = Cassandra.types.Uuid.fromString(channelId)
        await this.cdb.execute(
            'INSERT INTO messages (channel_id, id, author_id, author_username, author_icon, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                channelUuid,
                id,
                authorId,
                authorUsername || '',
                authorIcon || null,
                message,
                timestamp,
            ],
            { prepare: true }
        )
        return new Message(
            id.toString(),
            type,
            channelId,
            authorId,
            authorUsername || '',
            message,
            timestamp,
            serverId,
            authorIcon
        )
    }

    async getPagedMessages(
        channelId: string,
        limit: number,
        nextPageState?: string
    ): Promise<{ messages: Message[]; nextPageState?: string }> {
        const query =
            'SELECT * FROM messages WHERE channel_id = ? ORDER BY created_at DESC'
        const options = {
            prepare: true,
            fetchSize: limit,
            pageState: nextPageState,
        }
        const channelUuid = Cassandra.types.Uuid.fromString(channelId)
        const result = await this.cdb.execute(query, [channelUuid], options)
        const messages = result.rows.map((row) => {
            return new Message(
                row.id.toString(),
                ChannelType.SERVER,
                row.channel_id.toString(),
                row.author_id,
                row.author_username || '',
                row.content,
                row.created_at,
                undefined,
                row.author_icon
            )
        })

        return {
            messages,
            nextPageState: result.pageState,
        }
    }
}

export default MessageRepository
