import { Guild, GuildMember, Interaction, User } from 'discord.js'
import { OriginalShadow } from '../../utils/OriginalShadow'
import { APIInteractionGuildMember } from 'discord-api-types/v9'

export abstract class NicordInteraction<T extends Interaction,
  > extends OriginalShadow<T> {
  get user(): User {
    return this.original.user
  }

  get member(): GuildMember | APIInteractionGuildMember | null {
    return this.original.member as GuildMember | APIInteractionGuildMember | null
  }

  get guild(): Guild | null {
    return this.original.guild
  }

  get isCommand(): boolean {
    return this.original.isCommand()
  }

  get isButton(): boolean {
    return this.original.isButton()
  }

  get isContextMenu(): boolean {
    return this.original.isContextMenu()
  }

  get isSelectMenu(): boolean {
    return this.original.isContextMenu()
  }

  get inGuild(): boolean {
    return this.original.inGuild()
  }
}
