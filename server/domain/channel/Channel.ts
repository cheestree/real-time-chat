import { ChannelSummary } from '../../http/model/output/server/ChannelSummary'
import { Message } from '../message/Message'
import { UserProfile } from '../user/UserProfile'

export enum ChannelType {
    SERVER = 'SERVER',
    DM = 'DM',
}

export class Channel {
    id: number
    name: string
    description: string
    messages: Message[]
    blacklist: UserProfile[]
    whitelist: UserProfile[]
    type: ChannelType
    constructor(
        id: number,
        name: string,
        description: string,
        messages: Message[] = [],
        blacklist: UserProfile[] = [],
        whitelist: UserProfile[] = [],
        type: ChannelType = ChannelType.SERVER
    ) {
        this.id = id
        this.name = name
        this.description = description
        this.messages = messages
        this.blacklist = blacklist
        this.whitelist = whitelist
        this.type = type
    }

    toSummary(): ChannelSummary {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            serverId: this.id,
        }
    }
}
