import { ConversationSummary } from '@rtchat/shared'
import * as Cassandra from 'cassandra-driver'
import { ChannelType } from '../../domain/channel/Channel'
import { Message } from '../../domain/message/Message'
import IDirectMessageRepository from '../interfaces/IDirectMessageRepository'
import { createCassandraClient } from '../utils/databaseClients'

class DirectMessageRepository implements IDirectMessageRepository {
    private cdb: Cassandra.Client

    constructor() {
        this.cdb = createCassandraClient()
    }

    async sendDirectMessage(
        senderId: string,
        recipientId: string,
        content: string,
        senderUsername: string,
        senderIcon?: string
    ): Promise<Message> {
        const id = Cassandra.types.Uuid.random()
        const timestamp = new Date()

        // Create a deterministic channel ID for DMs between two users
        // Sort the UUIDs to ensure the same channel ID regardless of who sends first
        const channelId = this.createDMChannelId(senderId, recipientId)
        const channelUuid = Cassandra.types.Uuid.fromString(channelId)

        await this.cdb.execute(
            'INSERT INTO messages (channel_id, id, author_id, author_username, author_icon, content, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                channelUuid,
                id,
                senderId,
                senderUsername,
                senderIcon || null,
                content,
                timestamp,
            ],
            { prepare: true }
        )

        return new Message(
            id.toString(),
            ChannelType.DM,
            channelId,
            senderId,
            senderUsername,
            content,
            timestamp,
            undefined,
            senderIcon
        )
    }

    async getDirectMessages(
        userId: string,
        otherUserId: string,
        limit: number,
        nextPageState?: string
    ): Promise<{ messages: Message[]; nextPageState?: string }> {
        const channelId = this.createDMChannelId(userId, otherUserId)
        const channelUuid = Cassandra.types.Uuid.fromString(channelId)

        const query =
            'SELECT * FROM messages WHERE channel_id = ? ORDER BY created_at DESC'
        const options = {
            prepare: true,
            fetchSize: limit,
            pageState: nextPageState,
        }

        const result = await this.cdb.execute(query, [channelUuid], options)
        const messages = result.rows.map((row) => {
            return new Message(
                row.id.toString(),
                ChannelType.DM,
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

    async getUserConversations(userId: string): Promise<ConversationSummary[]> {
        // Not needed - users initiate DMs by clicking on other users
        // The deterministic channel ID handles conversation discovery
        // TODO: Implement a "recent conversations" API if we want to show a list of past DMs
        return []
    }

    private createDMChannelId(userId1: string, userId2: string): string {
        // Create deterministic channel ID by sorting user IDs
        // This ensures the same channel ID regardless of who initiates the DM
        const sorted = [userId1, userId2].sort()

        try {
            const uuid1 = Cassandra.types.Uuid.fromString(sorted[0])
            const uuid2 = Cassandra.types.Uuid.fromString(sorted[1])

            // Create a deterministic UUID by XORing the bytes
            const buffer1 = uuid1.getBuffer()
            const buffer2 = uuid2.getBuffer()
            const combined = Buffer.alloc(16)

            for (let i = 0; i < 16; i++) {
                combined[i] = buffer1[i] ^ buffer2[i]
            }

            return new Cassandra.types.Uuid(combined).toString()
        } catch (error) {
            throw new Error('Invalid user IDs for DM channel creation')
        }
    }
}

export default DirectMessageRepository
