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
  UseGuard,
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
import { NicordSlashCommand } from './nicord/command/NicordSlashCommand'
import { ButtonRowComponent } from './nicord/ButtonRowComponent'
import { NicordButton } from './nicord/NicordButton'
import { NicordButtonInteraction } from './nicord/interaction/NicordButtonInteraction'
import { NicordCommandInteraction } from './nicord/interaction/NicordCommandInteraction'
import { NicordInteraction } from './nicord/interaction/NicordInteraction'
import { NicordRepliableInteraction } from './nicord/interaction/NicordRepliableInteraction'
import { CommandListener } from './types/CommandListener'
import { NicordMiddleware } from './types/NicordMiddleware'
import { NicordCommandError } from './nicord/NicordCommandError'
import { NicordPresence } from './nicord/presence/NicordPresence'
import { NicordActivity } from './nicord/presence/NicordActivity'

export * from 'discord.js'
export * from '@discordjs/voice'
export * from '@discordjs/builders'
export * from '@discordjs/collection'

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
  NicordSlashCommand,
  ButtonRowComponent,
  NicordButton,
  NicordButtonInteraction,
  NicordCommandInteraction,
  NicordInteraction,
  NicordRepliableInteraction,
  CommandListener,
  NicordMiddleware,
  NicordCommandError,
  UseGuard,
  NicordPresence,
  NicordActivity,
}
