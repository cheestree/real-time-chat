import { Channel } from '../../domain/channel/Channel'
import { Message } from '../../domain/message/Message'
import { Server } from '../../domain/server/Server'

export interface IServerRepository {
    getUserServers(userId: number): Promise<Server[]>
    createServer(
        serverName: string,
        serverDescription: string,
        userId: number,
        icon: string
    ): Promise<Server>
    createChannel(
        serverId: number,
        channelName: string,
        channelDescription: string
    ): Promise<Channel>
    getServerByName(serverName: string): Promise<Server | undefined>
    serverExists(serverId: number): Promise<boolean>
    channelExists(serverId: number, channelId: number): Promise<boolean>
    messageChannel(
        serverId: number,
        channelId: number,
        message: Message
    ): Promise<Message>
    addUserToServer(serverId: number, userId: number): Promise<Server>
    leaveServer(serverId: number, userId: number): Promise<boolean>
    deleteServer(serverId: number, userId: number): Promise<boolean>
}
