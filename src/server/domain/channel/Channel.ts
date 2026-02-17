import { ChannelSummary } from '@rtchat/shared'

export enum ChannelType {
    SERVER = 'SERVER',
    DM = 'DM',
}

export class Channel {
    id: string
    serverId: string
    name: string
    description: string
    blacklist: string[]
    whitelist: string[]
    type: ChannelType
    constructor(
        id: string,
        serverId: string,
        name: string,
        description: string,
        blacklist: string[] = [],
        whitelist: string[] = [],
        type: ChannelType = ChannelType.SERVER
    ) {
        this.id = id
        this.serverId = serverId
        this.name = name
        this.description = description || ''
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
