import { CustomChannel } from '../../domain/CustomChannel'
import { CustomServer } from '../../domain/CustomServer'
import { Message } from '../../domain/Message'
import { UserProfile } from '../../domain/user/UserProfile'

export interface ServerRepositoryInterface {
    getUserServers(user: UserProfile): Promise<CustomServer[]>
    createServer(
        serverName: string,
        serverDescription: string,
        user: UserProfile,
        icon: string
    ): Promise<CustomServer>
    createChannel(
        serverId: number,
        channelName: string,
        channelDescription: string
    ): Promise<CustomChannel>
    getServerByName(name: string): Promise<CustomServer>
    serverExists(serverId: number): Promise<boolean>
    channelExists(serverId: number, channelId: number): Promise<boolean>
    messageChannel(
        serverId: number,
        channelId: number,
        message: Message
    ): Promise<Message>
    addUserToServer(serverId: number, user: UserProfile): Promise<CustomServer>
    leaveServer(serverId: number, user: UserProfile): Promise<number>
    deleteServer(serverId: number, user: UserProfile): Promise<UserProfile[]>
}
