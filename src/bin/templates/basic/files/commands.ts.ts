export const commandsFile = `import { LegacyCommandListener, Prefix, CommandHandler, Name, NicordLegacyCommand } from 'nicord.js'
import { client } from './index'

  @LegacyCommandListener
  @Prefix('!')
  class MyCommands {
    @CommandHandler
    @Name('ping')
    private ping(cmd: NicordLegacyCommand) {
      cmd.reply('pong!')
    }
  }
  
  client.addCommandListener(MyCommands)`
