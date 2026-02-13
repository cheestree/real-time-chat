import { Channel } from './Channel'
import { UserProfile } from './UserProfile'

export class Server {
    id: string
    name: string
    description: string
    icon: string = ''
    ownerIds: number[] = []
    channels: Channel[] = []
    users: UserProfile[] = []

    constructor(
        id: string,
        serverName: string,
        description: string,
        ownerIds: number[] = [],
        icon: string = ''
    ) {
        this.id = id
        this.name = serverName
        this.description = description
        this.ownerIds = ownerIds
        this.icon = icon
    }
}
