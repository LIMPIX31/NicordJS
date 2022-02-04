# NicordJS

Modern library for create simple discord bots based on DiscordJS

## Installing

```bash
npm i nicord.js --save
yarn add nicord.js
pnpm add nicord.js
```

## Simple Example

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
  // From top to bottom order
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

client.addCommandListener(SlashCommands)
```

## Legacy commands

Ordinary, text commands that begin with the prefix

```ts
@LegacyCommandListener
@Prefix('!')
class LegacyCommands {
  @CommandHandler
  @Name('ping')
  private ping(cmd: NicordLegacyCommand) {
    cmd.reply('pong!')
  }
}
```

**You may have seen that I specified a prefix for the command over a class, not a method. Some handler decorators can be
placed over a class, so they will apply to all handlers in the class, but the decorators over a method will overwrite
the decorators over the class.**

## Restricted commands and guards

These decorators allow or disallow the use of commands for certain roles or users with special permissions

```ts
@AdminOnly // only for admins
@WhitelistedRoles // only for specified roles
@BlacklistedRoles // only for unspecified roles
@RequiredPermissions // Only for users with special permissions (Ex. SPEAK, STREAM ...)
```

The `UseGuard` decorator allows you to check the input or catch an error. Must return a boolean value. (true - allow
command execution, false - deny)

```ts
@UseGuard(async (cmd: NicordSlashCommand, err: NicordCommandError) => {
  if (err) {
    if (err.unpermitted) {
      await cmd.ephemeral('You are not permitted')
    }
    return false
  }
  if (cmd.getOption<string>('text').toLowerCase() === 'книга'.substring(1)) {
    await cmd.reply('BAN!')
    return false
  }
  return true
})
```

## Subcommands

```ts
@SlashCommandListener
class Subcommands {
  @CommandHandler
  @Name('a')
  @Description('action A')
  private a() {/* TODO */}

  @CommandHandler
  @Name('b')
  @Description('action B')
  private b() {/* TODO */}
}

@SlashCommandListener
class SlashCommands {
  @CommandHandler
  @Name('actions')
  @Description('Some actions')
  @Subcommands(Subcommands)
  private actions() {}
}

// then register SlashCommands; Subcommands register automatically
```

## Buttons

NicordJS has simplified the buttons a bit, here's how it works now

```ts
message.reply({
  content: 'buttons',
  components: [
    new ButtonRowComponent(
      new NicordButton('saydm', 'Say hello to DM', 'PRIMARY')
    )
  ]
})

client.registerButton('saydm', (interaction) => {
  interaction.user.send('Hello!')
})

```

## Middlewares
Thinking about message logging or filtering unwanted content? Use middlewares
```ts
client.useMiddleware('message', (entity) => {
  console.log((entity as NicordMessage).content)
  return entity
})
```
