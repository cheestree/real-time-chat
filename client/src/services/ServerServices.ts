import { Server } from '@/domain/Server'
import { Path } from '@/http/path'
import { del, get, post } from '@/http/requests'

class ServerServices {
    async listServers(): Promise<Server[]> {
        return await get(
            process.env.NEXT_PUBLIC_API_URL + Path.SERVERS, true
        ).then(async (response) => {
            if (response.ok) {
                const data = await response.json()
                return data.servers as Server[]
            } else {
                return []
            }
        })
    }
    async getServerDetails(serverId: number): Promise<Server | null> {
        return await get(
            process.env.NEXT_PUBLIC_API_URL + Path.SERVERS + `/${serverId}`, true
        ).then(async (response) => {
            if (response.ok) {
                const data = await response.json()
                return data.server as Server
            } else {
                return null
            }
        })
    }
    async createServer(
        serverName: string,
        description: string
    ): Promise<Server> {
        return await post(
            process.env.NEXT_PUBLIC_API_URL + Path.SERVERS,
            true,
            {
                name: serverName,
                description: description,
            }
        ).then(async (response) => {
            if (response.ok) {
                const data = await response.json()
                return data.server as Server
            } else {
                throw new Error('Failed to create server')
            }
        })
    }
    async joinServer(serverId: number): Promise<boolean> {
        return await post(
            process.env.NEXT_PUBLIC_API_URL +
                Path.SERVERS +
                `/${serverId}/join`,
            true,
            null
        ).then(async (response) => {
            return response.ok
        })
    }
    async deleteServer(serverId: number): Promise<boolean> {
        return await del(
            process.env.NEXT_PUBLIC_API_URL + Path.SERVERS + `/${serverId}`,
            true
        ).then(async (response) => {
            return response.ok
        })
    }
}

export const serverServices = new ServerServices()

