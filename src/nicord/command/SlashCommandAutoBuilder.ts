import {
  SlashCommandChoice,
  SlashCommandField,
} from './decorators/CommandHandler'
import {
  SlashCommandBooleanOption,
  SlashCommandBuilder,
  SlashCommandIntegerOption,
  SlashCommandMentionableOption,
  SlashCommandNumberOption,
  SlashCommandRoleOption,
  SlashCommandStringOption,
  SlashCommandSubcommandBuilder,
  SlashCommandUserOption,
} from '@discordjs/builders'
import { CommandListener } from '../../types/interfaces/CommandListener'
import { NicordTools } from '../NicordTools'
import { NicordClientException } from '../../exceptions/NicordClient.exception'
import { NicordCommandHandler } from './NicordCommandHandler'

type SlashOption =
  | SlashCommandBooleanOption
  | SlashCommandStringOption
  | SlashCommandNumberOption
  | SlashCommandIntegerOption
  | SlashCommandUserOption
  | SlashCommandRoleOption
  | SlashCommandMentionableOption

export abstract class SlashCommandAutoBuilder {
  static createSlashCommands(Listener: CommandListener) {
    const result: any = []
    const commands = this.buildSlashCommandsFromListener(Listener)
    for (const command of commands) {
      result.push(command.toJSON())
    }
    return result
  }

  private static buildSlashCommandFromHandler(
    handler: NicordCommandHandler,
    command: SlashCommandBuilder | SlashCommandSubcommandBuilder,
  ) {
    if (!handler.name || !handler.description)
      throw new NicordClientException(
        'Name and Description are required for slash command',
      )
    command.setName(handler.name).setDescription(handler.description)

    for (let field of handler.fields) {
      if (!field.name || !field.description)
        throw new NicordClientException(
          'Name and Description are required for fields of slash command',
        )
      switch (field.type) {
        case 'string':
          command.addStringOption(option => {
            this.applyNDR(field, option)
            if (field.choices && field.choices.length > 0)
              option.addChoices(field.choices as SlashCommandChoice<string>[])
            return option
          })
          break
        case 'number':
          command.addNumberOption(option => {
            this.applyNDR(field, option)
            if (field.choices && field.choices.length > 0)
              option.addChoices(field.choices as SlashCommandChoice<number>[])
            return option
          })
          break
        case 'boolean':
          command.addBooleanOption(option => {
            this.applyNDR(field, option)
            return option
          })
          break
        case 'integer':
          command.addIntegerOption(option => {
            this.applyNDR(field, option)
            if (field.choices && field.choices.length > 0)
              option.addChoices(field.choices as SlashCommandChoice<number>[])
            return option
          })
          break
        case 'user':
          command.addUserOption(option => {
            this.applyNDR(field, option)
            return option
          })
          break
        case 'role':
          command.addRoleOption(option => {
            this.applyNDR(field, option)
            return option
          })
          break
        case 'mentionable':
          command.addRoleOption(option => {
            this.applyNDR(field, option)
            return option
          })
          break
      }
    }

    if (handler.subcommands && command instanceof SlashCommandBuilder) {
      const subcommands = this.buildSlashCommandsFromListener(
        handler.subcommands,
        true,
      )
      for (const sub of subcommands) {
        command.addSubcommand(<SlashCommandSubcommandBuilder>sub)
      }
    }

    return command
  }

  private static buildSlashCommandsFromListener(
    Listener: CommandListener,
    subcommands: boolean = false,
  ) {
    if (
      !(
        NicordTools.isCommandListener(Listener) &&
        NicordTools.isSlashListener(Listener)
      )
    )
      throw new NicordClientException(
        'Listener must be valid slash command listener',
      )
    const commands: (SlashCommandBuilder | SlashCommandSubcommandBuilder)[] = []
    for (const handler of NicordCommandHandler.fromListener(Listener)) {
      if (subcommands) {
        commands.push(
          this.buildSlashCommandFromHandler(
            handler,
            new SlashCommandSubcommandBuilder(),
          ),
        )
      } else {
        commands.push(
          this.buildSlashCommandFromHandler(handler, new SlashCommandBuilder()),
        )
      }
    }
    return commands
  }

  private static applyNDR(field: SlashCommandField, option: SlashOption) {
    option.setName(field.name).setRequired(field.required || true)
    field.description && option.setDescription(field.description)
  }
}
