import { CommandListener } from '../types/CommandListener'
import 'reflect-metadata'
import { MetadataKeys } from './MetadataKeys'
import {
  Collection,
  Message,
  MessageAttachment,
  MessageOptions,
} from 'discord.js'
import { NicordMessage } from '../nicord/NicordMessage'

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

  static pipeMessage(message: Message | NicordMessage): MessageOptions {
    const pipedMessage: MessageOptions = {}
    if (message.content.length > 0) pipedMessage.content = message.content
    if (message.embeds.length > 0) pipedMessage.embeds = message.embeds
    if (message.components.length > 0)
      pipedMessage.components = message.components
    if (message instanceof Message) {
      if (message.attachments.size > 0)
        pipedMessage.files = NicordTools.pipeAttachments(message.attachments)
    } else {
      if (message.attachments.length > 0)
        pipedMessage.files = NicordTools.pipeAttachments(message.attachments)
    }
    return pipedMessage
  }

  static deduceValues<T>(values: T[], blacklist?: T[] | null, whitelist?: T[]) {
    if (blacklist) values = values.filter(v => !blacklist.includes(v))
    if (whitelist) values = values.filter(v => whitelist.includes(v))
    return values
  }
}
