import { MessageSummary } from '../../http/model/output/server/MessageSummary'
import { ChannelType } from '../channel/Channel'

export class Message {
    id: string
    type: ChannelType
    serverId?: string
    channelId: string
    authorId: number
    content: string
    timestamp: Date

    constructor(
        id: string,
        type: ChannelType,
        channelId: string,
        authorId: number,
        content: string,
        timestamp: Date,
        serverId?: string
    ) {
        this.id = id
        this.type = type
        this.channelId = channelId
        this.authorId = authorId
        this.content = content
        this.timestamp = timestamp
        this.serverId = serverId
    }

    toSummary(): MessageSummary {
        return {
            id: this.id,
            authorId: this.authorId,
            content: this.content,
            timestamp: this.timestamp.toString(),
        }
    }
}
