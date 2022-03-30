import { CommandListener } from '../types/CommandListener'
import 'reflect-metadata'
import { MetadataKeys } from './MetadataKeys'
import {
  Awaitable,
  ClientEvents,
  Collection,
  Interaction,
  Message,
  MessageAttachment, MessageEmbed,
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

  static pipeMessage(message: Message, handleEmbeds: boolean = false): MessageOptions {
    const pipedMessage: MessageOptions = {}
    let embedParseResult: EmbedParserResult = { embeds: [], clearMessage: message.content }
    try {
      embedParseResult = EmbedParser(message.content)
    } catch (e) {
      handleEmbeds = false
    }
    if (embedParseResult.clearMessage.length > 0) pipedMessage.content = embedParseResult.clearMessage
    if (message.embeds.length > 0 && !handleEmbeds) pipedMessage.embeds = message.embeds
    if (message.components.length > 0)
      pipedMessage.components = message.components
    if (message.attachments.size > 0)
      pipedMessage.files = NicordTools.pipeAttachments(message.attachments)
    if (embedParseResult.embeds.length > 0 && handleEmbeds) pipedMessage.embeds = [...(pipedMessage.embeds ?? []), ...embedParseResult.embeds]
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

  static wrapEventListener<K extends keyof ClientEvents>(event: K, client: NicordClient, middlewares: ((...args: NicordClientEvents[K]) => Awaitable<void | 'REJECT'>)[], listener: (...args: NicordClientEvents[K]) => Awaitable<void>): (...args: ClientEvents[K]) => Awaitable<void> {
    return (...args) => {
      for (const mid of middlewares) {
        try {
          if (mid(...NicordTools.handleDJSEventArgs(...args) as NicordClientEvents[K]) === 'REJECT') return
        } catch (e) {
          client.log(chalk.red(`One of middlewares for ${event} throw an error:\n${e}`))
          return
        }
      }
      listener(...NicordTools.handleDJSEventArgs(...args) as NicordClientEvents[K])
    }
  }

}
