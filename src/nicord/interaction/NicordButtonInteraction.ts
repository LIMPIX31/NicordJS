import { ButtonInteraction } from 'discord.js'
import { NicordRepliableInteraction } from './NicordRepliableInteraction'

export class NicordButtonInteraction extends NicordRepliableInteraction<ButtonInteraction> {
  static from(interaction: ButtonInteraction): NicordButtonInteraction {
    return new NicordButtonInteraction(interaction)
  }
}
