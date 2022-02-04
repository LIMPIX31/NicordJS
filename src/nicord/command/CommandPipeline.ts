import { NicordClientException } from '../../exceptions/NicordClient.exception'
import { NicordCommandHandler } from './NicordCommandHandler'
import { NicordTools } from '../NicordTools'
import { CommandListener } from '../../types/interfaces/CommandListener'
import { NicordCommandInteraction } from '../interaction/NicordCommandInteraction'
import { NicordMessage } from '../NicordMessage'

export abstract class CommandPipeline {
  static async legacyCommand(msg: NicordMessage, Listener: CommandListener) {
    await msg.fetch()
    if (!NicordTools.isCommandListener(Listener))
      throw new NicordClientException('Listener must be valid')
    const handlers = NicordCommandHandler.fromListener(Listener)
    for (const handler of handlers) {
      await handler.execute(msg)
    }
  }

  static async slashCommand(
    cmd: NicordCommandInteraction,
    Listener: CommandListener,
  ) {
    if (!NicordTools.isCommandListener(Listener))
      throw new NicordClientException('Listener must be valid')
    const handlers = NicordCommandHandler.fromListener(Listener)
    for (const handler of handlers) {
      if (handler.subcommands) {
        for (const subhandler of NicordCommandHandler.fromListener(
          handler.subcommands,
          handler.name,
        )) {
          await subhandler.execute(cmd)
        }
      } else {
        await handler.execute(cmd)
      }
    }
  }
}
