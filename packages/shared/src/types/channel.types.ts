export enum ChannelType {
  SERVER = "SERVER",
  DM = "DM",
}

// Channel-related types
export type ChannelSummary = {
  id: string;
  serverId: string;
  name: string;
  description: string;
  messageCount?: number;
  lastMessageId?: string;
  lastMessageTimestamp?: string;
};

export type ChannelDetail = ChannelSummary & {
  messages?: MessageSummary[];
};

// Message-related types
export type MessageSummary = {
  id: string;
  authorId: string;
  authorUsername: string;
  authorIcon?: string;
  content: string;
  timestamp: string;
};

export type MessageDetail = {
  id: string;
  type: ChannelType;
  serverId?: string;
  channelId: string;
  authorId: string;
  authorUsername: string;
  authorIcon?: string;
  content: string;
  timestamp: string;
};

