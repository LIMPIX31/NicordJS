import { MessageActionRow } from 'discord.js'
import { NicordButton } from './NicordButton'

export class ButtonRowComponent extends MessageActionRow {
  constructor(...buttons: NicordButton[]) {
    super()
    this.addComponents(...buttons)
  }
}
