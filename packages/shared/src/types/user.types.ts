// User-related types
export type UserSummary = {
  id: string;
  username: string;
  icon?: string;
};

export type AuthenticatedUser = {
  internalId: number;
  publicId: string;
  profile: {
    id: string;
    username: string;
  };
};

export type LoginResult = {
  token: string;
  user: AuthenticatedUser;
};

