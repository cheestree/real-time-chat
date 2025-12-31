import { Router } from 'express'
import ServerController from '../controller/ServerController'
import { Path } from '../http/path/Path'
import { createServerRepository } from '../repository/server/createServerRepository'
import { createUserRepository } from '../repository/user/createUserRepository'
import ServerServices from '../services/ServerServices'

class ServerRoutes {
    public router = Router()
    public serverServices: ServerServices
    private serverController: ServerController

    constructor() {
        const serverRepository = createServerRepository()
        const userRepository = createUserRepository()
        this.serverServices = new ServerServices(
            serverRepository,
            userRepository
        )
        this.serverController = new ServerController(this.serverServices)
        this.initRoutes()
    }

    private initRoutes() {
        this.router.get(Path.SERVERS, this.serverController.listServers)
        this.router.get(
            `${Path.SERVERS}/:id`,
            this.serverController.getServerDetails
        )
        this.router.post(Path.SERVERS, this.serverController.createServer)
        this.router.post(
            `${Path.SERVERS}/:id/join`,
            this.serverController.joinServer
        )
        this.router.delete(
            `${Path.SERVERS}/:id`,
            this.serverController.deleteServer
        )
    }
}

const serverRoutes = new ServerRoutes()
export { serverRoutes }
