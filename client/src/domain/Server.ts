import { Channel } from './Channel'
import { UserProfile } from './UserProfile'

export class Server {
    id: string
    name: string
    description: string
    icon: string = ''
    ownerIds: string[] = []
    channelIds: string[] = []
    userIds: string[] = []
    // Populated from separate calls or socket events
    channels: Channel[] = []
    users: UserProfile[] = []

    constructor(
        id: string,
        serverName: string,
        description: string,
        ownerIds: string[] = [],
        channelIds: string[] = [],
        userIds: string[] = [],
        icon: string = ''
    ) {
        this.id = id
        this.name = serverName
        this.description = description
        this.ownerIds = ownerIds
        this.channelIds = channelIds
        this.userIds = userIds
        this.icon = icon
    }
}
