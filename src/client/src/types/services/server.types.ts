import { UserProfile } from '@/domain/UserProfile'

import {
    ApiResponse,
    ChannelSummary,
    ServerDetail,
} from '@rtchat/shared'

export type ListServersResponse = ApiResponse<ServerDetail[]>

export type GetServerDetailsResponse = ApiResponse<ServerDetail>

export type CreateServerResponse = ApiResponse<ServerDetail>

export type JoinServerResponse = ApiResponse<ServerDetail>

export type CreateChannelResponse = ApiResponse<ChannelSummary>

export type DeleteChannelResponse = ApiResponse<null>

export type DeleteServerResponse = ApiResponse<null>

export type GetPagedChannelsResponse = ApiResponse<ChannelSummary[]>

export type GetServerUsersResponse = ApiResponse<UserProfile[]>
