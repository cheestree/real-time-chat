import { UserSummary } from '../user/UserSummary'
import { ChannelSummary } from './ChannelSummary'

export type ChannelDetail = ChannelSummary

export interface ServerDetail {
    id: string
    name: string
    description: string
    icon: string
    ownerIds: number[]
    channels: ChannelDetail[]
    users: UserSummary[]
}
