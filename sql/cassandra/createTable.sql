CREATE KEYSPACE rtchat WITH replication = {'class': 'SimpleStrategy', 'replication_factor' : 3};

CREATE TABLE rtchat.messages (
    channel_id UUID,
    id UUID,
    sender_id BIGINT,
    content TEXT,
    created_at TIMESTAMP,
    PRIMARY KEY (channel_id, created_at, id)
);