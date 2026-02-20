import { ServerSummary } from '@rtchat/shared'

export class Server {
    id: string
    name: string
    channels: string[]
    users: number[]
    owners: string[]
    description: string
    memberCount: number
    icon: string = ''
    constructor(
        id: string,
        serverName: string,
        description: string,
        ownerIds: string[],
        icon: string,
        channelIds: string[] = [],
        userIds: number[] = []
    ) {
        this.id = id
        this.name = serverName
        this.owners = ownerIds
        this.channels = channelIds
        this.users = userIds
        this.description = description
        this.memberCount = this.users.length
        if (icon) this.icon = icon
    }

    toSummary(): ServerSummary {
        return {
            id: this.id,
            name: this.name,
            icon: this.icon,
            memberCount: this.users.length,
        }
    }
}
