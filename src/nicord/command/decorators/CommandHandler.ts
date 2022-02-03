import { MetadataKeys } from '../../../utils/MetadataKeys'
import { NicordPermissions } from '../../NicordPermissions'
import { CommandListener } from '../../../types/interfaces/CommandListener'

export type SlashCommandField<C = unknown, T = unknown> = {
  type?: T
  name: string
  description?: string
  required?: boolean
  choices?: SlashCommandChoice<C>[]
}

export type SlashCommandChoice<T> = [k: string, v: T]

export type StringSlashCommandField = Omit<
  SlashCommandField<string, 'string'>,
  'type'
>
export type NumberSlashCommandField = Omit<
  SlashCommandField<number, 'number'>,
  'type'
>
export type IntegerSlashCommandField = Omit<
  SlashCommandField<number, 'integer'>,
  'type'
>
export type UserSlashCommandField = Omit<
  SlashCommandField<number, 'user'>,
  'type'
>
export type RoleSlashCommandField = Omit<
  SlashCommandField<number, 'role'>,
  'type'
>
export type MentionableSlashCommandField = Omit<
  SlashCommandField<number, 'mentionable'>,
  'type'
>
export type BooleanSlashCommandField = Omit<
  SlashCommandField<boolean, 'boolean'>,
  'choices' | 'type'
>

export type CommandOptions = Partial<{
  prefix: string
  name: string
  description: string
  argsSplitter: string | RegExp
  adminOnly: boolean
  rolesWhitelist: string[]
  rolesBlacklist: string[]
  fields: SlashCommandField[]
  subcommands: CommandListener
  arguments: string[]
  permissions: NicordPermissions[],
  parentCommand: string
}>

const assignMetadata = (target, propertyKey, obj: CommandOptions) => {
  if (propertyKey) {
    Reflect.defineMetadata(
      MetadataKeys.commandHandlerOptions,
      {
        ...Reflect.getMetadata(
          MetadataKeys.commandHandlerOptions,
          target,
          propertyKey,
        ),
        ...obj,
      } as CommandOptions,
      target,
      propertyKey,
    )
  } else {
    Reflect.defineMetadata(
      MetadataKeys.commandHandlerOptions,
      {
        ...Reflect.getMetadata(
          MetadataKeys.commandHandlerOptions,
          target.prototype,
        ),
        ...obj,
      } as CommandOptions,
      target.prototype,
    )
  }
}

const getOptions = (target, propertyKey): CommandOptions => {
  if (propertyKey) {
    return Reflect.getMetadata(
      MetadataKeys.commandHandlerOptions,
      target,
      propertyKey,
    )
  } else {
    return Reflect.getMetadata(
      MetadataKeys.commandHandlerOptions,
      target.prototype,
    )
  }
}

const addOption = (
  target,
  propertyKey,
  option: SlashCommandField,
  type: string,
) => {
  const options = getOptions(target, propertyKey) || {}
  const fields = options.fields || []
  option.type = type
  fields.unshift(option)
  assignMetadata(target, propertyKey, { fields: [...fields] })
}

export const CommandHandler = (target, propertyKey) => {
  Reflect.defineMetadata(
    MetadataKeys.isCommandHandler,
    true,
    target,
    propertyKey,
  )
}

export const Name = (name: string) => (target, propertyKey) => {
  assignMetadata(target, propertyKey, { name })
}

export const Prefix = (prefix: string) => (target, propertyKey?: string) => {
  assignMetadata(target, propertyKey, { prefix })
}

export const Description = (description: string) => (target, propertyKey) => {
  assignMetadata(target, propertyKey, { description })
}

export const ArgsSplitter =
  (argsSplitter: string | RegExp) => (target, propertyKey?: string) => {
    assignMetadata(target, propertyKey, { argsSplitter })
  }

export const AdminOnly = (target, propertyKey?: string) => {
  assignMetadata(target, propertyKey, { adminOnly: true })
}

export const WhitelistedRoles =
  (...roles: string[]) =>
  (target, propertyKey?: string) => {
    assignMetadata(target, propertyKey, { rolesWhitelist: roles })
  }

export const BlacklistedRoles =
  (...roles: string[]) =>
  (target, propertyKey?: string) => {
    assignMetadata(target, propertyKey, { rolesBlacklist: roles })
  }

export const StringOption =
  (option: StringSlashCommandField) => (target, propertyKey) => {
    addOption(target, propertyKey, option, 'string')
  }

export const NumberOption =
  (option: NumberSlashCommandField) => (target, propertyKey) => {
    addOption(target, propertyKey, option, 'number')
  }

export const BooleanOption =
  (option: BooleanSlashCommandField) => (target, propertyKey) => {
    addOption(target, propertyKey, option, 'boolean')
  }

export const UserOption =
  (option: UserSlashCommandField) => (target, propertyKey) => {
    addOption(target, propertyKey, option, 'user')
  }

export const MentionableOption =
  (option: MentionableSlashCommandField) => (target, propertyKey) => {
    addOption(target, propertyKey, option, 'mentionable')
  }

export const IntegerOption =
  (option: IntegerSlashCommandField) => (target, propertyKey) => {
    addOption(target, propertyKey, option, 'mentionable')
  }

export const RoleOption =
  (option: RoleSlashCommandField) => (target, propertyKey) => {
    addOption(target, propertyKey, option, 'mentionable')
  }

export const Subcommands =
  (subcommands: CommandListener) => (target, propertyKey) => {
    assignMetadata(target, propertyKey, { subcommands })
  }

export const RequiredPermissions =
  (...permissions: NicordPermissions[]) =>
  (target, propertyKey) => {
    assignMetadata(target, propertyKey, { permissions })
  }

// export const Arguments = (...args: string[]) => (target, propertyKey) => {
//   assignMetadata(target, propertyKey, { arguments: args })
// }

export const UsePreset =
  (...presets: CommandOptions[]) =>
  (target, propertyKey) => {
    assignMetadata(target, propertyKey, {
      ...presets.reduce((p, c) => {
        return Object.assign({}, p, c)
      }),
    })
  }
