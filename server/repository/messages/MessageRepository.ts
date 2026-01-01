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
        channelId: number,
        authorId: number,
        type: ChannelType,
        message: string,
        serverId?: number
    ): Promise<Message> {
        const id = Cassandra.types.Uuid.random()
        const timestamp = new Date()
        await this.cdb.execute(
            'INSERT INTO messages (channel_id, id, sender_id, content, created_at) VALUES (?, ?, ?, ?, ?)',
            [channelId, id.toString(), authorId, message, timestamp]
        )
        const numericId = Date.now()
        return new Message(
            numericId,
            type,
            channelId,
            authorId,
            message,
            timestamp
        )
    }
}

export default MessageRepository
