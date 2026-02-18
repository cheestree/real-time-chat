import { ApiResponse } from "./api.types";
import { ChannelSummary } from "./channel.types";
import { ServerDetail } from "./server.types";
import { AuthenticatedUser, UserSummary } from "./user.types";

// User API Responses
export type LoginResponse = ApiResponse<{
  token: string;
  user: AuthenticatedUser;
}>;

export type RegisterResponse = ApiResponse<{
  user: AuthenticatedUser;
}>;

export type AuthCheckResponse = {
  authenticated: true;
  user: AuthenticatedUser;
};

export type LogoutResponse = ApiResponse<null>;

// Server API Responses
export type ListServersResponse = ApiResponse<ServerDetail[]>;

export type GetServerDetailsResponse = ApiResponse<ServerDetail>;

export type CreateServerResponse = ApiResponse<ServerDetail>;

export type JoinServerResponse = ApiResponse<ServerDetail>;

export type CreateChannelResponse = ApiResponse<ChannelSummary>;

export type DeleteChannelResponse = ApiResponse<null>;

export type DeleteServerResponse = ApiResponse<null>;

export type GetPagedChannelsResponse = ApiResponse<ChannelSummary[]>;

export type GetServerUsersResponse = ApiResponse<UserSummary[]>;

// Message API Responses
export type GetPagedMessagesResponseData = {
  messages: any[]; // Will be typed as Message domain object on client
  nextPageState?: string;
  serverId: string;
  channelId: string;
  hasMore: boolean;
};

export type GetPagedMessagesResponse =
  ApiResponse<GetPagedMessagesResponseData>;

// Socket Responses
export type MessageServerResponse = ApiResponse<{
  serverId?: string | undefined;
  channelId: string;
  content: string;
}>;

export type JoinServerSocketResponse = ApiResponse<{
  serverId: string;
}>;

export type JoinChannelResponse = ApiResponse<{
  channelId: string;
}>;

export type LeaveServerResponse = ApiResponse<{
  id: string;
}>;

export type LeaveChannelResponse = ApiResponse<{
  channelId: string;
}>;

export type DeleteServerSocketResponse = ApiResponse<{
  id: string;
}>;

