<h1 align="center">NicordJS</h1>

<p align="center">
  <img src="https://i.imgur.com/4DmH7I9.png" width="256" height="256">
</p>

<p align="center">Современная библиотека для создания дискорд ботов на основе DiscordJS</p>

[English](https://github.com/LIMPIX31/NicordJS#readme) | [Русский](https://github.com/LIMPIX31/NicordJS/blob/master/README.ru.md)

## CLI (Создание готового шаблона)

```bash
# установите nicord.js глобально
npm i nicord.js -g
# Звпустите эту команду в каталоге ваших проектов
# и следуйте инструкциям, чтобы создать проект
nicord init
```

## Установка в проект

```bash
# Используя npm
npm i nicord.js --save
# Используя yarn
yarn add nicord.js
# Используя pnpm
pnpm add nicord.js
```

## Простой пример

```ts
// Создаём клиент
const client = new NicordClient([
  // Устанавливает права для бота,
  // следующие права устанавливаются автоматически,
  // но я их оставил тут для примера
  IntentsFlags.GUILDS,
  IntentsFlags.GUILD_MESSAGES,
])

// Устанавливаем токен бота
client.setToken('OTM2MjgxNjE4Njk4NjA0NjU0.YfK6NQ.OhB2n8eguXByq22************')
// Указываем id гильдии(сервера) если ваш бот приватный
client.defaultGuild = '9362818051********'
// Если ваш бот приватный, то выполните этот метод, 
// чтобы слэш команды регистрировались только на вашем сервере,
// это сэкономит вам время, т.к. локальные команды обновляются мгновенно
client.localSlashCommands()
// Запускаем клиент (можно подождать с помощью await)
client.start(() => {
  console.log('Started!')
})

// Объявляем класс как слушатель слэш команд
@SlashCommandListener
class SlashCommands {
  // Объявляем метод как обработчик команды
  @CommandHandler
  // Имя команды (обязательно)
  @Name('sum')
  // Описание команды (обяхательно)
  @Description('Sum of two numbers :)')
  // Необязательные параметры
  // В порядке с верху в низ
  @NumberOption({
    name: 'a',
    description: 'a',
  })
  @NumberOption({
    name: 'b',
    description: 'b',
  })
  // Сам обработчик команды
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

## Устаревшие(текстовые) команды

Обычные текстовые команды, начинающиеся с префикса

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

**Возможно, вы видели, что я указал префикс для команды над классом, а не над методом. Некоторые декораторы обработчиков
можно разместить над классом, тогда они будут применяться ко всем обработчикам в классе, но декораторы над методом будут
перезаписывать декораторы над классом.**

## Ограниченные команды и защитники

Следующие декораторы, разрешают или запрещают использовать команду некоторым ролям или пользователям

```ts
@AdminOnly // только админы
@WhitelistedRoles // только указанная роли
@BlacklistedRoles // все роли кроме указанной
@RequiredPermissions // только для пользователей с особыми правами (Например. SPEAK, STREAM ...)
```

Декоратор `UseGuard` позволяет проверить ввод или обработать ошибку. Должен возвращать булево значение (true - разрешить
выполнение , false - запретить)

```ts
@UseGuard(async (cmd: NicordSlashCommand, err: NicordCommandError) => {
  if (err) {
    if (err.unpermitted) {
      await cmd.ephemeral('У вас недостаточно прав')
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

## Подкоманды

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

// После зарегистрируйте SlashCommands; Подкоманды зарегестрируются автоматически.
```

## Buttons

NicordJS немного упрощает работу с кнопками, вот как это работает

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

Думаете о чём-то вроде логгирования сообщений или фильтрации нежелательного контента? Используйте middlewares(промежуточные слои)

```ts
client.useMiddleware('message', (entity) => {
  console.log((entity as NicordMessage).content)
  return entity
})
```

## Активность

```ts
client.start(() => {
  console.log('Started!')
  // Создаём настройки активности после запуска клиента
  const presence = new NicordPresence()
    // Делает активность самообновляемой
    .refreshable()
    // Устанавливаем статус на "Не Беспокоить"
    .dnd()
    // Добавляем элементы активности
    .addActivity(new NicordActivity()
      // играем, стримим, и т.д.
      .playing()
      // Имя элемента активности
      .setName('Minecraft')
    )
  // Запускаем активность на клиенте
  client.setPresence(presence)
  // Мы обновляем статус через 10 секунд, спасибо `refreshable`, нам не нужно перезапускать его вручную
  setTimeout(() => {
    presence.idle()
  }, 10000)
})
```

## Сторонние возможности

Так как `NicordJS` это обёртка над `DiscordJS`, если функциональности `NicordJS` недостаточно, вы можете импортировать классы и типы `DiscordJS` из `NicordJS`, так как `NicordJS` наследует `DiscordJS`.

## Использовано

[discord.js](https://www.npmjs.com/package/discord.js) - is a powerful Node.js module that allows you to easily interact
with the Discord API.
