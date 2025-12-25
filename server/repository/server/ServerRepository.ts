import { CustomChannel } from '../../domain/channel/Channel'
import { ServerRepositoryInterface } from '../../domain/interfaces/IServerRepository'
import { Message } from '../../domain/message/Message'
import { CustomServer } from '../../domain/server/Server'
import { User } from '../../domain/user/User'
import { UserProfile } from '../../domain/user/UserProfile'

class ServerRepository implements ServerRepositoryInterface {
    async addUserToServer(serverId: number, user: User): Promise<CustomServer> {
        return undefined
    }

    async channelExists(serverId: number, channelId: number): Promise<boolean> {
        return undefined
    }

    async createChannel(
        serverId: number,
        channelName: string,
        channelDescription: string
    ): Promise<CustomChannel> {
        return undefined
    }

    async createServer(
        serverName: string,
        serverDescription: string,
        owner: User,
        icon: string
    ): Promise<CustomServer> {
        return undefined
    }

    async messageChannel(
        serverId: number,
        channelId: number,
        message: Message
    ): Promise<Message> {
        return undefined
    }

    async serverExists(serverId: number): Promise<boolean> {
        return false
    }

    async getServerByName(name: string): Promise<CustomServer> {
        return undefined
    }

    async leaveServer(serverId: number, user: UserProfile): Promise<number> {
        return false
    }

    async deleteServer(
        serverId: number,
        user: UserProfile
    ): Promise<UserProfile[]> {
        return Promise.resolve([])
    }

    async getUserServers(user: UserProfile): Promise<CustomServer[]> {
        return Promise.resolve([])
    }
}

export default ServerRepository
