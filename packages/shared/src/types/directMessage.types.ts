import { MessageSummary } from "./channel.types";

// Direct Message Conversation types
export type ConversationSummary = {
  id: string; // This will be the other user's UUID
  otherUserId: string;
  otherUsername: string;
  otherUserIcon?: string;
  lastMessage?: MessageSummary;
  lastMessageTimestamp?: string;
  unreadCount?: number;
};

export type ConversationDetail = ConversationSummary & {
  messages?: MessageSummary[];
};
