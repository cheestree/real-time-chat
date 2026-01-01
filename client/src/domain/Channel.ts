import { Message } from './Message'
import { UserProfile } from './UserProfile'

export class Channel {
    id: number = -1
    name: string
    description: string
    messages: Message[]
    blacklist: UserProfile[]
    whitelist: UserProfile[]
    constructor(channelName: string, description: string) {
        this.name = channelName
        this.description = description
        this.messages = []
        this.blacklist = []
        this.whitelist = []
    }
}
