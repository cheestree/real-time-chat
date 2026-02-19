import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import rateLimit from 'express-rate-limit'
import session from 'express-session'
import helmet from 'helmet'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import {
    ClientToServerEvents,
    InterServerEvents,
    ServerToClientEvents,
    SocketData,
} from './controller/ws/events'
import './env'

interface SocketRequest extends express.Request {
    io: Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >
}

import { RedisStore } from 'connect-redis'
import SocketHandlers from './controller/ws/SocketHandlers'
import ErrorHandler from './http/middleware/ErrorHandler'
import { getRedisClient } from './repository/utils/databaseClients'
import { directMessageRoutes } from './routes/DirectMessageRoutes'
import { messageRoutes } from './routes/MessageRoutes'
import { serverRoutes } from './routes/ServerRoutes'
import { userRoutes } from './routes/UserRoutes'
import { getCookie } from './utils/cookieParser'
import { envCheck } from './utils/envCheck'
import { logger } from './utils/logger'

envCheck()

const app = express()
const httpServer = createServer(app)

;(async () => {
    // Initialize Redis client for sessions
    const redisClient = await getRedisClient()
    const redisStore = new RedisStore({
        client: redisClient,
    })

    const sessionMiddleware = session({
        store: redisStore,
        secret: process.env.JWT_SECRET!,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.SERVER_PROFILE === 'prod',
            httpOnly: true,
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        },
    })

    const config = {
        maxHttpBufferSize: 3e8,
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
        },
    }

    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
    })

    const io = new Server<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData
    >(httpServer, config)

    io.engine.use(sessionMiddleware)

    io.use(async (socket, next) => {
        const cookies = socket.request.headers.cookie
        let authenticated = false

        const token = getCookie(cookies, 'token')
        if (token) {
            const user = await userRoutes.userServices.checkAuth(token)
            if (user) {
                socket.data.user = user
                authenticated = true
            }
        }

        if (!authenticated) {
            return next(new Error('Authentication error'))
        }
        next()
    })

    // Handle socket connections and register handlers
    const onConnection = (
        socket: Socket<
            ClientToServerEvents,
            ServerToClientEvents,
            InterServerEvents,
            SocketData
        >
    ) => {
        SocketHandlers(
            io,
            socket,
            userRoutes.userServices,
            serverRoutes.serverServices,
            messageRoutes.messageServices,
            directMessageRoutes.dmServices
        )
    }

    io.on('connection', onConnection)

    // Security and performance middleware
    app.use(helmet())
    app.use(compression())
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
            credentials: true,
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
        })
    )

    app.use(sessionMiddleware)
    app.use(express.json())
    app.use(cookieParser())

    // Rate limiting for API routes
    app.use('/api', limiter)

    // Health check endpoint
    app.get('/health', (req, res) => {
        res.status(200).json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        })
    })

    app.use(
        '/api',
        (req, res, next) => {
            ;(req as unknown as SocketRequest).io = io
            next()
        },
        userRoutes.router
    )
    app.use(
        '/api',
        (req, res, next) => {
            ;(req as unknown as SocketRequest).io = io
            next()
        },
        serverRoutes.router
    )
    app.use(
        '/api',
        (req, res, next) => {
            ;(req as unknown as SocketRequest).io = io
            next()
        },
        messageRoutes.router
    )
    app.use(
        '/api',
        (req, res, next) => {
            ;(req as unknown as SocketRequest).io = io
            next()
        },
        directMessageRoutes.router
    )
    app.use(ErrorHandler)

    // Start the server
    const server = httpServer.listen(
        Number(process.env.SERVER_PORT),
        process.env.SERVER_HOST
    )
    logger.info(
        `Server is running on http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`
    )

    // Graceful shutdown
    async function gracefulShutdown(signal: string) {
        logger.info(`${signal} received, starting graceful shutdown`)

        server.close(async () => {
            logger.info('HTTP server closed')

            try {
                // Close database connections
                const {
                    closePostgresPool,
                    closeMongoClient,
                    closeCassandraClient,
                    closeRedisClient,
                } = await import('./repository/utils/databaseClients')

                await Promise.all([
                    closePostgresPool(),
                    closeMongoClient(),
                    closeCassandraClient(),
                    closeRedisClient(),
                ])
                logger.info('Database connections closed')

                process.exit(0)
            } catch (error) {
                if (error instanceof Error) {
                    logger.error(error, 'Error during shutdown')
                }
                process.exit(1)
            }
        })

        // Force shutdown after 30 seconds
        setTimeout(() => {
            logger.error('Forcing shutdown after timeout')
            process.exit(1)
        }, 30000)
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
})()
