import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import {
    ClientToServerEvents,
    ServerToClientEvents,
} from './controller/ws/events'
import SocketHandlers from './controller/ws/SocketHandlers'
import { Credentials } from './domain/user/Credentials'
import ErrorHandler from './http/middleware/ErrorHandler'
import { messageRoutes } from './routes/MessageRoutes'
import { serverRoutes } from './routes/ServerRoutes'
import { userRoutes } from './routes/UserRoutes'
import { envCheck } from './utils/envCheck'

dotenv.config()

envCheck()

interface SocketData {
    user: Credentials
}

const app = express()
const httpServer = createServer(app)

const sessionMiddleware = session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
})

const config = {
    maxHttpBufferSize: 3e8,
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
}

const io = new Server<ClientToServerEvents, ServerToClientEvents, SocketData>(
    httpServer,
    config
)

io.engine.use(sessionMiddleware)

io.use(async (socket, next) => {
    const cookies = socket.request.headers.cookie
    let authenticated = false

    if (cookies) {
        const cookieArray = cookies.split(';')
        for (const cookie of cookieArray) {
            const [name, value] = cookie.trim().split('=')
            if (name === 'token') {
                const user = await userRoutes.userServices.checkAuth(value)
                if (user) {
                    socket.data.user = user
                    authenticated = true
                }
                break
            }
        }
    }
    if (!authenticated) {
        return next(new Error('Authentication error'))
    }
    next()
})

const onConnection = (
    socket: Socket<ClientToServerEvents, ServerToClientEvents>
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

app.use(sessionMiddleware)
app.use(bodyParser.json())
app.use(cookieParser())

app.use('/api', userRoutes.router)
app.use('/api', serverRoutes.router)
app.use('/api', messageRoutes.router)
app.use(ErrorHandler)

// Start the server
httpServer.listen(Number(process.env.SERVER_PORT), process.env.SERVER_HOST)
console.log(
    `Server is running on http://${process.env.SERVER_HOST}:${process.env.SERVER_PORT}`
)
