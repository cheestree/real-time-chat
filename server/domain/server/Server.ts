import { ServerSummary } from '../../http/model/output/server/ServerSummary'

export class Server {
    id: string
    name: string
    owner: number[]
    channels: string[]
    users: number[]
    owners: number[]
    description: string
    memberCount: number
    icon: string = ''
    constructor(
        id: string,
        serverName: string,
        description: string,
        ownerId: number | number[],
        icon: string,
        channelIds: string[] = [],
        userIds: number[] = []
    ) {
        this.id = id
        this.name = serverName
        this.owner = Array.isArray(ownerId) ? ownerId : [ownerId]
        this.channels = channelIds
        this.users = userIds.length > 0 ? userIds : [this.owner[0]]
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
