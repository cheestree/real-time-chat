import { Channel } from './Channel'
import { UserProfile } from './UserProfile'

export class Server {
    id: number = -1
    name: string
    owner: UserProfile[]
    channels: Channel[]
    users: UserProfile[]
    icon: string = ''
    description: string
    constructor(
        serverName: string,
        description: string,
        owner: UserProfile,
        icon: string
    ) {
        this.name = serverName
        this.owner = [owner]
        this.channels = [new Channel('general', 'First channel')]
        this.users = [owner]
        this.description = description
        if (icon) this.icon = icon
    }
}
