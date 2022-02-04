import {
  CommandHandler,
  Description,
  IntentsFlags,
  Name,
  NicordClient,
  NumberOption,
  SlashCommandListener,
  Subcommands,
} from '../index'
import { NicordSlashCommand } from '../nicord/command/NicordSlashCommand'

const client = new NicordClient([
  IntentsFlags.GUILDS,
  IntentsFlags.GUILD_MESSAGES,
])

client.setToken('OTM2MjgxNjE4Njk4NjA0NjU0.YfK6NQ.OhB2n8eguXByq22bGfaXXFSDAAY')


client.start(() => {
  console.log('Started!')
})


@SlashCommandListener
class MySubcommands {
  @CommandHandler
  @Name('hello')
  @Description('Says hello')
  private async sayhello(cmd: NicordSlashCommand) {
    await cmd.reply('Hello!')
  }

  @CommandHandler
  @Name('bye')
  @Description('Says Bye')
  private async saybye(cmd: NicordSlashCommand) {
    await cmd.reply('Bye!')
  }
}

@SlashCommandListener
class SlashCommands {
  @CommandHandler
  @Name('sum')
  @Description('Sum of two numbers :)')
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

  @CommandHandler
  @Name('say')
  @Description('Says commands')
  @Subcommands(MySubcommands)
  private sayscommands() {}

}

client.addCommandListener(SlashCommands)
