import * as Cassandra from 'cassandra-driver'
import { MongoClient } from 'mongodb'
import { Pool } from 'pg'
import { createClient, RedisClientType } from 'redis'

let mongoClient: MongoClient | null = null
let cassandraClient: Cassandra.Client | null = null
let pgPool: Pool | null = null
let redisClient: RedisClientType | null = null

export function getMongoClient(): MongoClient {
    if (!mongoClient) {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is not set')
        }
        mongoClient = new MongoClient(process.env.MONGODB_URI)
    }
    return mongoClient
}

export function getCassandraClient(): Cassandra.Client {
    if (!cassandraClient) {
        const contactPoints = process.env.CASSANDRA_CONTACT_POINTS
        const localDataCenter = process.env.CASSANDRA_LOCAL_DATACENTER
        const keyspace = process.env.CASSANDRA_KEYSPACE

        if (!contactPoints || !localDataCenter || !keyspace) {
            throw new Error('Missing required Cassandra environment variables')
        }

        cassandraClient = new Cassandra.Client({
            contactPoints: contactPoints.split(',').map((cp) => cp.trim()),
            localDataCenter: localDataCenter,
            keyspace: keyspace,
        })
    }
    return cassandraClient
}

export function getPostgresPool(): Pool {
    if (!pgPool) {
        pgPool = new Pool({
            user: process.env.POSTGRES_USER,
            host: process.env.POSTGRES_HOST,
            database: process.env.POSTGRES_DB,
            password: process.env.POSTGRES_PASSWORD,
            port: process.env.POSTGRES_PORT
                ? parseInt(process.env.POSTGRES_PORT)
                : 5432,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        })

        // Handle pool errors
        pgPool.on('error', (err) => {
            console.error('Unexpected error on idle PostgreSQL client', err)
        })
    }
    return pgPool
}

export async function closeMongoClient(): Promise<void> {
    if (mongoClient) {
        await mongoClient.close()
        mongoClient = null
    }
}

export async function closeCassandraClient(): Promise<void> {
    if (cassandraClient) {
        await cassandraClient.shutdown()
        cassandraClient = null
    }
}

export async function closePostgresPool(): Promise<void> {
    if (pgPool) {
        await pgPool.end()
        pgPool = null
    }
}

export async function getRedisClient(): Promise<RedisClientType> {
    if (!redisClient) {
        redisClient = createClient({
            socket: {
                host: process.env.REDIS_HOST || 'localhost',
                port: parseInt(process.env.REDIS_PORT || '6379'),
            },
            password: process.env.REDIS_PASSWORD,
        })

        redisClient.on('error', (err) => {
            console.error('Redis Client Error:', err)
        })

        await redisClient.connect()
    }
    return redisClient
}

export async function closeRedisClient(): Promise<void> {
    if (redisClient) {
        await redisClient.quit()
        redisClient = null
    }
}

export function createMongoClient(): MongoClient {
    return getMongoClient()
}

export function createCassandraClient(): Cassandra.Client {
    return getCassandraClient()
}
