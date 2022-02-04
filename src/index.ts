import {
  AdminOnly,
  ArgsSplitter,
  BlacklistedRoles,
  BooleanOption,
  CommandHandler,
  CommandOptions,
  Description,
  IntegerOption,
  MentionableOption,
  Name,
  NumberOption,
  Prefix,
  RequiredPermissions,
  RoleOption,
  StringOption,
  Subcommands,
  UsePreset,
  UserOption,
  WhitelistedRoles,
} from './nicord/command/decorators/CommandHandler'
import { LegacyCommandListener } from './nicord/command/decorators/LegacyCommandListener'
import { SlashCommandListener } from './nicord/command/decorators/SlashCommandListener'
import { NicordLegacyCommand } from './nicord/command/NicordLegacyCommand'
import { IntentsFlags } from './nicord/client/IntentsFlags'
import { NicordClient } from './nicord/client/NicordClient'
import { NicordMessage } from './nicord/NicordMessage'
import { NicordPermissions } from './nicord/client/NicordPermissions'

export * from 'discord.js'

export {
  NicordClient,
  IntentsFlags,
  NicordPermissions,
  NicordMessage,
  NicordLegacyCommand,
  LegacyCommandListener,
  SlashCommandListener,
  CommandHandler,
  CommandOptions,
  Name,
  Prefix,
  Description,
  ArgsSplitter,
  AdminOnly,
  WhitelistedRoles,
  BlacklistedRoles,
  Subcommands,
  RequiredPermissions,
  UsePreset,
  StringOption,
  BooleanOption,
  IntegerOption,
  UserOption,
  RoleOption,
  MentionableOption,
  NumberOption,
}
