import { NicordRepliableInteraction } from './NicordRepliableInteraction'
import { ContextMenuInteraction } from 'discord.js'

export class NicordContextMenuInteraction extends NicordRepliableInteraction<ContextMenuInteraction> {
  static from(interaction: ContextMenuInteraction): NicordContextMenuInteraction {
    return new NicordContextMenuInteraction(interaction)
  }
}
