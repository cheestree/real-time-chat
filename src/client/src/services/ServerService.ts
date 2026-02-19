import { Path } from '@/http/path'
import { get, post } from '@/http/requests'
import {
    ChannelCreateSchema,
    CreateChannelResponse,
    ChannelCreateInput as CreateChannelSchema,
    CreateServerResponse,
    ServerCreateInput as CreateServerSchema,
    DeleteChannelResponse,
    DeleteServerResponse,
    ServerDeleteInput as DeleteServerSchema,
    GetPagedChannelsResponse,
    GetServerDetailsResponse,
    GetServerUsersResponse,
    JoinServerResponse,
    ServerJoinInput as JoinServerSchema,
    ListServersResponse,
    ServerCreateSchema,
    ServerDeleteSchema,
    ServerJoinSchema,
} from '@rtchat/shared'

import {
    DeleteChannelSchema,
    GetPagedChannelsSchema,
    GetServerUsersSchema,
} from '@/types/services/server.schema'

class ServerService {
    async listServers(): Promise<ListServersResponse> {
        try {
            const response = await get(
                process.env.NEXT_PUBLIC_API_URL + Path.SERVERS,
                true
            )
            if (response.ok) {
                return await response.json()
            } else {
                return { success: false, error: 'Failed to fetch servers' }
            }
        } catch (error) {
            console.error('listServers error:', error)
            return { success: false, error: 'Failed to fetch servers' }
        }
    }

    async getServerDetails(
        serverId: string
    ): Promise<GetServerDetailsResponse> {
        try {
            const response = await get(
                process.env.NEXT_PUBLIC_API_URL + Path.SERVERS + `/${serverId}`,
                true
            )
            if (response.ok) {
                return await response.json()
            } else {
                return {
                    success: false,
                    error: 'Failed to fetch server details',
                }
            }
        } catch (error) {
            console.error('getServerDetails error:', error)
            return { success: false, error: 'Failed to fetch server details' }
        }
    }

    async createServer(
        data: CreateServerSchema
    ): Promise<CreateServerResponse> {
        try {
            ServerCreateSchema.parse(data)
            const response = await post(
                process.env.NEXT_PUBLIC_API_URL + Path.SERVERS,
                true,
                data
            )
            if (response.ok) {
                return await response.json()
            } else {
                return { success: false, error: 'Failed to create server' }
            }
        } catch (error) {
            console.error('createServer error:', error)
            return { success: false, error: 'Failed to create server' }
        }
    }

    async joinServer(data: JoinServerSchema): Promise<JoinServerResponse> {
        try {
            ServerJoinSchema.parse(data)
            const response = await post(
                process.env.NEXT_PUBLIC_API_URL + Path.SERVERS + '/join',
                true,
                data
            )
            if (response.ok) {
                return await response.json()
            } else {
                return { success: false, error: 'Failed to join server' }
            }
        } catch (error) {
            console.error('joinServer error:', error)
            return { success: false, error: 'Failed to join server' }
        }
    }

    async createChannel(
        data: CreateChannelSchema
    ): Promise<CreateChannelResponse> {
        try {
            ChannelCreateSchema.parse(data)
            const response = await post(
                process.env.NEXT_PUBLIC_API_URL + Path.CHANNELS,
                true,
                data
            )
            if (response.ok) {
                return await response.json()
            } else {
                return { success: false, error: 'Failed to create channel' }
            }
        } catch (error) {
            console.error('createChannel error:', error)
            return { success: false, error: 'Failed to create channel' }
        }
    }

    async deleteChannel(
        data: DeleteChannelSchema
    ): Promise<DeleteChannelResponse> {
        try {
            const response = await fetch(
                process.env.NEXT_PUBLIC_API_URL +
                    Path.CHANNELS +
                    `/${data.serverId}/${data.channelId}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            )
            if (response.ok) {
                return { success: true, data: null }
            } else {
                return { success: false, error: 'Failed to delete channel' }
            }
        } catch (error) {
            console.error('deleteChannel error:', error)
            return { success: false, error: 'Failed to delete channel' }
        }
    }

    async deleteServer(
        data: DeleteServerSchema
    ): Promise<DeleteServerResponse> {
        try {
            ServerDeleteSchema.parse(data)
            const response = await post(
                process.env.NEXT_PUBLIC_API_URL + Path.SERVERS + '/delete',
                true,
                data
            )
            if (response.ok) {
                return { success: true, data: null }
            } else {
                return { success: false, error: 'Failed to delete server' }
            }
        } catch (error) {
            console.error('deleteServer error:', error)
            return { success: false, error: 'Failed to delete server' }
        }
    }

    async getPagedChannels(
        data: GetPagedChannelsSchema
    ): Promise<GetPagedChannelsResponse> {
        try {
            const response = await get(
                process.env.NEXT_PUBLIC_API_URL +
                    Path.CHANNELS +
                    `/${data.serverId}?limit=${data.limit}&offset=${data.offset}`,
                true
            )
            if (response.ok) {
                return await response.json()
            } else {
                return { success: false, error: 'Failed to fetch channels' }
            }
        } catch (error) {
            console.error('getPagedChannels error:', error)
            return { success: false, error: 'Failed to fetch channels' }
        }
    }

    async getServerUsers(
        data: GetServerUsersSchema
    ): Promise<GetServerUsersResponse> {
        try {
            const response = await get(
                process.env.NEXT_PUBLIC_API_URL +
                    Path.SERVERS +
                    `/${data.serverId}/users`,
                true
            )
            if (response.ok) {
                return await response.json()
            } else {
                return { success: false, error: 'Failed to fetch server users' }
            }
        } catch (error) {
            console.error('getServerUsers error:', error)
            return { success: false, error: 'Failed to fetch server users' }
        }
    }
}

export const serverService = new ServerService()
