import { UUID } from 'bson'
import * as Cassandra from 'cassandra-driver'
import dotenv from 'dotenv'
import { MongoClient } from 'mongodb'
import { Channel, ChannelType } from '../../domain/channel/Channel'
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
            contactPoints: process.env
                .CASSANDRA_CONTACT_POINTS!.split(',')
                .map((cp) => cp.trim()),
            localDataCenter: process.env.CASSANDRA_LOCAL_DATACENTER!,
            keyspace: process.env.CASSANDRA_KEYSPACE!,
        })
    }

    async getChannelIdsByServerId(serverId: number): Promise<number[]> {
        return await this.mdb
            .db('rtchat')
            .collection('servers')
            .find({ id: serverId })
            .project({ channels: 1, _id: 0 })
            .toArray()
            .then((servers) => {
                if (servers.length === 0) return []
                return servers[0].channels || []
            })
    }
    async getUserIdsByServerId(serverId: number): Promise<number[]> {
        return await this.mdb
            .db('rtchat')
            .collection('servers')
            .find({ id: serverId })
            .project({ users: 1, _id: 0 })
            .toArray()
            .then((servers) => {
                if (servers.length === 0) return []
                return servers[0].users || []
            })
    }
    async userExists(userId: UUID): Promise<boolean> {
        throw new Error('Method not implemented.')
    }

    async isServerOwner(serverId: number, userId: number): Promise<boolean> {
        throw new Error('Method not implemented.')
    }

    async containsUser(serverId: number, userId: number): Promise<boolean> {
        return await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ id: serverId, users: { $in: [userId] } })
            .then((server) => server != null)
    }

    async getServerById(serverId: number): Promise<Server | undefined> {
        return (await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ id: serverId })) as unknown as Server
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
        channelDescription: string,
        type: ChannelType = ChannelType.SERVER
    ): Promise<Channel> {
        const channelsCol = this.mdb.db('rtchat').collection('channels')
        const channelCount = await channelsCol.countDocuments()
        const channelId = channelCount + 1
        await channelsCol.insertOne({
            id: channelId,
            name: channelName,
            description: channelDescription,
            messages: [],
            blacklist: [],
            whitelist: [],
            type: type,
        })
        await this.mdb
            .db('rtchat')
            .collection('servers')
            .updateOne({ id: serverId }, { $addToSet: { channels: channelId } })
        return new Channel(
            channelId,
            channelName,
            channelDescription,
            [], // messages
            [], // blacklist
            [], // whitelist
            type
        )
    }

    async createServer(
        name: string,
        userId: number,
        description?: string,
        icon?: string
    ): Promise<Server> {
        const doc = {
            name: name,
            description: description,
            ownerId: userId,
            icon: icon,
            users: [userId],
            channels: [],
        }
        const result = await this.mdb
            .db('rtchat')
            .collection('servers')
            .insertOne(doc)
        console.log('ServerRepository: Insert result:', result.insertedId)
        const server = (await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ _id: result.insertedId })) as unknown as Server
        console.log('ServerRepository: Created server:', server)
        return server
    }

    async serverExists(serverId: number): Promise<boolean> {
        return (
            (await this.mdb
                .db('rtchat')
                .collection('servers')
                .findOne({ id: serverId })) != null
        )
    }

    async getServerByName(serverName: string): Promise<Server | undefined> {
        return (await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ name: serverName })) as unknown as Server
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
        const server = await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ id: serverId, ownerId: ownerId })
        if (!server) return false
        await this.mdb
            .db('rtchat')
            .collection('servers')
            .deleteOne({ id: serverId, ownerId: ownerId })
        return true
    }

    async getUserServers(userId: number): Promise<Server[]> {
        return (await this.mdb
            .db('rtchat')
            .collection('servers')
            .find({ users: { $in: [userId] } })
            .toArray()) as unknown as Server[]
    }
}

export default ServerRepository
