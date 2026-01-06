import { MessageSummary } from '../../http/model/output/server/MessageSummary'
import { ChannelType } from '../channel/Channel'

export class Message {
    id: string
    type: ChannelType
    serverId?: string
    channelId: string
    authorId: string
    authorUsername: string
    authorIcon?: string
    content: string
    timestamp: Date

    constructor(
        id: string,
        type: ChannelType,
        channelId: string,
        authorId: string,
        authorUsername: string,
        content: string,
        timestamp: Date,
        serverId?: string,
        authorIcon?: string
    ) {
        this.id = id
        this.type = type
        this.channelId = channelId
        this.authorId = authorId
        this.authorUsername = authorUsername
        this.content = content
        this.timestamp = timestamp
        this.serverId = serverId
        this.authorIcon = authorIcon
    }

    toSummary(): MessageSummary {
        return {
            id: this.id,
            authorId: this.authorId,
            content: this.content,
            timestamp: this.timestamp.toString(),
            authorUsername: this.authorUsername,
            authorIcon: this.authorIcon,
        }
    }
}
