import { Router } from 'express'
import ServerController from '../controller/ServerController'
import { Path } from '../http/path/Path'
import ServerDataMem from '../repository/server/ServerDataMem'
import ServerServices from '../services/ServerServices'

class ServerRoutes {
    public router = Router()
    public serverServices: ServerServices
    private serverController: ServerController

    constructor() {
        const serverRepository = new ServerDataMem()
        //  const serverRepository = new ServerRepository();
        this.serverServices = new ServerServices(serverRepository)
        this.serverController = new ServerController()
        this.initRoutes()
    }

    private initRoutes() {
        this.router.get(Path.SERVERS, this.serverController.listServers)
        this.router.get(`${Path.SERVERS}/:id`, this.serverController.getServer)
        this.router.post(Path.SERVERS, this.serverController.createServer)
        this.router.delete(
            `${Path.SERVERS}/:id`,
            this.serverController.deleteServer
        )
    }
}

const serverRoutes = new ServerRoutes()
export { serverRoutes }
