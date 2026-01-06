import * as Cassandra from 'cassandra-driver'
import { MongoClient } from 'mongodb'

export function createMongoClient(): MongoClient {
    if (!process.env.MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set')
    }
    return new MongoClient(process.env.MONGODB_URI)
}

export function createCassandraClient(): Cassandra.Client {
    const contactPoints = process.env.CASSANDRA_CONTACT_POINTS
    const localDataCenter = process.env.CASSANDRA_LOCAL_DATACENTER
    const keyspace = process.env.CASSANDRA_KEYSPACE

    if (!contactPoints || !localDataCenter || !keyspace) {
        throw new Error('Missing required Cassandra environment variables')
    }

    return new Cassandra.Client({
        contactPoints: contactPoints.split(',').map((cp) => cp.trim()),
        localDataCenter: localDataCenter,
        keyspace: keyspace,
    })
}
