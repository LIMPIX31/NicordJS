import { MessageButton, MessageButtonStyleResolvable } from 'discord.js'

export class NicordButton extends MessageButton {
  constructor(
    id: string,
    label: string,
    type: MessageButtonStyleResolvable,
    disabled: boolean = false,
  ) {
    super()
    this.setCustomId(id)
    this.setLabel(label)
    this.setStyle(type)
    this.setDisabled(disabled)
  }
}
