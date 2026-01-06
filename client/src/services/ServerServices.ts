import { Channel } from '@/domain/Channel'
import { Server } from '@/domain/Server'
import { UserProfile } from '@/domain/UserProfile'
import { Path } from '@/http/path'
import { get, post } from '@/http/requests'

class ServerServices {
    async listServers(): Promise<Server[]> {
        return await get(
            process.env.NEXT_PUBLIC_API_URL + Path.SERVERS,
            true
        ).then(async (response) => {
            if (response.ok) {
                const serverData = await response.json()
                return serverData.map(
                    (s: any) =>
                        new Server(
                            s.id,
                            s.name,
                            s.description,
                            s.owner,
                            s.channels,
                            s.users,
                            s.icon
                        )
                )
            } else {
                return []
            }
        })
    }

    async getServerDetails(serverId: string): Promise<Server | null> {
        return await get(
            process.env.NEXT_PUBLIC_API_URL + Path.SERVERS + `/${serverId}`,
            true
        ).then(async (response) => {
            if (response.ok) {
                return (await response.json()) as Server
            } else {
                return null
            }
        })
    }

    async createServer(
        serverName: string,
        description: string = '',
        icon: string = ''
    ): Promise<Server> {
        return await post(
            process.env.NEXT_PUBLIC_API_URL + Path.SERVERS,
            true,
            {
                name: serverName,
                description: description,
                icon: icon,
            }
        ).then(async (response) => {
            if (response.ok) {
                return (await response.json()) as Server
            } else {
                throw new Error('Failed to create server')
            }
        })
    }

    async joinServer(serverId: string): Promise<Server> {
        return await post(
            process.env.NEXT_PUBLIC_API_URL + Path.SERVERS + '/join',
            true,
            { serverId: serverId }
        ).then(async (response) => {
            if (response.ok) {
                return (await response.json()) as Server
            } else {
                throw new Error('Failed to join server')
            }
        })
    }

    async createChannel(
        serverId: string,
        name: string,
        description: string = ''
    ): Promise<Channel> {
        return await post(
            process.env.NEXT_PUBLIC_API_URL + Path.CHANNELS,
            true,
            {
                serverId,
                name,
                description,
            }
        ).then(async (response) => {
            if (response.ok) {
                return (await response.json()) as Channel
            } else {
                throw new Error('Failed to create channel')
            }
        })
    }

    async deleteChannel(serverId: string, channelId: string): Promise<void> {
        await fetch(
            process.env.NEXT_PUBLIC_API_URL +
                Path.CHANNELS +
                `/${serverId}/${channelId}`,
            {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        ).then((response) => {
            if (!response.ok) {
                throw new Error('Failed to delete channel')
            }
        })
    }

    async deleteServer(serverId: string): Promise<void> {
        return await post(
            process.env.NEXT_PUBLIC_API_URL + Path.SERVERS + '/delete',
            true,
            { id: serverId }
        ).then(async (response) => {
            if (!response.ok) {
                throw new Error('Failed to delete server')
            }
        })
    }

    async getPagedChannels(
        serverId: string,
        limit: number,
        offset: number
    ): Promise<Channel[]> {
        return await get(
            process.env.NEXT_PUBLIC_API_URL +
                Path.CHANNELS +
                `/${serverId}?limit=${limit}&offset=${offset}`,
            true
        ).then(async (response) => {
            if (response.ok) {
                return (await response.json()) as Channel[]
            } else {
                return []
            }
        })
    }

    async getServerUsers(serverId: string): Promise<UserProfile[]> {
        return await get(
            process.env.NEXT_PUBLIC_API_URL +
                Path.SERVERS +
                `/${serverId}/users`,
            true
        ).then(async (response) => {
            if (response.ok) {
                const userSummaries = (await response.json()) as UserProfile[]
                const users: UserProfile[] = userSummaries.map((u) => ({
                    id: u.id,
                    username: u.username,
                }))
                return users
            } else {
                return []
            }
        })
    }
}

export const serverServices = new ServerServices()
