import {
    ChannelSummary,
    DirectMessageCreateInput,
    MessageSummary,
} from '@rtchat/shared'
import { Server } from '../../domain/server/Server'
import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'
import { MessageCreateInput } from '../../http/model/input/message/MessageCreateInput'
import { ServerLeaveInput } from '../../http/model/input/server/ServerLeaveInput'

type UserLeft = {
    serverId: string
    profile: { id: string; username: string }
}

export interface InterServerEvents {
    ping: () => void
}

export interface SocketData {
    user: AuthenticatedUser
}

export interface ClientToServerEvents {
    messageServer: (data: MessageCreateInput) => void
    messageDM: (data: DirectMessageCreateInput) => void
    leaveServer: (data: ServerLeaveInput) => void
    disconnect: () => void
    joinChannel: (data: { channelId: string }) => void
    joinServer: (data: { serverId: string }) => void
    leaveChannel: (data: { channelId: string }) => void
    joinDM: (data: { recipientId: string }) => void
    leaveDM: (data: { recipientId: string }) => void
}

export interface ServerToClientEvents {
    serverCreated: (server: Server) => void
    userJoinedServer: (data: {
        serverId: string
        user: { id: string; username: string }
    }) => void
    channelCreated: (channel: ChannelSummary) => void
    channelDeleted: (data: { serverId: string; channelId: string }) => void
    messageSent: (
        message: MessageSummary & {
            serverId?: string
            channelId: string
        }
    ) => void
    dmSent: (
        message: MessageSummary & {
            recipientId: string
            senderId: string
        }
    ) => void
    dmNotification: (notification: {
        senderId: string
        senderUsername: string
        content: string
        timestamp: string
    }) => void
    messagesPaged: (data: {
        messages: MessageSummary[]
        nextPageState?: string
        channelId: string
    }) => void
    channelsPaged: (data: {
        channels: ChannelSummary[]
        serverId: string
    }) => void
    userLeftServer: (data: UserLeft) => void
    serverDeleted: (serverId: string) => void
    error: (error: SocketError) => void
}

export interface SocketError {
    message: string
}
