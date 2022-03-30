/**
 * <h1>NicordMessage</h1>
 */
import {
  Collection,
  DMChannel,
  EmojiIdentifierResolvable,
  Guild,
  GuildMember,
  Message,
  MessageActionRow,
  MessageAttachment,
  MessageEmbed,
  MessageOptions,
  MessagePayload,
  MessageReaction,
  NewsChannel,
  PartialDMChannel,
  ReplyMessageOptions,
  TextChannel,
  ThreadChannel,
  User,
} from 'discord.js'
import { OriginalShadow } from '../utils/OriginalShadow'
import { NicordTools } from '../utils/NicordTools'

export class NicordMessage extends OriginalShadow<Message> {
  get author(): User {
    return this.original.author
  }

  get channel(): DMChannel | PartialDMChannel | NewsChannel | TextChannel | ThreadChannel {
    return this.original.channel
  }

  get guild(): Guild | null {
    return this.original.guild
  }

  get content(): string {
    return this.original.content
  }

  get embeds(): MessageEmbed[] {
    return this.original.embeds
  }

  set embeds(embeds: MessageEmbed[]) {
    this.original.embeds = embeds
  }

  get components(): MessageActionRow[] {
    return this.original.components
  }

  set components(components: MessageActionRow[]) {
    this.original.components = components
  }

  get member(): GuildMember | null {
    return this.original.member
  }

  get attachments(): Collection<string, MessageAttachment> {
    return this.original.attachments
  }

  static from(message: Message): NicordMessage {
    return new NicordMessage(message)
  }

  async reply(
    options: string | MessagePayload | ReplyMessageOptions,
  ): Promise<NicordMessage> {
    return new NicordMessage(await this.original.reply(options))
  }

  async replyToDM(
    options: string | MessagePayload | ReplyMessageOptions,
  ): Promise<NicordMessage> {
    return new NicordMessage(await this.original.author.send(options))
  }

  async delete(): Promise<NicordMessage> {
    return new NicordMessage(await this.original.delete())
  }

  async edit(
    content: string | MessagePayload | ReplyMessageOptions,
  ): Promise<NicordMessage> {
    return new NicordMessage(await this.original.edit(content))
  }

  isDMMessage(): boolean {
    return this.original.channel.type === 'DM'
  }

  isSystemMessage(): boolean {
    return this.original.system
  }

  isBotMessage(): boolean {
    return this.author.bot
  }

  async pin(): Promise<NicordMessage> {
    return new NicordMessage(await this.original.pin())
  }

  async unpin(): Promise<NicordMessage> {
    return new NicordMessage(await this.original.unpin())
  }

  async react(emoji: EmojiIdentifierResolvable): Promise<MessageReaction> {
    return this.original.react(emoji)
  }

  async removeAllReactions(): Promise<NicordMessage> {
    await this.fetch()
    return new NicordMessage(await this.original.reactions.removeAll())
  }

  async fetch(): Promise<NicordMessage> {
    return new NicordMessage(await this.original.fetch())
  }

  async getReactions(): Promise<MessageReaction[]> {
    await this.fetch()
    return this.original.reactions.cache.map(v => v)
  }

  async crosspost(): Promise<NicordMessage> {
    return new NicordMessage(await this.original.crosspost())
  }

  hasEmoji(exact: boolean = false): boolean {
    const regexp = exact ? /<a?:\w+?:\d+?>/g : /(<a?:\w+?:\d+?>|:\w+?:)/g
    return this.content.match(regexp) !== null
  }

  copyOptions(handleEmbeds: boolean = false): MessageOptions {
    return NicordTools.pipeMessage(this.original.client, this.original, handleEmbeds)
  }

  get channelId(): string {
    return this.original.channelId
  }

  get id(): string {
    return this.original.id
  }

  get partial(): boolean {
    return this.original.partial
  }

}
