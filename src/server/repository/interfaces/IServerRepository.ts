import { ServerDetail } from '@rtchat/shared'
import { UUID } from 'bson'
import { Channel, ChannelType } from '../../domain/channel/Channel'
import { Server } from '../../domain/server/Server'

export interface IServerRepository {
    getUserServers(userPublicId: string): Promise<ServerDetail[]>
    userExists(userId: UUID): Promise<boolean>
    getServerById(serverId: string): Promise<Server | undefined>
    createServer(
        name: string,
        userId: number,
        userPublicId: string,
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
    addUserToServer(
        serverId: string,
        userPublicId: string,
        userInternalId: number
    ): Promise<Server>
    leaveServer(
        serverId: string,
        userPublicId: string,
        userInternalId: number
    ): Promise<boolean>
    deleteServer(serverId: string, userId: number): Promise<boolean>
    deleteChannel(serverId: string, channelId: string): Promise<boolean>
    isServerOwner(serverId: string, userPublicId: string): Promise<boolean>
    containsUser(serverId: string, userPublicId: string): Promise<boolean>
    getChannelIdsByServerId(serverId: string): Promise<string[]>
    getUserIdsByServerId(serverId: string): Promise<string[]>
    getPagedChannels(
        serverId: string,
        limit: number,
        offset: number
    ): Promise<Channel[]>
}
