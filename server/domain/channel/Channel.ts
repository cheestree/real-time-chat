import { ChannelSummary } from '../../http/model/output/server/ChannelSummary'
import { Message } from '../message/Message'

export enum ChannelType {
    SERVER = 'SERVER',
    DM = 'DM',
}

export class Channel {
    id: string
    serverId: string
    name: string
    description: string
    messages: Message[]
    blacklist: string[]
    whitelist: string[]
    type: ChannelType
    constructor(
        id: string,
        serverId: string,
        name: string,
        description: string,
        messages: Message[] = [],
        blacklist: string[] = [],
        whitelist: string[] = [],
        type: ChannelType = ChannelType.SERVER
    ) {
        this.id = id
        this.serverId = serverId
        this.name = name
        this.description = description || ''
        this.messages = messages
        this.blacklist = blacklist
        this.whitelist = whitelist
        this.type = type
    }

    toSummary(): ChannelSummary {
        return {
            id: this.id,
            serverId: this.serverId,
            name: this.name,
            description: this.description,
        }
    }
}
