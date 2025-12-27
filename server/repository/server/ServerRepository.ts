import { UUID } from 'bson'
import * as Cassandra from 'cassandra-driver'
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
import { Channel } from '../../domain/channel/Channel'
import { Message } from '../../domain/message/Message'
import { Server } from '../../domain/server/Server'
import { IServerRepository } from '../interfaces/IServerRepository'

interface ServerDocument {
    id: number
    name: string
    description: string
    ownerId: number
    icon: string
    users: number[]
    channels: number[]
}

class ServerRepository implements IServerRepository {
    private mdb: MongoClient
    private cdb: Cassandra.Client

    constructor() {
        dotenv.config()

        this.mdb = new MongoClient(process.env.MONGODB_URI!)
        this.cdb = new Cassandra.Client({
            contactPoints: (process.env.CASSANDRA_CONTACT_POINTS || 'localhost')
                .split(',')
                .map((cp) => cp.trim()),
            localDataCenter:
                process.env.CASSANDRA_LOCAL_DATACENTER || 'datacenter1',
            keyspace: process.env.CASSANDRA_KEYSPACE || 'rtchat',
        })
    }
    userExists(userId: UUID): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    isServerOwner(serverId: number, userId: number): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    containsUser(serverId: number, userId: number): Promise<boolean> {
        throw new Error('Method not implemented.')
    }

    async getServerById(serverId: number): Promise<Server | undefined> {
        return this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ id: serverId }) as unknown as Server
    }

    async addUserToServer(serverId: number, userId: number): Promise<Server> {
        await this.mdb
            .db('rtchat')
            .collection('servers')
            .updateOne({ id: serverId }, { $addToSet: { users: userId } })
        const updated = await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ id: serverId })
        return updated as unknown as Server
    }

    async channelExists(serverId: number, channelId: number): Promise<boolean> {
        const server = await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ id: serverId })
        if (!server) return false
        return (
            Array.isArray(server.channels) &&
            server.channels.includes(channelId)
        )
    }

    async createChannel(
        serverId: number,
        channelName: string,
        channelDescription: string
    ): Promise<Channel> {
        // Generate a numeric channelId (auto-increment simulation)
        const channelsCol = this.mdb.db('rtchat').collection('channels')
        const channelCount = await channelsCol.countDocuments()
        const channelId = channelCount + 1
        const channel: Channel = {
            id: channelId,
            name: channelName,
            description: channelDescription,
            messages: [],
            blacklist: [],
            whitelist: [],
        } as Channel
        await channelsCol.insertOne(channel)
        await this.mdb
            .db('rtchat')
            .collection('servers')
            .updateOne({ id: serverId }, { $addToSet: { channels: channelId } })
        return channel
    }

    async createServer(
        serverName: string,
        serverDescription: string,
        ownerId: number,
        icon: string
    ): Promise<Server> {
        return this.mdb
            .db('rtchat')
            .collection('servers')
            .insertOne({
                name: serverName,
                description: serverDescription,
                ownerId: ownerId,
                icon: icon,
                users: [ownerId],
                channels: [],
            })
            .then((result) =>
                this.mdb
                    .db('rtchat')
                    .collection('servers')
                    .findOne({ _id: result.insertedId })
            ) as unknown as Server
    }

    async messageChannel(
        channelId: number,
        message: Message
    ): Promise<Message> {
        // Store message in Cassandra
        const id = Cassandra.types.Uuid.random()
        const timestamp = new Date()
        await this.cdb.execute(
            'INSERT INTO messages (channel_id, id, username, message, created_at) VALUES (?, ?, ?, ?, ?)',
            [channelId, id, message.content, timestamp]
        )
        // Optionally, also store in MongoDB for channel history
        await this.mdb
            .db('rtchat')
            .collection('channels')
            .updateOne({ id: channelId }, { $addToSet: { messages: message } })
        return message
    }

    async serverExists(serverId: number): Promise<boolean> {
        return (
            this.mdb
                .db('rtchat')
                .collection('servers')
                .findOne({ id: serverId }) != null
        )
    }

    async getServerByName(serverName: string): Promise<Server | undefined> {
        return this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ name: serverName }) as unknown as Server
    }

    async leaveServer(serverId: number, userId: number): Promise<boolean> {
        return await this.mdb
            .db('rtchat')
            .collection<ServerDocument>('servers')
            .updateOne({ id: serverId }, { $pull: { users: userId } })
            .then(() => true)
            .catch(() => false)
    }

    async deleteServer(serverId: number, ownerId: number): Promise<boolean> {
        // Find server and get user list
        const server = await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ id: serverId, ownerId: ownerId })
        if (!server) return false
        const users = server.users || []
        await this.mdb
            .db('rtchat')
            .collection('servers')
            .deleteOne({ id: serverId, ownerId: ownerId })
        return true
    }

    async getUserServers(userId: number): Promise<Server[]> {
        return this.mdb
            .db('rtchat')
            .collection('servers')
            .find({ users: { $in: [userId] } })
            .toArray() as unknown as Server[]
    }
}

export default ServerRepository
