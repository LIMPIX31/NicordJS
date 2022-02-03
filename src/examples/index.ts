import {
  CommandHandler,
  Description,
  IntentsFlags,
  Name,
  NicordClient,
  NumberOption,
  SlashCommandListener,
} from '../index'
import { NicordSlashCommand } from '../nicord/command/NicordSlashCommand'

const client = new NicordClient([
  IntentsFlags.GUILDS,
  IntentsFlags.GUILD_MESSAGES,
])

client.setToken('token')


client.start(() => {
  console.log('Started!')
})


@SlashCommandListener
class MySubcommands {
  @CommandHandler
  @Name('examplesub')
  @Description('Example subcommand')
  private async examplesub() {
    // TODO:
  }
}

@SlashCommandListener
class SlashCommands {
  @CommandHandler
  @Name('sum')
  @Description('Sum of two numbers')
  @NumberOption({
    name: 'a',
    description: 'a',
  })
  @NumberOption({
    name: 'b',
    description: 'b',
  })
  private async sum(cmd: NicordSlashCommand) {
    const a = cmd.getOption<number>('a')
    const b = cmd.getOption<number>('b')
    if (a && b) {
      await cmd.ephemeral(a + b)
    } else {
      await cmd.ephemeral('Неверные аргументы')
      return
    }
  }

}

client.addCommandListener(SlashCommands)
