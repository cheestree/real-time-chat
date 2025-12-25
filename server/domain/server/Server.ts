export class Server {
    id: number
    name: string
    owner: number[]
    channels: number[]
    users: number[]
    icon: string = ''
    description: string
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
        if (icon) this.icon = icon
    }
}
