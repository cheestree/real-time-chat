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