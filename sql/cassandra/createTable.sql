CREATE KEYSPACE rtchat WITH replication = {'class': 'SimpleStrategy', 'replication_factor' : 3};

CREATE TABLE rtchat.messages (
    channel_id UUID,
    id UUID,
    author_id UUID,
    author_username TEXT,
    author_icon TEXT,
    content TEXT,
    created_at TIMESTAMP,
    PRIMARY KEY (channel_id, created_at, id)
);