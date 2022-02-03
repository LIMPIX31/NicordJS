import {
  ApplicationCommand,
  CommandInteraction,
  Guild,
  GuildMember,
  InteractionReplyOptions,
  MessagePayload,
  User,
} from 'discord.js'
import { APIInteractionGuildMember } from 'discord-api-types/v9'

export class NicordCommandInteraction {
  private readonly _original: CommandInteraction

  protected constructor(original: CommandInteraction) {
    this._original = original
  }

  get original(): CommandInteraction {
    return this._original
  }

  get command(): ApplicationCommand | null {
    return this.original.command
  }

  get commandName(): string {
    return this.original.commandName
  }

  get fullCommandName(): string {
    return this.subcommandName ? `${this.commandName}/${this.subcommandName}` : this.commandName
  }

  get subcommandName(): string | null {
    return this.original.options.getSubcommand(false)
  }

  get user(): User {
    return this.original.user
  }

  get member(): GuildMember | APIInteractionGuildMember | null {
    return this.original.member
  }

  get guild(): Guild | null {
    return this.original.guild
  }

  static from(interaction: CommandInteraction): NicordCommandInteraction {
    return new NicordCommandInteraction(interaction)
  }

  getOption<T = string | number | boolean>(option: string): T | undefined {
    return this.original?.options.get(option)?.value as unknown as T
  }

  async defer(ephemeral: boolean = true, fetch: boolean = true) {
    await this.original.deferReply({
      ephemeral,
      fetchReply: fetch,
    })
  }

  async ephemeral(options: InteractionReplyOptions | string | number) {
    if (typeof options === 'string' || typeof options === 'number') {
      await this.original.reply({
        ephemeral: true,
        content: String(options),
      })
    } else {
      await this.original.reply({
        ...options,
        ephemeral: true,
      })
    }
  }

  async reply(options: string | MessagePayload | InteractionReplyOptions) {
    await this.original.reply(options)
  }

  async edit(options: string | MessagePayload | InteractionReplyOptions) {
    await this.original.editReply(options)
  }

}
