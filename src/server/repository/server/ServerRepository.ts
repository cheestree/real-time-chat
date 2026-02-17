import { UUID } from 'bson'
import { Kysely, PostgresDialect } from 'kysely'
import { MongoClient } from 'mongodb'
import { Channel, ChannelType } from '../../domain/channel/Channel'
import { Server } from '../../domain/server/Server'
import { ServerDetail } from '../../http/model/output/server/ServerDetail'

interface ServerDocument {
    id: string
    name: string
    description: string
    ownerId: number
    icon: string
    users: number[]
    channels: { id: string; name: string }[]
}

interface ChannelDocument {
    id: string
    name: string
    description: string
    type: ChannelType
    blacklist: string[]
    whitelist: string[]
}

import { Database } from '../Database'
import { IServerRepository } from '../interfaces/IServerRepository'
import { createMongoClient, getPostgresPool } from '../utils/databaseClients'

class ServerRepository implements IServerRepository {
    private mdb: MongoClient
    private db: Kysely<Database>

    constructor() {
        this.mdb = createMongoClient()
        this.db = new Kysely<Database>({
            dialect: new PostgresDialect({
                pool: getPostgresPool(),
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
                const channels = servers[0].channels || []
                return channels.map((ch: { id: string; name: string }) => ch.id)
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
        const server = (await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ id: serverId })) as ServerDocument | null
        if (!server) return false
        return (
            Array.isArray(server.channels) &&
            server.channels.some((ch) => ch.id === channelId)
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
            .updateOne(
                { id: serverId },
                {
                    $addToSet: {
                        channels: { id: channelId, name: channelName },
                    },
                }
            )
        return new Channel(
            channelId,
            serverId,
            channelName,
            channelDescription,
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
        const channelsCol = this.mdb.db('rtchat').collection('channels')
        const serverId = new UUID().toString()
        const generalChannelId = new UUID().toString()

        // Create the general channel in the channels collection
        await channelsCol.insertOne({
            id: generalChannelId,
            name: 'general',
            description: 'General discussion channel',
            messages: [],
            blacklist: [],
            whitelist: [],
            type: ChannelType.SERVER,
        })

        // Create the server with the general channel ID and name
        const doc = {
            id: serverId,
            name: name,
            description: description || '',
            ownerId: userId,
            icon: icon || '',
            users: [userId],
            channels: [{ id: generalChannelId, name: 'general' }],
        }
        const result = await serversCol.insertOne(doc)

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
            .updateOne(
                { id: serverId },
                { $pull: { channels: { id: channelId } } }
            )
        return true
    }

    async getUserServers(userId: number): Promise<ServerDetail[]> {
        const docs = (await this.mdb
            .db('rtchat')
            .collection('servers')
            .find({ users: { $in: [userId] } })
            .toArray()) as unknown as ServerDocument[]

        return docs.map((doc) => ({
            id: doc.id,
            name: doc.name,
            description: doc.description,
            icon: doc.icon,
            ownerIds: [doc.ownerId],
            channels: doc.channels.map((ch) => ({
                id: ch.id,
                name: ch.name,
                description: '',
                serverId: doc.id,
            })),
            users: [],
        }))
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

        const channelRefs = server.channels.slice(offset, offset + limit)
        const channelIds = channelRefs.map(
            (ch: { id: string; name: string }) => ch.id
        )

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
            doc.channels.map((ch) => ch.id),
            doc.users
        )
    }
}

export default ServerRepository
