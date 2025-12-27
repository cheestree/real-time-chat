CREATE SCHEMA IF NOT EXISTS rtchat;

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE rtchat.users (
    internal_id SERIAL PRIMARY KEY,
    id UUID DEFAULT uuid_generate_v4 () UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_id ON rtchat.users (id);

CREATE INDEX idx_users_internal_id ON rtchat.users (internal_id);

CREATE INDEX idx_users_username ON rtchat.users (username);