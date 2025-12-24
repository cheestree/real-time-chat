import { CustomChannel } from './CustomChannel'
import { UserProfile } from './UserProfile'

export class CustomServer {
    id: number = -1
    name: string
    owner: UserProfile[]
    channels: CustomChannel[]
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
        this.channels = [new CustomChannel('general', 'First channel')]
        this.users = [owner]
        this.description = description
        if (icon) this.icon = icon
    }
}
