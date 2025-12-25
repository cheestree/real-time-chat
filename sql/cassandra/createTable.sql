CREATE KEYSPACE rtchat WITH replication = {'class': 'SimpleStrategy', 'replication_factor' : 3};

CREATE TABLE rtchat.messages (
    channel_id UUID,
    id UUID,
    username TEXT,
    message TEXT,
    created_at TIMESTAMP,
    PRIMARY KEY (channel_id, created_at, id)
);