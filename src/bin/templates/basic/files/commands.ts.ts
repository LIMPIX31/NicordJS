export const commandsFile = `import { LegacyCommandListener, Prefix, CommandHandler, Name, NicordLegacyCommand } from 'nicord.js'

@LegacyCommandListener
@Prefix('!')
export class MyCommands {
  @CommandHandler
  @Name('ping')
  private ping(cmd: NicordLegacyCommand) {
    cmd.reply('pong!')
  }
}`
