import { Message } from '../message/Message'
import { UserProfile } from '../user/UserProfile'

export class Channel {
    id: number
    name: string
    description: string
    messages: Message[]
    blacklist: UserProfile[]
    whitelist: UserProfile[]
    constructor(id: number, channelName: string, description: string) {
        this.id = id
        this.name = channelName
        this.description = description
        this.messages = []
        this.blacklist = []
        this.whitelist = []
    }
}
