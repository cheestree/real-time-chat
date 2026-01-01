import { compare, hash } from 'bcrypt'
import { sign, verify } from 'jsonwebtoken'
import { logger } from '../../utils/logger'
import { Credentials } from './Credentials'

export class UserDomain {
    getExpireTime(hours: number = 2): number {
        const millisecondsInHour: number = 3600000
        return hours * millisecondsInHour
    }
    async createToken(
        internalId: number,
        id: string,
        username: string,
        password: string,
        expiration: number
    ): Promise<string> {
        const secretKey: string = process.env.JWT_SECRET || 'my-secret'
        const payload: Credentials = {
            internalId: internalId,
            id: id,
            username: username,
            password: password,
        }
        const option = { expiresIn: expiration }

        return sign(payload, secretKey, option)
    }

    async validateToken(token: string): Promise<Credentials | undefined> {
        try {
            const secretKey: string = process.env.JWT_SECRET || 'my-secret'
            return verify(token, secretKey) as Credentials
        } catch (err: unknown) {
            logger.error({ err }, 'Token validation error')
            return undefined
        }
    }

    async hashPassword(password: string): Promise<string> {
        return hash(password, 10)
    }
    async verifyPassword(
        password: string,
        hashedPassword: string
    ): Promise<boolean> {
        return await compare(password, hashedPassword)
    }
}
