# NicordJS
Modern library for create simple discord bots based on DiscordJS

## Installing
```bash
npm i NicordJS --save
yarn add NicordJS
pnpm add NicordJS
```

## Example
```ts
// Create client
const client = new NicordClient([
  // Set Intents for interacting with messages and guilds
  IntentsFlags.GUILDS,
  IntentsFlags.GUILD_MESSAGES,
])

// Set bot token
client.setToken('OTM2MjgxNjE4Njk4NjA0NjU0.YfK6NQ.OhB2n8eguXByq22************')
// Set guild id for local slash commands
client.defaultGuild = '9362818051********'
// Declares that all slash commands must be registered locally for the above guild.
client.localSlashCommands()
// Start client (can be awaited)
client.start(() => {
  console.log('Started!')
})

// Declares the class a listener of slash commands
@SlashCommandListener
class SlashCommands {
  // Declares a method as a command handler
  @CommandHandler
  // Command name (required)
  @Name('sum')
  // Command description (required)
  @Description('Sum of two numbers :)')
  // Optional options
  @NumberOption({
    name: 'a',
    description: 'a',
  })
  @NumberOption({
    name: 'b',
    description: 'b',
  })
  // handler method
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
```
