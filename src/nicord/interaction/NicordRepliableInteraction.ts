import { NicordInteraction } from './NicordInteraction'
import {
  ButtonInteraction,
  CommandInteraction,
  ContextMenuInteraction,
  InteractionReplyOptions,
  MessagePayload,
  SelectMenuInteraction,
} from 'discord.js'

export class NicordRepliableInteraction<
  T extends
    | CommandInteraction
    | ButtonInteraction
    | ContextMenuInteraction
    | SelectMenuInteraction,
> extends NicordInteraction<T> {
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
