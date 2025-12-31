import { Server } from '../../domain/server/Server'
import { UserProfile } from '../../domain/user/UserProfile'
import { ChannelCreateInput } from '../../http/model/input/channel/ChannelCreateInput'
import { MessageCreateInput } from '../../http/model/input/message/MessageCreateInput'
import { ServerCreateInput } from '../../http/model/input/server/ServerCreateInput'
import { ServerDeleteInput } from '../../http/model/input/server/ServerDeleteInput'
import { ServerLeaveInput } from '../../http/model/input/server/ServerLeaveInput'
import { ChannelSummary } from '../../http/model/output/server/ChannelSummary'
import { MessageSummary } from '../../http/model/output/server/MessageSummary'

export interface ClientToServerEvents {
    createServer: (data: ServerCreateInput) => void
    createChannel: (data: ChannelCreateInput) => void
    messageServer: (data: MessageCreateInput) => void
    leaveServer: (data: ServerLeaveInput) => void
    deleteServer: (data: ServerDeleteInput) => void
    disconnect: () => void
}

export interface ServerToClientEvents {
    serverCreated: (server: Server) => void
    userJoinedServer: (data: { serverId: number; user: UserProfile }) => void
    channelCreated: (channel: ChannelSummary) => void
    messageSent: (message: MessageSummary) => void
    userLeftServer: (data: { serverId: number; userId: string }) => void
    serverDeleted: (serverId: number) => void
    error: (error: SocketError) => void
}

export interface SocketError {
    message: string
}
