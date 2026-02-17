import { ApiResponse } from '@rtchat/shared'

export type MessageServerResponse = ApiResponse<{
    serverId?: string
    channelId: string
    content: string
}>

export type JoinServerResponse = ApiResponse<{
    serverId: string
}>

export type JoinChannelResponse = ApiResponse<{
    channelId: string
}>

export type LeaveServerResponse = ApiResponse<{
    id: string
}>

export type LeaveChannelResponse = ApiResponse<{
    channelId: string
}>

export type DeleteServerSocketResponse = ApiResponse<{
    id: string
}>
