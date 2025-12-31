import { UUID } from 'bson'
import { Channel, ChannelType } from '../../domain/channel/Channel'
import { Server } from '../../domain/server/Server'

export interface IServerRepository {
    getUserServers(userId: number): Promise<Server[]>
    userExists(userId: UUID): Promise<boolean>
    getServerById(serverId: number): Promise<Server | undefined>
    createServer(
        name: string,
        userId: number,
        description?: string,
        icon?: string
    ): Promise<Server>
    createChannel(
        serverId: number,
        channelName: string,
        channelDescription: string,
        type?: ChannelType
    ): Promise<Channel>
    getServerByName(serverName: string): Promise<Server | undefined>
    serverExists(serverId: number): Promise<boolean>
    channelExists(serverId: number, channelId: number): Promise<boolean>
    addUserToServer(serverId: number, userId: number): Promise<Server>
    leaveServer(serverId: number, userId: number): Promise<boolean>
    deleteServer(serverId: number, userId: number): Promise<boolean>
    isServerOwner(serverId: number, userId: number): Promise<boolean>
    containsUser(serverId: number, userId: number): Promise<boolean>
    getChannelIdsByServerId(serverId: number): Promise<number[]>
    getUserIdsByServerId(serverId: number): Promise<number[]>
}
