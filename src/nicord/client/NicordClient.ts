import { Client, Intents } from 'discord.js'
import { IntentsFlags } from './IntentsFlags'
import { NicordClientException } from '../../exceptions/NicordClient.exception'
import { CommandListener } from '../../types/CommandListener'
import { NicordTools } from '../../utils/NicordTools'
import {
  NicordMiddleware,
  NicordMiddlewareFunction,
  NicordMiddlewareReturnType,
  NicordMiddlewareType,
} from '../../types/NicordMiddleware'
import { NicordMessage } from '../NicordMessage'
import { CommandPipeline } from '../command/CommandPipeline'
import { REST } from '@discordjs/rest'
import { SlashCommandAutoBuilder } from '../command/SlashCommandAutoBuilder'
import { Routes } from 'discord-api-types/v9'
import { NicordCommandInteraction } from '../interaction/NicordCommandInteraction'
import { NicordButtonInteraction } from '../interaction/NicordButtonInteraction'
import { NicordPresence } from '../presence/NicordPresence'
import { ChannelProxy } from '../ChannelProxy'
import { App, initializeApp } from 'firebase-admin/app'
import admin from 'firebase-admin'
import { Firestore, getFirestore } from 'firebase-admin/firestore'
import * as chalk from 'chalk'

export type ButtonOnclickType = (
  interaction: NicordButtonInteraction,
  removeButton: () => void,
) => void

/**
 * <h1>NicordClient</h1>
 * And don't forget {@link IntentsFlags.GUILD_MESSAGES} to respond to participants' messages
 */
export class NicordClient extends Client {
  private nToken: string | undefined
  private started: boolean = false
  private commandListeners: CommandListener[] = []
  private middlewares: NicordMiddleware[] = []
  private nrest: REST = new REST({ version: '9' })
  private slashCommands: any = []
  private activeButtons: {
    id: string
    onClick: ButtonOnclickType
  }[] = []
  private defaultGuildId: string | undefined
  private localCommands: boolean = false
  private npresence: NicordPresence = new NicordPresence()
  private firebaseApp?: App
  private firestore?: Firestore
  private _debug: boolean = false

  constructor(
    flags: IntentsFlags[] = [IntentsFlags.GUILDS, IntentsFlags.GUILD_MESSAGES],
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

  debug() {
    this._debug = true
  }

  log(message: string) {
    if (this._debug) message.split('\n').forEach(m => console.log(chalk.blue.bold('NICORDJS') + chalk.reset(` ${m}`)))
  }

  set clientId(clientId: string) {
    this._clientId = clientId
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
    if (this.hasToken) {
      await this.login(this.nToken)
      this.setupEventListeners()
      if (this.localCommands && this.defaultGuildId) {
        await this.nrest.put(
          Routes.applicationGuildCommands(
            this?.user?.id || this?._clientId || '',
            this.defaultGuildId,
          ),
          {
            body: this.slashCommands,
          },
        )
      } else {
        await this.nrest.put(
          Routes.applicationCommands(this?.user?.id || this?._clientId || ''),
          {
            body: this.slashCommands,
          },
        )
      }
      this.started = true
      process.on('SIGINT', () => {
        this.log(chalk.red('Shutting down client'))
        process.exit(0)
      })
      this.log(chalk.green('Client started'))
      onReady && onReady()
    } else {
      throw new NicordClientException(
        'You need to assign a token before running the client',
      )
    }
  }

  addCommandListener(Listener: CommandListener) {
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

  useMiddleware<T>(
    type: NicordMiddlewareType,
    middleware: NicordMiddlewareFunction<T>,
  ) {
    this.middlewares.push({
      type,
      middleware,
    })
  }

  registerButton(id: string, onClick: ButtonOnclickType): void {
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
    this.user?.setPresence(this.npresence._data)
  }

  private setupEventListeners(): void {
    this.on('messageCreate', async message => {
      let msg = NicordMessage.from(message)

      try {
        msg = (await this.runMiddlewares('message', msg)) as NicordMessage
      } catch (e) {
        return
      }

      if (msg.author.id !== this.user?.id) {
        for (const listener of this.commandListeners) {
          if (!NicordTools.isSlashListener(listener)) {
            await CommandPipeline.legacyCommand(msg, listener)
          }
        }
      }
    })
    this.on('interactionCreate', async interaction => {
      if (interaction.isCommand()) {
        let cmd = NicordCommandInteraction.from(interaction)
        try {
          cmd = (await this.runMiddlewares(
            'command',
            cmd,
          )) as NicordCommandInteraction
        } catch (e) {
          return
        }
        for (const listener of this.commandListeners) {
          if (NicordTools.isSlashListener(listener)) {
            await CommandPipeline.slashCommand(cmd, listener)
          }
        }
      } else if (interaction.isButton()) {
        const id = interaction.customId
        const onClick = this.activeButtons.find(v => v.id === id)?.onClick
        if (onClick)
          onClick(NicordButtonInteraction.from(interaction), () => {
            this.activeButtons = this.activeButtons.filter(v => v.id !== id)
          })
      }
    })
  }

  private async runMiddlewares<T>(
    type: NicordMiddlewareType,
    value: T,
  ): Promise<NicordMiddlewareReturnType<T>> {
    for (const mw of this.middlewares) {
      if (mw.type === type) {
        try {
          const runResult = await mw.middleware(value)
          if (runResult === 'REJECT') throw new Error('Middleware rejected')
          if (runResult) value = runResult
        } catch (e) {
          this.log(chalk.yellow + `One of middlewares throw an exception: \n${e}`)
        }
      }
    }
    return value
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

  getFirestore(): Firestore | undefined {
    if (this.firestore) return this.firestore
    else {
      this.firestore = getFirestore(this.getFirebase())
      return this.firestore
    }
  }
}
