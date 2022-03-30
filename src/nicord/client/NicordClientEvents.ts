import { ClientEvents, Interaction } from 'discord.js'
import { NicordMessage } from '../NicordMessage'
import { NicordInteraction } from '../interaction/NicordInteraction'

export interface NicordClientEvents
  extends Omit<
    ClientEvents,
    'messageCreate' | 'interactionCreate' | 'messageDelete' | 'messageUpdate'
  > {
  messageCreate: [message: NicordMessage]
  messageUpdate: [oldMessage: NicordMessage, newMessage: NicordMessage]
  messageDelete: [message: NicordMessage]
  interactionCreate: [interaction: NicordInteraction<Interaction>]
}
