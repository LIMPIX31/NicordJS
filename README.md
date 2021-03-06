<h1 align="center">NicordJS</h1>

<p align="center">
  <img src="https://i.imgur.com/4DmH7I9.png" width="256" height="256">
</p>

<p align="center">Modern library for create simple discord bots based on DiscordJS</p>

[English](https://github.com/LIMPIX31/NicordJS#readme) | [Русский](https://github.com/LIMPIX31/NicordJS/blob/master/README.ru.md)

## CLI (Creating new project from a template)
```bash
# install nicord.js globally
npm i nicord.js -g
# run this command in the project directory and
# follow the instructions to create a new project
nicord init
```

## Installing in project

```bash
# using npm
npm i nicord.js --save
# using yarn
yarn add nicord.js
# using pnpm
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

// Enable logging
client.debug()
// Set bot token
client.setToken('OTM2MjgxNjE4Njk4NjA0NjU0.YfK6NQ.OhB2n8eguXByq22************')
// Set guild id for local slash commands
client.defaultGuild = '9362818051********'
// Declares that all slash commands must be registered locally for the above guild.
client.localSlashCommands()
// Start client (can be awaited)
client.start(() => {
  // Here you can perform any action at the start of the client
})

// Declares the class as a listener of slash commands
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

## Events

NicordJS replaces the event system with its own for some reason, but it works the same way as before
```ts
client.nion('messageCreate', msg => {
  msg.replyToDM('Hi!')
})
client.nionce(/**/)
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
class MySubcommands {
  @CommandHandler
  @Name('a')
  @Description('action A')
  private a() {/* TODO */
  }

  @CommandHandler
  @Name('b')
  @Description('action B')
  private b() {/* TODO */
  }
}

@SlashCommandListener
class SlashCommands {
  @CommandHandler
  @Name('actions')
  @Description('Some actions')
  @Subcommands(MySubcommands)
  private actions() {
  }
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

Intermediate layers are executed one after another before the execution of the listeners of the specified event, they are executed even for events declared inside NicordJS

```ts
client.useMiddleware('messageCreate', async (msg) => {
  if (msg.attachments.length > 2) {
    await msg.delete()
    msg.replyToDM('Too many attachments')
    // Return 'REJECT' to prevent subsequent layers and
    // the final event handler from triggering
    return 'REJECT'
  }
})
```

## Presence

```ts
client.start(() => {
  console.log('Started!')
  // Create presence after client startup
  const presence = new NicordPresence()
    // Make presence refreshable, so that status and activity updates automatically
    .refreshable()
    // Sets the status to Do Not Disturb
    .dnd()
    // Adds activity
    .addActivity(new NicordActivity()
      // playing, streaming, etc...
      .playing()
      // Activity name
      .setName('Minecraft')
    )
  // Apply presence
  client.setPresence(presence)
  // We update the status after 10 seconds, thanks to `refreshable`, we do not need to update manually
  setTimeout(() => {
    presence.idle()
  }, 10000)
})
```

## Shadowing
You can create a webhook exactly like the user you specify, which makes it possible to do very interesting things.
Configure Firebase to synchronize webhooks in more detail and prevent duplication
```ts
const shadowUser = new ShadowUser(client, {user, channel})
const webhook = await shadowUser.get()
```

## Shadowing example
Set up message shading on your server to be able to send embeds

```ts
client.useMiddleware<NicordMessage>('message', async (msg) => {
  const embeds = EmbedParser(msg.content)
  if (embeds.length > 0) {
    await msg.delete()
    if(!(msg.channel instanceof TextChannel)) return msg
    const webhook = await new ShadowUser(client, { user: msg.author, channel: msg.channel }).get()
    await webhook.send({ embeds })
  }
})
```

## Channel Proxying
You can send messages on behalf of your bot and broadcast messages from other channels
```ts
// We will need Firebase. It's not necessary,
// but if you want to be able to edit proxied messages and 
// have more accurate webhook synchronization, 
// we need to plug it into the project

// Place your firebase private key in the project
// You can get it here: https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk
import creds from './firebase-adminsdk.json'

export const client = new NicordClient([
  IntentsFlags.ALL
])

const firebaseConfig = {
    // Firebase app config
};

client.setToken('ODc1Njk4NDY4OTg1OTI5Nzc4.YRZTwA.***************************')
// Connecting firebase to the client
client.setFirebase(firebaseConfig, creds)

// Define the capture channel
// (From here, your messages will be redirected to the destination channel on behalf of the botа)
const captureChannel = '955901635895394324'
// Define the destination channel
// From here, messages from other users will be forwarded to the interception channel on behalf of webhooks
const destinationChannel = '786861708487557163'

client.start(async () => {
  console.log('Bot started!')
  // Create and run a proxy.
  client.useProxy(new ChannelProxy(captureChannel, destinationChannel))
})

```

## Other features

Since `NicordJS` is a wrapper over `DiscordJS`, if `NicordJS` functionality is not enough for you, you can
import `DiscordJS` classes and types from `NicordJS`, since `NicordJS` inherits `DiscordJS`.

## Credits

[discord.js](https://www.npmjs.com/package/discord.js) - is a powerful Node.js module that allows you to easily interact
with the Discord API.
