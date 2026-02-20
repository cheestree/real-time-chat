import { ServerDetail } from '@rtchat/shared'
import { UUID } from 'bson'
import { Kysely, PostgresDialect } from 'kysely'
import { MongoClient } from 'mongodb'
import { Channel, ChannelType } from '../../domain/channel/Channel'
import { Server } from '../../domain/server/Server'

interface ServerDocument {
    id: string
    name: string
    description: string
    owners: string[]
    icon: string
    users: string[]
    channels: string[]
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
            .findOne({ id: serverId }, { projection: { channels: 1, _id: 0 } })
            .then((server) => (server?.channels as string[]) || [])
    }
    async getUserIdsByServerId(serverId: string): Promise<string[]> {
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

    async isServerOwner(
        serverId: string,
        userPublicId: string
    ): Promise<boolean> {
        return await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ id: serverId, owners: { $in: [userPublicId] } })
            .then((server) => server != null)
    }

    async containsUser(
        serverId: string,
        userPublicId: string
    ): Promise<boolean> {
        return await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ id: serverId, users: { $in: [userPublicId] } })
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

    async addUserToServer(
        serverId: string,
        userPublicId: string,
        userInternalId: number
    ): Promise<Server> {
        await this.mdb
            .db('rtchat')
            .collection('servers')
            .updateOne({ id: serverId }, { $addToSet: { users: userPublicId } })

        await this.db
            .insertInto('rtchat.server_members')
            .values({
                server_id: serverId,
                user_id: userInternalId,
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
            [], // blacklist
            [], // whitelist
            type
        )
    }

    async createServer(
        name: string,
        userId: number,
        userPublicId: string,
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

        // Create the server with the general channel ID only
        const doc = {
            id: serverId,
            name: name,
            description: description || '',
            owners: [userPublicId],
            icon: icon || '',
            users: [userPublicId],
            channels: [generalChannelId],
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

    async leaveServer(
        serverId: string,
        userPublicId: string,
        userInternalId: number
    ): Promise<boolean> {
        // Remove from MongoDB
        await this.mdb
            .db('rtchat')
            .collection<ServerDocument>('servers')
            .updateOne({ id: serverId }, { $pull: { users: userPublicId } })

        // Remove from PostgreSQL
        await this.db
            .deleteFrom('rtchat.server_members')
            .where('server_id', '=', serverId)
            .where('user_id', '=', userInternalId)
            .execute()

        return true
    }

    async deleteServer(
        serverId: string,
        ownerPublicId: string
    ): Promise<boolean> {
        const server = await this.mdb
            .db('rtchat')
            .collection('servers')
            .findOne({ id: serverId, owners: { $in: [ownerPublicId] } })
        if (!server) return false

        // Delete all channels associated with this server
        await this.mdb
            .db('rtchat')
            .collection('channels')
            .deleteMany({ serverId: serverId })

        // Delete the server itself
        await this.mdb
            .db('rtchat')
            .collection('servers')
            .deleteOne({ id: serverId })
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

    async getUserServers(userPublicId: string): Promise<ServerDetail[]> {
        const docs = (await this.mdb
            .db('rtchat')
            .collection('servers')
            .find({ users: { $in: [userPublicId] } })
            .toArray()) as unknown as ServerDocument[]

        // Collect all unique channel IDs across all servers
        const allChannelIds = [...new Set(docs.flatMap((doc) => doc.channels))]

        // Fetch full channel documents in one query
        const channelDocs = (await this.mdb
            .db('rtchat')
            .collection('channels')
            .find({ id: { $in: allChannelIds } })
            .toArray()) as unknown as ChannelDocument[]

        const channelMap = new Map(channelDocs.map((ch) => [ch.id, ch]))

        return docs.map((doc) => ({
            id: doc.id,
            name: doc.name,
            description: doc.description,
            icon: doc.icon,
            ownerIds: doc.owners || [],
            channels: doc.channels
                .map((channelId) => {
                    const ch = channelMap.get(channelId)
                    if (!ch) return null
                    return {
                        id: ch.id,
                        name: ch.name,
                        description: ch.description,
                        serverId: doc.id,
                    }
                })
                .filter(Boolean) as {
                id: string
                name: string
                description: string
                serverId: string
            }[],
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

        const channelIds = (server.channels as string[]).slice(
            offset,
            offset + limit
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
            doc.owners,
            doc.icon,
            doc.channels,
            [] // Don't pass users - Server domain doesn't need MongoDB users array
        )
    }
}

export default ServerRepository
