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

    messageServer(
        serverId: string | undefined,
        channelId: string,
        content: string
    ): void {
        this.socket!.emit('messageServer', {
            serverId,
            channelId,
            content,
        })
    }

    leaveServer(serverId: string): void {
        this.socket!.emit('leaveServer', { id: serverId })
        const room = `server_${serverId}`
        this.joinedServerRooms.delete(room)
    }

    deleteServer(serverId: string): void {
        this.socket!.emit('deleteServer', { id: serverId })
    }

    joinChannel(channelId: string): void {
        const room = `channel_${channelId}`
        if (this.joinedChannelRooms.has(room)) return
        this.socket!.emit('joinChannel', { channelId })
        this.joinedChannelRooms.add(room)
    }

    leaveChannel(channelId: string): void {
        const room = `channel_${channelId}`
        if (!this.joinedChannelRooms.has(room)) return
        this.socket!.emit('leaveChannel', { channelId })
        this.joinedChannelRooms.delete(room)
    }

    joinServer(serverId: string): void {
        const room = `server_${serverId}`
        if (this.joinedServerRooms.has(room)) return
        this.socket!.emit('joinServer', { serverId })
        this.joinedServerRooms.add(room)
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
