import { ChannelDetail } from "./channel.types";
import { UserSummary } from "./user.types";

// Server-related types
export type ServerSummary = {
  id: string;
  name: string;
  icon?: string;
  memberCount: number;
};

export type ServerDetail = {
  id: string;
  name: string;
  description: string;
  icon: string;
  ownerIds: string[];
  channels: ChannelDetail[];
  users: UserSummary[];
};

