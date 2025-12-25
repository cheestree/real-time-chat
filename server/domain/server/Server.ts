import { Channel } from '../channel/Channel'
import { UserProfile } from '../user/UserProfile'

export class Server {
    id: number
    name: string
    owner: UserProfile[]
    channels: Channel[]
    users: UserProfile[]
    icon: string = ''
    description: string
    constructor(
        id: number,
        serverName: string,
        description: string,
        owner: UserProfile,
        icon: string
    ) {
        this.id = id
        this.name = serverName
        this.owner = [owner]
        this.channels = [new Channel(0, 'general', 'First channel')]
        this.users = [owner]
        this.description = description
        if (icon) this.icon = icon
    }
}
