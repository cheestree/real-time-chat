import { CustomChannel } from './CustomChannel'
import { UserProfile } from './user/UserProfile'

let serialServer = 0

function setAndIncrementServerID() {
    serialServer += 1
    return serialServer
}

export class CustomServer {
    id: number = setAndIncrementServerID()
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
