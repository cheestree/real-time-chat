import ServerDataMem from '../repository/server/ServerDataMem'
import ServerServices from '../services/ServerServices'

const serverRepository = new ServerDataMem()
//  const userRepository = new UserRepository()
const serverServices = new ServerServices(serverRepository)

export { serverServices }
