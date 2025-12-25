import { Channel } from '../channel/Channel'
import { Message } from '../message/Message'
import { Server } from '../server/Server'
import { UserProfile } from '../user/UserProfile'

export interface ServerRepositoryInterface {
    getUserServers(user: UserProfile): Promise<Server[]>
    createServer(
        serverName: string,
        serverDescription: string,
        user: UserProfile,
        icon: string
    ): Promise<Server>
    createChannel(
        serverId: number,
        channelName: string,
        channelDescription: string
    ): Promise<Channel>
    getServerByName(name: string): Promise<Server>
    serverExists(serverId: number): Promise<boolean>
    channelExists(serverId: number, channelId: number): Promise<boolean>
    messageChannel(
        serverId: number,
        channelId: number,
        message: Message
    ): Promise<Message>
    addUserToServer(serverId: number, user: UserProfile): Promise<Server>
    leaveServer(serverId: number, user: UserProfile): Promise<number>
    deleteServer(serverId: number, user: UserProfile): Promise<UserProfile[]>
}
