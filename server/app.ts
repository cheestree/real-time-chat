import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import express from 'express'
import session from 'express-session'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import SocketHandlers from './controller/ws/SocketHandlers'
import ErrorHandler from './http/middleware/ErrorHandler'
import { serverRoutes } from './routes/ServerRoutes'
import { userRoutes } from './routes/UserRoutes'
import { envCheck } from './utils/envCheck'

dotenv.config()

envCheck()

const app = express()
const httpServer = createServer(app)

const sessionMiddleware = session({
    secret: process.env.JWT_SECRET!,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
})

const io = new Server(httpServer, {
    maxHttpBufferSize: 3e8,
    cors: {
        origin: process.env.ORIGIN,
        credentials: true,
    },
})

io.engine.use(sessionMiddleware)

io.use(async (socket, next) => {
    const cookies = socket.request.headers.cookie

    if (cookies) {
        const cookieArray = cookies.split(';')
        for (const cookie of cookieArray) {
            const [name, value] = cookie.trim().split('=')
            if (name === 'token') {
                socket.data = await userRoutes.userServices.checkAuth(value)
                break
            }
        }
    }
    next()
})

const onConnection = (socket: Socket) => {
    SocketHandlers(
        io,
        socket,
        userRoutes.userServices,
        serverRoutes.serverServices
    )
}

io.on('connection', onConnection)

app.use(sessionMiddleware)
app.use(bodyParser.json())
app.use(cookieParser())

app.use('/api', userRoutes.router)
app.use(ErrorHandler)

// Start the server
httpServer.listen(Number(process.env.PORT_SERVER), process.env.HOST)
console.log(
    `Server is running on http://${process.env.HOST}:${process.env.PORT_SERVER}`
)
