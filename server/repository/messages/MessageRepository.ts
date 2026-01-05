import * as Cassandra from 'cassandra-driver'
import { MongoClient } from 'mongodb'
import { ChannelType } from '../../domain/channel/Channel'
import { Message } from '../../domain/message/Message'
import IMessageRepository from '../interfaces/IMessageRepository'
import {
    createCassandraClient,
    createMongoClient,
} from '../utils/databaseClients'

class MessageRepository implements IMessageRepository {
    private mdb: MongoClient
    private cdb: Cassandra.Client

    constructor() {
        this.mdb = createMongoClient()
        this.cdb = createCassandraClient()
    }

    async messageChannel(
        channelId: string,
        authorId: number,
        type: ChannelType,
        message: string,
        serverId?: string
    ): Promise<Message> {
        const id = Cassandra.types.Uuid.random()
        const timestamp = new Date()
        const channelUuid = Cassandra.types.Uuid.fromString(channelId)
        await this.cdb.execute(
            'INSERT INTO messages (channel_id, id, sender_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
            [channelUuid, id, authorId, message, timestamp],
            { prepare: true }
        )
        return new Message(
            id.toString(),
            type,
            channelId,
            authorId,
            message,
            timestamp,
            serverId
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
                row.id.toString(), // Convert Cassandra UUID to string
                ChannelType.SERVER, // FIXME: type should be stored or inferred
                row.channel_id.toString(),
                row.sender_id,
                row.content,
                row.created_at
            )
        })

        return {
            messages,
            nextPageState: result.pageState,
        }
    }
}

export default MessageRepository
