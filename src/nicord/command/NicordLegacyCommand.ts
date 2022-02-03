import { NicordMessage } from '../NicordMessage'
import { Message } from 'discord.js'


export class NicordLegacyCommand extends NicordMessage {
  constructor(message: Message, private args: string[]) {
    super(message)
  }

  get rawArgs() {
    return this.args
  }

  get singleArgument() {
    return this.args.join(' ')
  }

}
