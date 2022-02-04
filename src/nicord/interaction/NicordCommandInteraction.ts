import { ApplicationCommand, CommandInteraction } from 'discord.js'
import { NicordRepliableInteraction } from './NicordRepliableInteraction'

export class NicordCommandInteraction extends NicordRepliableInteraction<CommandInteraction> {
  get command(): ApplicationCommand | null {
    return this.original.command
  }

  get commandName(): string {
    return this.original.commandName
  }

  get fullCommandName(): string {
    return this.subcommandName
      ? `${this.commandName}/${this.subcommandName}`
      : this.commandName
  }

  get subcommandName(): string | null {
    return this.original.options.getSubcommand(false)
  }

  static from(interaction: CommandInteraction): NicordCommandInteraction {
    return new NicordCommandInteraction(interaction)
  }

  getOption<T = string | number | boolean>(option: string): T | undefined {
    return this.original?.options.get(option)?.value as unknown as T
  }
}
