import { io, Socket } from 'socket.io-client'

class SocketService {
    private readonly socket: Socket

    constructor() {
        this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
            withCredentials: true,
        })
    }

    getSocket(): Socket {
        return this.socket
    }

    getUserServers(): void {
        this.socket.emit('userServers')
    }

    joinServer(serverId: number): void {
        this.socket.emit('joinServer', { serverId })
    }

    createServer(serverName: string, serverDescription: string, serverIcon: string): void {
        this.socket.emit('createServer', { serverName, serverDescription, serverIcon })
    }

    createChannel(serverId: number, channelName: string, channelDescription: string): void {
        this.socket.emit('createChannel', {
            serverId,
            channelName,
            channelDescription,
        })
    }

    messageServer(serverId: number, channelId: number, message: string): void {
        this.socket.emit('messageServer', {
            serverId,
            channelId,
            message,
        })
    }

    leaveServer(serverId: number): void {
        this.socket.emit('leaveServer', { serverId })
    }

    deleteServer(serverId: number): void {
        this.socket.emit('deleteServer', { serverId })
    }

    on<T = unknown>(event: string, callback: (data: T) => void): void {
        this.socket.on(event, callback)
    }

    off<T = unknown>(event: string, callback: (data: T) => void): void {
        this.socket.off(event, callback)
    }
}

export const socketService = new SocketService()

