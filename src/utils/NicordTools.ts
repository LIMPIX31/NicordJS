import { CommandListener } from '../types/CommandListener'
import 'reflect-metadata'
import { MetadataKeys } from './MetadataKeys'
import {
  Awaitable,
  ClientEvents,
  Collection,
  Interaction,
  Message,
  MessageAttachment,
  MessageOptions,
} from 'discord.js'
import { EmbedParser } from '../nicord/EmbedParser'
import { NicordMessage } from '../nicord/NicordMessage'
import { NicordCommandInteraction } from '../nicord/interaction/NicordCommandInteraction'
import { NicordButtonInteraction } from '../nicord/interaction/NicordButtonInteraction'
import { NicordSelectMenuInteraction } from '../nicord/interaction/NicordSelectMenuInteraction'
import { NicordContextMenuInteraction } from '../nicord/interaction/NicordContextMenuInteraction'
import { NicordInteraction } from '../nicord/interaction/NicordInteraction'
import { NicordClientEvents } from '../nicord/client/NicordClientEvents'

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
    if (message.content.length > 0) pipedMessage.content = message.content
    if (message.embeds.length > 0) pipedMessage.embeds = message.embeds
    if (message.components.length > 0)
      pipedMessage.components = message.components
    if (message.attachments.size > 0)
      pipedMessage.files = NicordTools.pipeAttachments(message.attachments)
    const userEmbeds = EmbedParser(message.content)
    if (userEmbeds.length > 0 && handleEmbeds) message.embeds.push(...userEmbeds)
    return pipedMessage
  }

  static deduceValues<T>(values: T[], blacklist?: T[] | null, whitelist?: T[]) {
    if (blacklist) values = values.filter(v => !blacklist.includes(v))
    if (whitelist) values = values.filter(v => whitelist.includes(v))
    return values
  }

  static handleDJSEventArgs(...args: any[]): any[] {
    for (let arg of args) {
      arg instanceof Message && (arg = NicordMessage.from(arg))
      if (arg instanceof Interaction) {
        if (arg.isCommand()) {
          arg = NicordCommandInteraction.from(arg)
        } else if (arg.isButton()) {
          arg = NicordButtonInteraction.from(arg)
        } else if (arg.isCommand()) {
          arg = NicordCommandInteraction.from(arg)
        } else if (arg.isSelectMenu()) {
          arg = NicordSelectMenuInteraction.from(arg)
        } else if (arg.isContextMenu()) {
          arg = NicordContextMenuInteraction.from(arg)
        } else {
          arg = NicordInteraction.from(arg)
        }
      }
    }
    return args
  }

  static wrapEventListener<K extends keyof ClientEvents>(listener: (...args: NicordClientEvents[K]) => Awaitable<void>): (...args: ClientEvents[K]) => Awaitable<void> {
    return (...args) => {
      listener(...NicordTools.handleDJSEventArgs(...args) as NicordClientEvents[K])
    }
  }

}
