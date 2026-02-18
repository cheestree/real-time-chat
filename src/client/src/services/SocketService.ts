import {
    deleteServerSocketSchema,
    DeleteServerSocketSchema,
} from '@/types/services/socket.schema'
import {
    ChannelJoinSchema,
    ChannelLeaveSchema,
    DeleteServerSocketResponse,
    JoinChannelResponse,
    ChannelJoinInput as JoinChannelSchema,
    JoinServerSocketResponse,
    ServerJoinInput as JoinServerSchema,
    LeaveChannelResponse,
    ChannelLeaveInput as LeaveChannelSchema,
    LeaveServerResponse,
    ServerLeaveInput as LeaveServerSchema,
    MessageCreateSchema,
    MessageServerResponse,
    MessageCreateInput as MessageServerSchema,
    ServerJoinSchema,
    ServerLeaveSchema,
} from '@rtchat/shared'
import { io, Socket } from 'socket.io-client'

class SocketService {
    private socket: Socket | null = null
    private joinedChannelRooms: Set<string> = new Set()
    private joinedServerRooms: Set<string> = new Set()

    init(): void {
        if (!this.socket) {
            this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
                withCredentials: true,
            })
        }
    }

    getSocket(): Socket {
        if (!this.socket) {
            throw new Error('Socket not initialized. Call init() first.')
        }
        return this.socket
    }

    disconnect(): void {
        if (this.socket) {
            this.socket.disconnect()
        }
    }

    messageServer(data: MessageServerSchema): MessageServerResponse {
        try {
            MessageCreateSchema.parse(data)
            this.socket!.emit('messageServer', data)
            return {
                success: true,
                data: {
                    serverId: data.serverId,
                    channelId: data.channelId,
                    content: data.content,
                },
            }
        } catch (error) {
            console.error('Socket messageServer error:', error)
            return { success: false, error: 'Failed to send message' }
        }
    }

    leaveServer(data: LeaveServerSchema): LeaveServerResponse {
        try {
            ServerLeaveSchema.parse(data)
            this.socket!.emit('leaveServer', data)
            const room = `server_${data.serverId}`
            this.joinedServerRooms.delete(room)
            return { success: true, data: { id: data.serverId } }
        } catch (error) {
            console.error('Socket leaveServer error:', error)
            return { success: false, error: 'Failed to leave server' }
        }
    }

    deleteServer(data: DeleteServerSocketSchema): DeleteServerSocketResponse {
        try {
            deleteServerSocketSchema.parse(data)
            this.socket!.emit('deleteServer', data)
            return { success: true, data: { id: data.id } }
        } catch (error) {
            console.error('Socket deleteServer error:', error)
            return { success: false, error: 'Failed to delete server' }
        }
    }

    joinChannel(data: JoinChannelSchema): JoinChannelResponse {
        try {
            ChannelJoinSchema.parse(data)
            const room = `channel_${data.channelId}`
            if (this.joinedChannelRooms.has(room))
                return { success: false, error: 'Already joined' }
            this.socket!.emit('joinChannel', data)
            this.joinedChannelRooms.add(room)
            return { success: true, data: { channelId: data.channelId } }
        } catch (error) {
            console.error('Socket joinChannel error:', error)
            return { success: false, error: 'Failed to join channel' }
        }
    }

    leaveChannel(data: LeaveChannelSchema): LeaveChannelResponse {
        try {
            ChannelLeaveSchema.parse(data)
            const room = `channel_${data.channelId}`
            if (!this.joinedChannelRooms.has(room))
                return { success: false, error: 'Not joined' }
            this.socket!.emit('leaveChannel', data)
            this.joinedChannelRooms.delete(room)
            return { success: true, data: { channelId: data.channelId } }
        } catch (error) {
            console.error('Socket leaveChannel error:', error)
            return { success: false, error: 'Failed to leave channel' }
        }
    }

    joinServer(data: JoinServerSchema): JoinServerSocketResponse {
        try {
            ServerJoinSchema.parse(data)
            const room = `server_${data.serverId}`
            if (this.joinedServerRooms.has(room))
                return { success: false, error: 'Already joined' }
            this.socket!.emit('joinServer', data)
            this.joinedServerRooms.add(room)
            return { success: true, data: { serverId: data.serverId } }
        } catch (error) {
            console.error('Socket joinServer error:', error)
            return { success: false, error: 'Failed to join server' }
        }
    }

    getJoinedChannelRooms(): ReadonlySet<string> {
        return this.joinedChannelRooms
    }

    getJoinedServerRooms(): ReadonlySet<string> {
        return this.joinedServerRooms
    }

    on<T = unknown>(event: string, callback: (data: T) => void): void {
        this.socket!.on(event, callback)
    }

    off<T = unknown>(event: string, callback: (data: T) => void): void {
        this.socket!.off(event, callback)
    }
}

export const socketService = new SocketService()
