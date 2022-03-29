import { NicordRepliableInteraction } from './NicordRepliableInteraction'
import { ButtonInteraction, ContextMenuInteraction, SelectMenuInteraction } from 'discord.js'

export class NicordSelectMenuInteraction extends NicordRepliableInteraction<SelectMenuInteraction> {
  static from(interaction: SelectMenuInteraction): NicordSelectMenuInteraction {
    return new NicordSelectMenuInteraction(interaction)
  }

  get values(): string[] {
    return this.original.values
  }

}
