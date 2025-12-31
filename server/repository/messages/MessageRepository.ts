import * as Cassandra from 'cassandra-driver'
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
import { ChannelType } from '../../domain/channel/Channel'
import { Message } from '../../domain/message/Message'
import IMessageRepository from '../interfaces/IMessageRepository'

class MessageRepository implements IMessageRepository {
    private mdb: MongoClient
    private cdb: Cassandra.Client

    constructor() {
        dotenv.config()

        this.mdb = new MongoClient(process.env.MONGODB_URI!)
        this.cdb = new Cassandra.Client({
            contactPoints: process.env
                .CASSANDRA_CONTACT_POINTS!.split(',')
                .map((cp) => cp.trim()),
            localDataCenter: process.env.CASSANDRA_LOCAL_DATACENTER!,
            keyspace: process.env.CASSANDRA_KEYSPACE!,
        })
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
