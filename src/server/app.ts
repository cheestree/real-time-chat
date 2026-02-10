import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import session from 'express-session'
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

import SocketHandlers from './controller/ws/SocketHandlers'
import ErrorHandler from './http/middleware/ErrorHandler'
import { messageRoutes } from './routes/MessageRoutes'
import { serverRoutes } from './routes/ServerRoutes'
import { userRoutes } from './routes/UserRoutes'
import { getCookie } from './utils/cookieParser'
import { envCheck } from './utils/envCheck'
import { logger } from './utils/logger'

envCheck()

const app = express()
const httpServer = createServer(app)

const sessionMiddleware = session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.SERVER_PROFILE === 'prod' },
})

const config = {
    maxHttpBufferSize: 3e8,
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
}

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
        messageRoutes.messageServices
    )
}

io.on('connection', onConnection)

app.use(
    cors({
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
    })
)

app.use(sessionMiddleware)
app.use(bodyParser.json())
app.use(cookieParser())

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
app.use(ErrorHandler)

// Start the server
httpServer.listen(Number(process.env.SERVER_PORT), process.env.SERVER_HOST)
logger.info(
    `Server is running on http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`
)
