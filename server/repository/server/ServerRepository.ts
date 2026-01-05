import { UUID } from 'bson'
import { Kysely, PostgresDialect } from 'kysely'
import { MongoClient } from 'mongodb'
import { Pool } from 'pg'
import { Channel, ChannelType } from '../../domain/channel/Channel'
import { Message } from '../../domain/message/Message'
import { Server } from '../../domain/server/Server'
import { logger } from '../../utils/logger'

interface ServerDocument {
    id: string
    name: string
    description: string
    ownerId: number
    icon: string
    users: number[]
    channels: string[]
}

interface ChannelDocument {
    id: string
    name: string
    description: string
    type: ChannelType
    messages: unknown[]
    blacklist: string[]
    whitelist: string[]
}

import { Database } from '../Database'
import { IServerRepository } from '../interfaces/IServerRepository'
import { createMongoClient } from '../utils/databaseClients'

class ServerRepository implements IServerRepository {
    private mdb: MongoClient
    private db: Kysely<Database>

    constructor() {
        this.mdb = createMongoClient()
        this.db = new Kysely<Database>({
            dialect: new PostgresDialect({
                pool: new Pool({
                    user: process.env.POSTGRES_USER,
                    host: process.env.POSTGRES_HOST,
                    database: process.env.POSTGRES_DB,
                    password: process.env.POSTGRES_PASSWORD,
                    port: process.env.POSTGRES_PORT
                        ? parseInt(process.env.POSTGRES_PORT)
                        : 5432,
                }),
            }),
        })
    }

    async getChannelIdsByServerId(serverId: string): Promise<string[]> {
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
    async getUserIdsByServerId(serverId: string): Promise<number[]> {
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

    async isServerOwner(serverId: string, userId: number): Promise<boolean> {
        throw new Error('Method not implemented.')
    }

    async containsUser(serverId: string, userId: number): Promise<boolean> {
        return await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ id: serverId, users: { $in: [userId] } })
            .then((server) => server != null)
    }

    async getServerById(serverId: string): Promise<Server | undefined> {
        const doc = (await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ id: serverId })) as ServerDocument | null
        if (!doc) return undefined
        return this.mapToDomain(doc)
    }

    async addUserToServer(serverId: string, userId: number): Promise<Server> {
        await this.mdb
            .db('rtchat')
            .collection('servers')
            .updateOne({ id: serverId }, { $addToSet: { users: userId } })

        // Also add to PostgreSQL for relational queries
        await this.db
            .insertInto('rtchat.server_members')
            .values({
                server_id: serverId,
                user_id: userId,
            })
            .onConflict((oc) => oc.doNothing())
            .execute()

        const updated = (await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ id: serverId })) as ServerDocument | null
        return this.mapToDomain(updated!)
    }

    async channelExists(serverId: string, channelId: string): Promise<boolean> {
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
        serverId: string,
        channelName: string,
        channelDescription: string,
        type: ChannelType = ChannelType.SERVER
    ): Promise<Channel> {
        const channelsCol = this.mdb.db('rtchat').collection('channels')
        const channelId = new UUID().toString()
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
            serverId,
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
        const serversCol = this.mdb.db('rtchat').collection('servers')
        const serverId = new UUID().toString()
        const doc = {
            id: serverId,
            name: name,
            description: description || '',
            ownerId: userId,
            icon: icon || '',
            users: [userId],
            channels: [],
        }
        const result = await serversCol.insertOne(doc)
        logger.debug({ insertedId: result.insertedId }, 'Server insert result')

        // Add owner to PostgreSQL as well
        await this.db
            .insertInto('rtchat.server_members')
            .values({
                server_id: serverId,
                user_id: userId,
                role: 'OWNER',
            })
            .execute()

        const createdDoc = (await serversCol.findOne({
            _id: result.insertedId,
        })) as ServerDocument | null
        logger.debug({ server: createdDoc }, 'Created server')
        return this.mapToDomain(createdDoc!)
    }

    async serverExists(serverId: string): Promise<boolean> {
        return (
            (await this.mdb
                .db('rtchat')
                .collection('servers')
                .findOne({ id: serverId })) != null
        )
    }

    async getServerByName(serverName: string): Promise<Server | undefined> {
        const doc = (await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ name: serverName })) as unknown as ServerDocument
        if (!doc) return undefined
        return this.mapToDomain(doc)
    }

    async leaveServer(serverId: string, userId: number): Promise<boolean> {
        return await this.mdb
            .db('rtchat')
            .collection<ServerDocument>('servers')
            .updateOne({ id: serverId }, { $pull: { users: userId } })
            .then(() => true)
            .catch(() => false)
    }

    async deleteServer(serverId: string, ownerId: number): Promise<boolean> {
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

    async deleteChannel(serverId: string, channelId: string): Promise<boolean> {
        await this.mdb
            .db('rtchat')
            .collection('channels')
            .deleteOne({ id: channelId })
        await this.mdb
            .db('rtchat')
            .collection<ServerDocument>('servers')
            .updateOne({ id: serverId }, { $pull: { channels: channelId } })
        return true
    }

    async getUserServers(userId: number): Promise<Server[]> {
        const docs = (await this.mdb
            .db('rtchat')
            .collection('servers')
            .find({ users: { $in: [userId] } })
            .toArray()) as unknown as ServerDocument[]
        return docs.map((doc) => this.mapToDomain(doc))
    }

    async getPagedChannels(
        serverId: string,
        limit: number,
        offset: number
    ): Promise<Channel[]> {
        const server = await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ id: serverId })

        if (!server || !server.channels || server.channels.length === 0) {
            return []
        }

        const channelIds = server.channels.slice(offset, offset + limit)

        const channelDocs = (await this.mdb
            .db('rtchat')
            .collection('channels')
            .find({ id: { $in: channelIds } })
            .toArray()) as unknown as ChannelDocument[]

        return channelDocs.map(
            (doc) =>
                new Channel(
                    doc.id,
                    serverId,
                    doc.name,
                    doc.description,
                    (doc.messages as Message[]) || [],
                    (doc.blacklist as string[]) || [],
                    (doc.whitelist as string[]) || [],
                    doc.type
                )
        )
    }

    private mapToDomain(doc: ServerDocument): Server {
        return new Server(
            doc.id,
            doc.name,
            doc.description,
            doc.ownerId,
            doc.icon,
            doc.channels,
            doc.users
        )
    }
}

export default ServerRepository
