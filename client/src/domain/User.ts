import { UserProfile } from '@/domain/UserProfile'

export type User = {
    internalId: string
    publicId: string
    profile: UserProfile
}
