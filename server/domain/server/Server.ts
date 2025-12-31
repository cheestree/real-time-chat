import { ServerSummary } from '../../http/model/output/server/ServerSummary'

export class Server {
    id: number
    name: string
    owner: number[]
    channels: number[]
    users: number[]
    owners: number[]
    description: string
    memberCount: number
    icon: string = ''
    constructor(
        id: number,
        serverName: string,
        description: string,
        ownerId: number,
        icon: string,
        channelIds: number[] = []
    ) {
        this.id = id
        this.name = serverName
        this.owner = [ownerId]
        this.channels = channelIds.length > 0 ? channelIds : []
        this.users = [ownerId]
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
