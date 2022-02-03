import { NicordCommandInteraction } from '../interaction/NicordCommandInteraction'

export class NicordSlashCommand extends NicordCommandInteraction {

  constructor(interaction: NicordCommandInteraction) {
    super(interaction.original)
  }

}
