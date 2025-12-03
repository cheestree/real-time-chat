import { RequestHandler } from 'express'
import UserServices from '../services/UserServices'

const authenticatorWithServices = (
    userService: UserServices
): RequestHandler => {
    return async (req, res, next) => {
        if (!req.cookies.token) {
            return res.status(401).send('No token!')
        }

        const token: string = req.cookies.token

        try {
            const credential = await userService.checkAuth(token)
            if (credential) {
                res.setHeader('user', credential.id)
                return next()
            }
            return res.send('Token invalid')
        } catch (err) {
            console.log(err)
            return res.send(err)
        }
    }
}

export default authenticatorWithServices
