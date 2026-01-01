import { Server } from '@/domain/Server'

export interface SocketContextType {
    createServer: (
        serverName: string,
        serverDescription: string,
        serverIcon: string
    ) => void
    joinServer: (serverId: number) => void
    createChannel: (channelName: string, channelDescription: string) => void
    messageServer: (message: string) => void
    leaveServer: (serverId: number) => void
    deleteServer: (serverId: number) => void
    changeServer: (serverId: number) => void
    changeChannel: (channelId: number) => void
    currentServer: number
    currentChannel: number
    servers: Server[]
}

