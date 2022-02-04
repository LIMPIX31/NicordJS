import {
  ButtonRowComponent,
  CommandHandler,
  Description,
  IntentsFlags,
  Name,
  NicordButton,
  NicordClient,
  NicordCommandError,
  NicordMessage,
  NicordSlashCommand,
  NumberOption,
  SlashCommandListener,
  StringOption,
  UseGuard,
  WhitelistedRoles,
} from '../index'

const client = new NicordClient([
  IntentsFlags.GUILDS,
  IntentsFlags.GUILD_MESSAGES,
])

client.setToken('OTM2MjgxNjE4Njk4NjA0NjU0.YfK6NQ.OhB2n8eguXByq22bGfaXXFSDAAY')

client.defaultGuild = '936281805131223051'
client.localSlashCommands()

client.start(() => {
  console.log('Started!')
})

client.useMiddleware('message', (entity) => {
  console.log((entity as NicordMessage).content)
  return entity
})

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
  @UseGuard((cmd: NicordSlashCommand, err: NicordCommandError) => {

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
  @Name('button')
  @Description('Sends a button')
  private async buttoncmd(cmd: NicordSlashCommand) {
    await cmd.reply({
      content: 'Click on button',
      components: [new ButtonRowComponent(
        new NicordButton('clickme', 'Нажми бобёр', 'PRIMARY'),
      )],
    })
  }

  @CommandHandler
  @Name('say')
  @Description('Say anything')
  @StringOption({
    name: 'text',
    description: 'Текст',
  })
  @WhitelistedRoles('936555104293761095')
  @UseGuard(async (cmd: NicordSlashCommand, err: NicordCommandError) => {
    if (err) {
      await cmd.ephemeral('You are not permitted')
      return false
    }
    if (cmd.getOption<string>('text') === 'книга'.substring(1)) {
      await cmd.reply('Забанить его!!!')
      return false
    }
    return true
  })
  private async say(cmd: NicordSlashCommand) {
    await cmd.reply(cmd.getOption<string>('text') || 'Он промолчал')
  }

}

client.registerButton('clickme', async (interaction) => {
  await interaction.reply('Нажал, молодец!')
})

client.addCommandListener(SlashCommands)
