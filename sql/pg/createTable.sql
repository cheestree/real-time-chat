CREATE SCHEMA IF NOT EXISTS rtchat;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS rtchat.users (
    internal_id BIGSERIAL PRIMARY KEY,
    id UUID DEFAULT gen_random_uuid() UNIQUE NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_users_id ON rtchat.users (id);
CREATE INDEX idx_users_internal_id ON rtchat.users (internal_id);
CREATE INDEX idx_users_username ON rtchat.users (username);

CREATE TABLE IF NOT EXISTS rtchat.server_members (
    server_id UUID NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) DEFAULT 'MEMBER' NOT NULL,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    PRIMARY KEY (server_id, user_id),
    FOREIGN KEY (user_id) REFERENCES rtchat.users(internal_id) ON DELETE CASCADE
);

CREATE INDEX idx_server_members_server_id ON rtchat.server_members (server_id);
CREATE INDEX idx_server_members_user_id ON rtchat.server_members (user_id);