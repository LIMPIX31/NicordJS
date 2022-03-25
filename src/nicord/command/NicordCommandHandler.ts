import { CommandOptions, SlashCommandField } from './decorators/CommandHandler'
import { MetadataKeys } from '../../utils/MetadataKeys'
import { NicordTools } from '../../utils/NicordTools'
import { NicordClientException } from '../../exceptions/NicordClient.exception'
import { NicordLegacyCommand } from './NicordLegacyCommand'
import { GuildMemberRoleManager, Permissions } from 'discord.js'
import { CommandListener } from '../../types/CommandListener'
import { NicordMessage } from '../NicordMessage'
import { NicordCommandInteraction } from '../interaction/NicordCommandInteraction'
import { NicordPermissions } from '../client/NicordPermissions'
import { NicordSlashCommand } from './NicordSlashCommand'
import { NicordCommandError } from '../NicordCommandError'

export class NicordCommandHandler {
  constructor(private fn: Function, private options: CommandOptions) {
  }

  get prefix(): string {
    return this.options.prefix || '!'
  }

  get name(): string | undefined {
    return this.options.name
  }

  get fields(): SlashCommandField[] {
    return this.options.fields || []
  }

  get adminOnly(): boolean {
    return !!this.options.adminOnly
  }

  get argsSplitter(): string | RegExp {
    return this.options.argsSplitter || ' '
  }

  get restrictedAccess(): boolean {
    return !!(this.rolesWhitelist || this.rolesBlacklist || this.adminOnly)
  }

  get rolesWhitelist(): string[] | undefined {
    return this.options.rolesWhitelist
  }

  get rolesBlacklist(): string[] | undefined {
    return this.options.rolesBlacklist
  }

  get permissions(): NicordPermissions[] | undefined {
    return this.options.permissions
  }

  get description(): string | undefined {
    return this.options.description
  }

  get subcommands(): CommandListener | undefined {
    return this.options.subcommands
  }

  get parentCommand(): string | undefined {
    return this.options.parentCommand
  }

  get fullCommandName(): string | undefined {
    return this.parentCommand ? `${this.parentCommand}/${this.name}` : this.name
  }

  get global(): boolean {
    return this.options.global || false
  }

  get guard(): Function {
    return this.options.guard || (() => true)
  }

  static fromListener(
    Listener: CommandListener,
    parent?: string,
  ): NicordCommandHandler[] {
    if (!NicordTools.isCommandListener(Listener))
      throw new NicordClientException(
        'Value must be valid command listener. Check if you are using the right decorator.',
      )
    const listenerOptions: CommandOptions = Reflect.getMetadata(
      MetadataKeys.commandHandlerOptions,
      Listener.prototype,
    )
    const handlers: NicordCommandHandler[] = []
    for (const protokey of Object.getOwnPropertyNames(Listener.prototype)) {
      const method = Listener.prototype[protokey]
      if (
        Reflect.hasMetadata(
          MetadataKeys.isCommandHandler,
          Listener.prototype,
          protokey,
        )
      ) {
        const handlerOptions: CommandOptions = Reflect.getMetadata(
          MetadataKeys.commandHandlerOptions,
          Listener.prototype,
          protokey,
        )
        handlers.push(
          new NicordCommandHandler(
            method,
            Object.assign(
              {},
              listenerOptions,
              handlerOptions,
              parent ? ({ parentCommand: parent } as CommandOptions) : {},
            ),
          ),
        )
      }
    }
    return handlers
  }

  async executableFor(
    msg: NicordMessage | NicordCommandInteraction,
  ): Promise<boolean> {
    if (this.restrictedAccess) {
      let allowed = false
      const guild = await msg.guild
      if (guild) {
        let allowedRoles = NicordTools.deduceValues(guild.roles.cache.map(role => role.id))
        if (
          msg.member &&
          msg.member.roles instanceof GuildMemberRoleManager &&
          msg.member.permissions instanceof Permissions
        ) {
          allowed =
            msg.member.roles.cache
              .filter(dr => allowedRoles.includes(dr.id))
              .map(v => v).length > 0
          if (this.adminOnly)
            allowed = msg.member.permissions.has('ADMINISTRATOR')
          if (this.permissions)
            allowed = msg.member.permissions.has(
              this.permissions.map(v => Permissions.FLAGS[v]),
            )
        }
        return allowed
      }
      return true
    } else {
      return true
    }
  }

  async execute(
    entity: NicordMessage | NicordCommandInteraction,
  ): Promise<void> {
    if (entity instanceof NicordMessage) {
      const msg = entity
      const args = msg.content.split(this.argsSplitter)
      if (
        msg.content.startsWith(this.prefix) &&
        args[0] === this.prefix + this.name
      ) {
        const cmd = new NicordLegacyCommand(msg.original, args.slice(1))
        if (await this.executableFor(msg)) {
          const doExecute = !!(await this.guard(cmd))
          if (doExecute) {
            await this.fn(cmd)
          }
        } else {
          const error = new NicordCommandError()
          error.unpermitted = true
          await this.guard(cmd, error)
        }
      }
    } else if (entity instanceof NicordCommandInteraction) {
      const cmd = entity
      if (this.fullCommandName === cmd.fullCommandName) {
        if (await this.executableFor(cmd)) {
          const doExecute = !!(await this.guard(new NicordSlashCommand(cmd)))
          if (doExecute) {
            await this.fn(new NicordSlashCommand(cmd))
          }
        } else {
          const error = new NicordCommandError()
          error.unpermitted = true
          await this.guard(new NicordSlashCommand(cmd), error)
        }
      }
    }
  }
}
