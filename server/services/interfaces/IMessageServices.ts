import { AuthenticatedUser } from '../../domain/user/AuthenticatedUser'
import { MessageSummary } from '../../http/model/output/server/MessageSummary'
import { MessageCreateInput } from '../../http/model/input/message/MessageCreateInput'

export interface IMessageServices {
    sendMessage(
        user: AuthenticatedUser,
        input: MessageCreateInput
    ): Promise<MessageSummary>
}