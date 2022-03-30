import { Awaitable, Client, Intents } from 'discord.js'
import { IntentsFlags } from './IntentsFlags'
import { NicordClientException } from '../../exceptions/NicordClient.exception'
import { CommandListener } from '../../types/CommandListener'
import { LogLevel, NicordTools } from '../../utils/NicordTools'
import { CommandPipeline } from '../command/CommandPipeline'
import { REST } from '@discordjs/rest'
import { SlashCommandAutoBuilder } from '../command/SlashCommandAutoBuilder'
import { Routes } from 'discord-api-types/v9'
import { NicordButtonInteraction } from '../interaction/NicordButtonInteraction'
import { NicordPresence } from '../presence/NicordPresence'
import { ChannelProxy } from '../ChannelProxy'
import { App, initializeApp } from 'firebase-admin/app'
import admin from 'firebase-admin'
import { Firestore, getFirestore } from 'firebase-admin/firestore'
import * as chalk from 'chalk'
import { NicordClientEvents } from './NicordClientEvents'

export type ButtonOnclickType = (
  interaction: NicordButtonInteraction,
  removeButton: () => void,
) => void

/**
 * <h1>NicordClient</h1>
 * And don't forget {@link IntentsFlags.GUILD_MESSAGES} to respond to participants' messages
 */
export class NicordClient extends Client {
  private nToken?: string
  private started: boolean = false
  private commandListeners: CommandListener[] = []
  private nrest: REST = new REST({ version: '9' })
  private slashCommands: any = []
  private activeButtons: {
    id: string
    onClick: ButtonOnclickType
  }[] = []
  private defaultGuildId?: string
  private localCommands: boolean = false
  private npresence: NicordPresence = new NicordPresence()
  private firebaseApp?: App
  private firestore?: Firestore
  private _debug: boolean = false
  private middlewares: Record<string, ((...args: any) => Awaitable<void | 'REJECT'>)[]> = {}
  private loglevel?: LogLevel

  constructor(
    private flags: IntentsFlags[] = [IntentsFlags.GUILDS, IntentsFlags.GUILD_MESSAGES],
  ) {
    super({
      intents: flags.includes(IntentsFlags.ALL)
        ? Object.values(Intents.FLAGS)
        : [flags.map(flag => Intents.FLAGS[flag])],
      partials: [
        'USER',
        'CHANNEL',
        'REACTION',
        'MESSAGE',
        'GUILD_MEMBER',
        'GUILD_SCHEDULED_EVENT',
      ],
    })
  }

  private _clientId: string | undefined

  debug(level: LogLevel = LogLevel.EXTRA) {
    this.loglevel = level
    this._debug = true
  }

  log(level: LogLevel, message: string) {
    NicordTools.log(this._debug, level, message, this.loglevel ?? LogLevel.EXTRA)
  }

  get clientId(): string | undefined {
    return this._clientId
  }

  get isNotStarted(): boolean {
    return !this.started
  }

  get isStarted(): boolean {
    return this.started
  }

  get hasntToken(): boolean {
    return !this.nToken
  }

  get hasToken(): boolean {
    return !this.hasntToken
  }

  set defaultGuild(guildId: string) {
    this.defaultGuildId = guildId
  }

  localSlashCommands(): void {
    if (!this.defaultGuildId)
      throw new NicordClientException(
        'You must specify the default guild to make the commands local',
      )
    this.localCommands = true
  }

  setToken(token: string): void {
    if (this.isNotStarted) {
      this.nToken = token
      this.nrest.setToken(token)
    } else {
      throw new NicordClientException(
        'The token must be assigned to the client before starting',
      )
    }
  }

  async start(onReady?: () => void): Promise<void> {
    console.log(NicordTools.getCredits())
    if (this.flags.includes(IntentsFlags.ALL)) this.log(LogLevel.WARN, 'Dangerous permission "ALL".\nIf you are using the bot in production,\nwe recommend that you restrict permissions and\nstop using IntentFlags.ALL, as this can create vulnerabilities.\nIf you are developing and testing your bot,\nyou can ignore this message.')
    if (this.hasToken) {
      try {
        await this.login(this.nToken)
        this.log(LogLevel.EXTRA, 'Logged in successful')
        this._clientId = this?.application?.id
        this.log(LogLevel.EXTRA, 'Setting up event listeners')
        this.setupEventListeners()
        this.log(LogLevel.EXTRA, 'Setting up slash commands')
        if (this.localCommands && this.defaultGuildId) {
          await this.nrest.put(
            Routes.applicationGuildCommands(
              this?.application?.id || this?._clientId || '',
              this.defaultGuildId,
            ),
            {
              body: this.slashCommands,
            },
          )
        } else {
          await this.nrest.put(
            Routes.applicationCommands(this?.application?.id || this?._clientId || ''),
            {
              body: this.slashCommands,
            },
          )
        }
        this.started = true
        process.on('SIGINT', () => {
          this.log(LogLevel.INFO, chalk.red('Shutting down client'))
          process.exit(0)
        })
        process.on('SIGTERM', () => {
          this.log(LogLevel.INFO, chalk.red('Shutting down client'))
          process.exit(0)
        })
        this.log(LogLevel.INFO, chalk.green('Client started'))
        onReady && onReady()
      } catch (e) {
        this.log(LogLevel.ERROR, 'Failed to start client')
      }
    } else {
      throw new NicordClientException(
        'You need to assign a token before running the client',
      )
    }
  }

  addCommandListener(Listener: CommandListener) {
    this.log(LogLevel.EXTRA, `Added new command listener: ${Listener.name}`)
    if (!NicordTools.isCommandListener(Listener))
      throw this.invalidCommandListenerException()
    this.commandListeners.push(Listener)
    if (NicordTools.isSlashListener(Listener)) {
      this.slashCommands.push(
        ...SlashCommandAutoBuilder.createSlashCommands(Listener),
      )
    }
  }

  removeCommandListener(Listener: CommandListener) {
    this.log(LogLevel.EXTRA, `Removed command listener: ${Listener.name}`)
    if (NicordTools.isCommandListener(Listener)) {
      this.commandListeners = this.commandListeners.filter(l => l !== Listener)
    } else {
      throw this.invalidCommandListenerException()
    }
  }

  hasListener(Listener: CommandListener): boolean {
    if (NicordTools.isCommandListener(Listener)) {
      return this.commandListeners.includes(Listener)
    } else {
      throw this.invalidCommandListenerException()
    }
  }


  registerButton(id: string, onClick: ButtonOnclickType): void {
    this.log(LogLevel.EXTRA, `Registered button with id: ${id}`)
    if (!this.activeButtons.find(v => v.id === id))
      this.activeButtons.push({ id, onClick })
    else throw new NicordClientException(`Duplicated button id: ${id}`)
  }

  setPresence(presence: NicordPresence) {
    if (this.isNotStarted)
      throw new NicordClientException('Presence can only be set after startup')
    this.npresence = presence._setClient(this)
    this.user?.setPresence(this.npresence._data)
  }

  updatePresence(): void {
    this.log(LogLevel.EXTRA, 'Updating presence')
    this.user?.setPresence(this.npresence._data)
  }

  private setupEventListeners(): void {
    this.nion('messageCreate', async msg => {
      if (msg.author.id !== this.user?.id) {
        for (const listener of this.commandListeners) {
          if (!NicordTools.isSlashListener(listener)) {
            await CommandPipeline.legacyCommand(msg, listener)
          }
        }
      }
    })
    this.nionce('interactionCreate', async interaction => {
      if (interaction.isCommand()) {
        for (const listener of this.commandListeners) {
          if (NicordTools.isSlashListener(listener)) {
            await CommandPipeline.slashCommand(interaction, listener)
          }
        }
      } else if (interaction.isButton()) {
        const id = interaction.original.customId
        const onClick = this.activeButtons.find(v => v.id === id)?.onClick
        if (onClick)
          onClick(interaction, () => {
            this.activeButtons = this.activeButtons.filter(v => v.id !== id)
          })
      }
    })
  }


  private invalidCommandListenerException() {
    return new NicordClientException(
      'Value must be valid command listener. Check if you are using the right decorator.',
    )
  }

  useProxy(proxy: ChannelProxy) {
    proxy.bindClient(this)
  }

  setFirebase(config: Object, credentials: Object) {
    this.firebaseApp = initializeApp({
      ...config,
      credential: admin.credential.cert(credentials),
    })
  }

  getFirebase(): App | undefined {
    return this.firebaseApp
  }

  getFirestore(): Firestore {
    if (this.firestore) return this.firestore
    else {
      this.firestore = getFirestore(this.getFirebase())
      if (!this.firestore) {
        this.log(LogLevel.ERROR, 'Firebase required!')
        this.log(LogLevel.ERROR, 'Part of your application requires Firebase, the configuration of which has not been provided.')
        process.kill(process.pid, 'SIGINT')
      }
      return this.firestore
    }
  }

  nion<K extends keyof NicordClientEvents>(event: K, listener: (...args: NicordClientEvents[K]) => Awaitable<void>): () => void {
    const l = NicordTools.wrapEventListener(event, this, this.middlewares[event] ?? [], listener)
    super.on(event, l)
    return () => {
      super.off(event, l)
    }
  }

  nionce<K extends keyof NicordClientEvents>(event: K, listener: (...args: NicordClientEvents[K]) => Awaitable<void>): () => void {
    const l = NicordTools.wrapEventListener(event, this, this.middlewares[event] ?? [], listener)
    super.once(event, l)
    return () => {
      super.off(event, l)
    }
  }

  /**
   * Transpiles emoji like :Hyper_Blob: to `<a:Hyper_Blob:853516137047261205>`
   * @param emojiString - is a string like `:EmojiName:` `$EmojiID$` or string contain that
   */
  transpileEmoji(emojiString: string): string {
    return NicordTools.transpileEmojis(this, emojiString)
  }

  useMiddleware<K extends keyof NicordClientEvents>(event: K, listener: (...args: NicordClientEvents[K]) => Awaitable<void | 'REJECT'>) {
    this.middlewares[event] = [...(this.middlewares[event] ?? []), listener]
  }

}
