import { CommandListener } from '../types/CommandListener'
import 'reflect-metadata'
import { MetadataKeys } from './MetadataKeys'
import {
  Awaitable,
  Client,
  ClientEvents,
  Collection,
  Interaction,
  Message,
  MessageAttachment,
  MessageOptions,
} from 'discord.js'
import { EmbedParser, EmbedParserResult } from '../nicord/EmbedParser'
import { NicordMessage } from '../nicord/NicordMessage'
import { NicordCommandInteraction } from '../nicord/interaction/NicordCommandInteraction'
import { NicordButtonInteraction } from '../nicord/interaction/NicordButtonInteraction'
import { NicordSelectMenuInteraction } from '../nicord/interaction/NicordSelectMenuInteraction'
import { NicordContextMenuInteraction } from '../nicord/interaction/NicordContextMenuInteraction'
import { NicordInteraction } from '../nicord/interaction/NicordInteraction'
import { NicordClientEvents } from '../nicord/client/NicordClientEvents'
import { NicordClient } from '../nicord/client/NicordClient'
import * as chalk from 'chalk'
import { Chalk } from 'chalk'
import * as terminalLink from 'terminal-link'
import * as centerAlign from 'center-align'

const { version, author } = require('../../package.json')

export enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  EXTRA = 3,
}

export abstract class NicordTools {
  static isCommandListener(Listener: CommandListener) {
    return Reflect.hasMetadata(
      MetadataKeys.isCommandListener,
      Listener.prototype,
    )
  }

  static isSlashListener(Listener: CommandListener) {
    return Reflect.hasMetadata(MetadataKeys.isSlash, Listener.prototype)
  }

  static pipeAttachments(
    attachments: Collection<string, MessageAttachment> | MessageAttachment[],
  ): MessageAttachment[] {
    return (
      attachments.map as (
        fn: (value: MessageAttachment) => MessageAttachment,
      ) => MessageAttachment[]
    )(
      v =>
        new MessageAttachment(v.attachment, v.name ?? undefined, {
          id: v.id,
          filename: v.name ?? 'unknown',
          size: v.size,
          description: v.description ?? undefined,
          ephemeral: v.ephemeral,
          proxy_url: v.proxyURL,
          url: v.url,
          content_type: v.contentType ?? undefined,
          height: v.height,
          width: v.width,
        }),
    )
  }

  static pipeMessage(
    client: Client,
    message: Message,
    handleEmbeds: boolean = false,
  ): MessageOptions {
    const pipedMessage: MessageOptions = {}
    let embedParseResult: EmbedParserResult = {
      embeds: [],
      clearMessage: message.content,
    }
    try {
      embedParseResult = EmbedParser(message.content)
    } catch (e) {
      handleEmbeds = false
    }
    if (embedParseResult.clearMessage.length > 0)
      pipedMessage.content = NicordTools.transpileEmojis(
        client,
        embedParseResult.clearMessage,
      )
    if (message.embeds.length > 0 && !handleEmbeds)
      pipedMessage.embeds = message.embeds
    if (message.components.length > 0)
      pipedMessage.components = message.components
    if (message.attachments.size > 0)
      pipedMessage.files = NicordTools.pipeAttachments(message.attachments)
    if (embedParseResult.embeds.length > 0 && handleEmbeds)
      pipedMessage.embeds = [
        ...(pipedMessage.embeds ?? []),
        ...embedParseResult.embeds,
      ]
    return pipedMessage
  }

  static deduceValues<T>(values: T[], blacklist?: T[] | null, whitelist?: T[]) {
    if (blacklist) values = values.filter(v => !blacklist.includes(v))
    if (whitelist) values = values.filter(v => whitelist.includes(v))
    return values
  }

  static handleDJSEventArgs(...args: any[]): any[] {
    for (let i = 0; i < args.length; i++) {
      args[i] instanceof Message && (args[i] = NicordMessage.from(args[i]))
      if (args[i] instanceof Interaction) {
        if (args[i].isCommand()) {
          args[i] = NicordCommandInteraction.from(args[i])
        } else if (args[i].isButton()) {
          args[i] = NicordButtonInteraction.from(args[i])
        } else if (args[i].isCommand()) {
          args[i] = NicordCommandInteraction.from(args[i])
        } else if (args[i].isSelectMenu()) {
          args[i] = NicordSelectMenuInteraction.from(args[i])
        } else if (args[i].isContextMenu()) {
          args[i] = NicordContextMenuInteraction.from(args[i])
        } else {
          args[i] = NicordInteraction.from(args[i])
        }
      }
    }
    return args
  }

  static wrapEventListener<K extends keyof ClientEvents>(
    event: K,
    client: NicordClient,
    middlewares: ((
      ...args: NicordClientEvents[K]
    ) => Awaitable<void | 'REJECT'>)[],
    listener: (...args: NicordClientEvents[K]) => Awaitable<void>,
  ): (...args: ClientEvents[K]) => Awaitable<void> {
    return (...args) => {
      for (const mid of middlewares) {
        try {
          if (
            mid(
              ...(NicordTools.handleDJSEventArgs(
                ...args,
              ) as NicordClientEvents[K]),
            ) === 'REJECT'
          )
            return
        } catch (e) {
          client.log(
            LogLevel.ERROR,
            `One of middlewares for ${event} throw an error:\n${e}`,
          )
          return
        }
      }
      listener(
        ...(NicordTools.handleDJSEventArgs(...args) as NicordClientEvents[K]),
      )
    }
  }

  static transpileEmojis(client: Client, emojiString: string): string {
    return emojiString.replaceAll(
      /((?<!<):((?<name>\w+?):)(?!>)|\$?(?<animated>a?):(?<nameid>\w+?):(?<id>\d+?)\$)/g,
      (match, b, c, d, e, f, g, h, j, groups) => {
        const guildEmoji = client.emojis.cache.find(e => e.name === groups.name)
        if (guildEmoji)
          return `<${guildEmoji.animated ? 'a' : ''}:${guildEmoji.name}:${
            guildEmoji.id
          }>`
        else if (groups.id)
          return `<${groups.animated ? 'a' : ''}:${groups.nameid}:${groups.id}>`
        else return match
      },
    )
  }

  static getHMSMcs(): string {
    const date = new Date()
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')
    const milliseconds = String(date.getMilliseconds()).padStart(3, '0')
    return `${hours}:${minutes}:${seconds}::${milliseconds}`
  }

  static log(
    enabled: boolean,
    level: LogLevel,
    message: any,
    filterLevel: LogLevel,
  ) {
    if (level > filterLevel || !enabled) return

    let colorfn: Chalk
    let prefix = ''
    switch (level) {
      case LogLevel.ERROR:
        colorfn = chalk.redBright
        prefix = chalk.red.bold('ERROR')
        break
      case LogLevel.WARN:
        colorfn = chalk.yellowBright
        prefix = chalk.yellow.bold('WARN')
        break
      case LogLevel.INFO:
        colorfn = chalk.white
        prefix = chalk.blue.bold('INFO')
        break
      case LogLevel.EXTRA:
        colorfn = chalk.gray
        prefix = chalk.gray.bold('EXTRA')
        break
    }
    message
      .split('\n')
      .forEach(m =>
        console.log(
          chalk.gray(`[${NicordTools.getHMSMcs()}] `) +
            prefix +
            colorfn(` ${m.toString()}`),
        ),
      )
  }

  static getCredits(): string {
    return centerAlign(`
                              -={ ${chalk.magentaBright.bold(
                                'NicordJS',
                              )} ${chalk.blue(version)} }=-
            Created By ${chalk.yellow(
              Array.isArray(author) ? author.join(' ') : author,
            )}
            
            Support me: ${terminalLink(
              chalk.yellow('DonationAlerts'),
              'https://www.donationalerts.com/r/limpix31',
            )}
            NicordJS support on Discord: ${terminalLink(
              chalk.yellow('discord.gg/75uYTryUu8'),
              'https://discord.gg/75uYTryUu8',
            )}
            
            ${chalk.gray(`© NicordJS 2022 - ${new Date().getFullYear()}`)}
    `)
  }
}
