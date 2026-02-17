import { UUID } from 'bson'
import { Channel, ChannelType } from '../../domain/channel/Channel'
import { Server } from '../../domain/server/Server'
import { ServerDetail } from '../../http/model/output/server/ServerDetail'

export interface IServerRepository {
    getUserServers(userId: number): Promise<ServerDetail[]>
    userExists(userId: UUID): Promise<boolean>
    getServerById(serverId: string): Promise<Server | undefined>
    createServer(
        name: string,
        userId: number,
        description?: string,
        icon?: string
    ): Promise<Server>
    createChannel(
        serverId: string,
        channelName: string,
        channelDescription: string,
        type?: ChannelType
    ): Promise<Channel>
    getServerByName(serverName: string): Promise<Server | undefined>
    serverExists(serverId: string): Promise<boolean>
    channelExists(serverId: string, channelId: string): Promise<boolean>
    addUserToServer(serverId: string, userId: number): Promise<Server>
    leaveServer(serverId: string, userId: number): Promise<boolean>
    deleteServer(serverId: string, userId: number): Promise<boolean>
    deleteChannel(serverId: string, channelId: string): Promise<boolean>
    isServerOwner(serverId: string, userId: number): Promise<boolean>
    containsUser(serverId: string, userId: number): Promise<boolean>
    getChannelIdsByServerId(serverId: string): Promise<string[]>
    getUserIdsByServerId(serverId: string): Promise<number[]>
    getPagedChannels(
        serverId: string,
        limit: number,
        offset: number
    ): Promise<Channel[]>
}
