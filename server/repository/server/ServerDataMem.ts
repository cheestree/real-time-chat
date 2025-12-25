import { Channel } from '../../domain/channel/Channel'
import { BadRequestError } from '../../domain/error/Error'
import { Message } from '../../domain/message/Message'
import { Server } from '../../domain/server/Server'
import { IServerRepository } from '../../repository/interfaces/IServerRepository'

class ServerDataMem implements IServerRepository {
    servers: Server[] = []

    async messageChannel(
        channelId: number,
        message: Message
    ): Promise<Message> {
        throw new Error('Method not implemented.')
        /*
        for (let i = 0; i < this.servers.length; i++) {
            const server = this.servers[i]
            if (server.id == serverId) {
                for (let j = 0; j < server.channels.length; j++) {
                    const channel = server.channels[j]
                    if (channel == channelId) {
                        channel.messages.push(message)
                        return message
                    }
                }
            }
        }
        throw new Error('Server or channel not found')
        */
    }

    async createServer(
        serverName: string,
        serverDescription: string,
        ownerId: number,
        icon: string
    ): Promise<Server> {
        const nServer = this.servers.length
        const server = new Server(
            nServer + 1,
            serverName,
            serverDescription,
            ownerId,
            icon
        )
        this.servers.push(server)
        return server
    }

    async getServerById(id: number): Promise<Server> {
        return this.servers.find((server) => server.id == id)!
    }

    async addUserToServer(serverId: number, userId: number): Promise<Server> {
        /*
        for (const srv of this.servers) {
            if (srv.id == serverId) {
                srv.users.push(user)
                return srv
            }
        }
        */
        throw new BadRequestError('Server not found')
    }

    async leaveServer(serverId: number, userId: number): Promise<boolean> {
        for (const srv of this.servers) {
            if (srv.id == serverId) {
                srv.users = srv.users.filter((u) => u != userId)
                return true
            }
        }
        throw new BadRequestError('Server not found')
    }

    async deleteServer(serverId: number, userId: number): Promise<boolean> {
        for (const srv of this.servers) {
            if (srv.id == serverId && srv.owner.some((o) => o == userId)) {
                const server = srv
                this.servers = this.servers.filter((s) => s.id != serverId)
                return true
            }
        }
        throw new BadRequestError('Server not found')
    }

    async channelExists(serverId: number, channelId: number): Promise<boolean> {
        const server = this.servers.find((s) => s.id == serverId)
        if (!server) return false
        for (const channel of server.channels) {
            if (channel === channelId) {
                return true
            }
        }
        return false
    }

    async createChannel(
        serverId: number,
        channelName: string,
        channelDescription: string
    ): Promise<Channel> {
        throw new Error('Method not implemented.')
        /*
        for (const server of this.servers) {
            if (server.id === serverId) {
                const nChannels = server.channels.length
                const channel = new Channel(
                    nChannels + 1,
                    channelName,
                    channelDescription
                )
                server.channels.push(channel)
                return channel
            }
        }
        throw new BadRequestError('Server not found')
        */
    }

    async serverExists(serverId: number): Promise<boolean> {
        for (const s of this.servers) {
            if (s.id == serverId) {
                return true
            }
        }
        return false
    }

    async getServerByName(name: string): Promise<Server> {
        for (const server of this.servers) {
            if (server.name == name) {
                return server
            }
        }
        throw new BadRequestError('Server not found')
    }

    async getUserServers(userId: number): Promise<Server[]> {
        return this.servers.filter((s) => s.users.some((u) => u == userId))
    }
}

export default ServerDataMem
