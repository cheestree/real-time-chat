import { UUID } from 'bson'

export type User = {
    internalId: number
    id: UUID
    username: string
    email: string
    password: string
}
