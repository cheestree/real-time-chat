import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import session from 'express-session'
import { createServer } from 'http'
import { Server, Socket } from 'socket.io'
import SocketHandlers from './controller/ws/SocketHandlers'
import ErrorHandler from './middleware/ErrorHandler'
import { serverServices } from './routes/ServerRoutes'
import { userRouter, userServices } from './routes/UserRoutes'

const app = express()
const httpServer = createServer(app)

const sessionMiddleware = session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true },
})

const io = new Server(httpServer, {
    maxHttpBufferSize: 3e8,
    cors: {
        origin: 'http://localhost:3000',
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
                socket.data = await userServices.checkAuth(value)
                break
            }
        }
    }

    next()
})

const onConnection = (socket: Socket) => {
    SocketHandlers(io, socket, userServices, serverServices)
}

io.on('connection', onConnection)

app.use(sessionMiddleware)
app.use(bodyParser.json())
app.use(cookieParser())

app.use('/api', userRouter)
app.use(ErrorHandler)

// Start the server
const PORT = 4000
httpServer.listen(PORT)
console.log(`Server is running on http://localhost:${PORT}`)
