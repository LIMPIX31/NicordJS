import { NicordClient as INicordClient } from '../types/interfaces/NicordClient'
import { Client, Intents } from 'discord.js'
import { IntentsFlags } from './IntentsFlags'
import { NicordClientException } from '../exceptions/NicordClient.exception'

export class NicordClient extends Client implements INicordClient {

  private nToken: string | undefined
  private started: boolean = false

  constructor(flags: IntentsFlags[]) {
    super({
      intents: [
        flags.map(flag => Intents.FLAGS[flag]),
      ],
    })
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

  setToken(token: string): void {
    if (this.isNotStarted) {
      this.nToken = token
    } else {
      throw new NicordClientException('The token must be assigned to the client before starting')
    }
  }

  async start(onReady?: () => void): Promise<void> {
    if (this.hasToken) {
      await this.login(this.nToken)
      onReady && onReady()
    } else {
      throw new NicordClientException('You need to assign a token before running the client')
    }
  }


}
