import { Guild, GuildMember, Interaction, User } from 'discord.js'
import { OriginalShadow } from '../../utils/OriginalShadow'
import { APIInteractionGuildMember } from 'discord-api-types/v9'
import { NicordCommandInteraction } from './NicordCommandInteraction'
import { NicordButtonInteraction } from './NicordButtonInteraction'
import { NicordContextMenuInteraction } from './NicordContextMenuInteraction'
import { NicordSelectMenuInteraction } from './NicordSelectMenuInteraction'

export class NicordInteraction<
  T extends Interaction,
> extends OriginalShadow<T> {
  get user(): User {
    return this.original.user
  }

  get member(): GuildMember | APIInteractionGuildMember | null {
    return this.original.member as
      | GuildMember
      | APIInteractionGuildMember
      | null
  }

  get guild(): Guild | null {
    return this.original.guild
  }

  isCommand(): this is NicordCommandInteraction {
    return this.original.isCommand()
  }

  isButton(): this is NicordButtonInteraction {
    return this.original.isButton()
  }

  isContextMenu(): this is NicordContextMenuInteraction {
    return this.original.isContextMenu()
  }

  isSelectMenu(): this is NicordSelectMenuInteraction {
    return this.original.isSelectMenu()
  }

  get inGuild(): boolean {
    return this.original.inGuild()
  }

  static from(interaction: Interaction) {
    return new NicordInteraction(interaction)
  }
}
