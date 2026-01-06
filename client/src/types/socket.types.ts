import { Channel } from '@/domain/Channel'
import { Server } from '@/domain/Server'
import { UserProfile } from '@/domain/UserProfile'

export interface SocketContextType {
    createServer: (
        serverName: string,
        serverDescription?: string,
        serverIcon?: string
    ) => void
    joinServer: (serverId: string) => void
    createChannel: (channelName: string, channelDescription: string) => void
    deleteChannel: (serverId: string, channelId: string) => void
    messageServer: (message: string) => void
    leaveServer: (serverId: string) => void
    deleteServer: (serverId: string) => void
    changeServer: (serverId: string) => void
    changeChannel: (channelId: string) => void
    getPagedChannels: (serverId: string, limit: number, offset: number) => void
    getPagedMessages: (
        serverId: string,
        channelId: string,
        limit: number,
        nextPageState?: string
    ) => void
    getServerUsers: (serverId: string) => void
    getUserById: (serverId: string, userId: string) => UserProfile | undefined
    currentServerId: string | null
    currentChannelId: string | null
    currentServer: Server | null
    currentChannel: Channel | null
    servers: Server[]
}
