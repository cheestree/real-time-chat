import { Message } from './Message'

export class Channel {
    id: string
    serverId: string
    name: string
    description: string
    messages: Message[]
    blacklist: string[]
    whitelist: string[]
    constructor(
        id: string,
        serverId: string,
        channelName: string,
        description: string
    ) {
        this.id = id
        this.serverId = serverId
        this.name = channelName
        this.description = description
        this.messages = []
        this.blacklist = []
        this.whitelist = []
    }
}
