import { NicordClient } from './client/NicordClient'
import { Snowflake, TextBasedChannel, TextChannel, User, Webhook } from 'discord.js'
import { ShadowUser } from './webhook/ShadowUser'
import { NicordClientException } from '../exceptions/NicordClient.exception'
import { DocumentData } from 'firebase-admin/firestore'
import * as chalk from 'chalk'

const colname = 'idcomparisons'

export type ChannelProxyOptions = {
  captureChannel: string | TextChannel | TextBasedChannel,
  destinationChannel: string | TextChannel | TextBasedChannel,
  bot?: boolean,
  webhookingToCaptureChannel: boolean,
  handleEmbeds?: boolean
}

export class ChannelProxy {
  private client?: NicordClient

  constructor(private options: ChannelProxyOptions) {
  }

  private async getWebhook(
    user: User,
    channel: TextChannel | TextBasedChannel,
  ): Promise<Webhook> {
    const client = this.getClient()
    return await new ShadowUser(client, { user, channel }).get()
  }

  private async getDestinationChannel(): Promise<TextChannel> {
    const client = this.getClient()
    const channel = typeof this.options.destinationChannel === 'string' ?
      client.channels.cache.find(v => v.id === this.options.destinationChannel) ?? await client.channels.fetch(this.options.destinationChannel)
      : this.options.destinationChannel
    if (!(channel instanceof TextChannel))
      throw new NicordClientException(
        'Proxy destination channel must be existent TextChannel',
      )
    return channel
  }

  private async getCaptureChannel(): Promise<TextChannel> {
    const client = this.getClient()
    const channel = typeof this.options.captureChannel === 'string' ?
      client.channels.cache.find(v => v.id === this.options.captureChannel) ?? await client.channels.fetch(this.options.captureChannel)
      : this.options.captureChannel
    if (!(channel instanceof TextChannel))
      throw new NicordClientException(
        'Proxy capture channel must be existent TextChannel',
      )
    return channel
  }

  /**
   * Please do not use this method, use {@link NicordClient#useProxy} instead.
   * @deprecated
   * @param client
   */
  bindClient(client: NicordClient) {
    this.client = client
    client.nion('messageCreate', async e => {
      try {
        if (e.author.bot) return
        const capture = await this.getCaptureChannel()
        const destination = await this.getDestinationChannel()
        if (e.channelId === destination.id && this.options.webhookingToCaptureChannel) {
          const webhook = await this.getWebhook(e.author, capture)
          const wmessage = await webhook.send(e.copyOptions(this.options.handleEmbeds))
          await this.addCom(e.id, wmessage.id, 'webhook')
        }
        if (e.channelId === capture.id) {
          if (this.options.bot) {
            const bmessage = await destination.send(e.copyOptions(this.options.handleEmbeds))
            await this.addCom(e.id, bmessage.id, 'bot')
          } else {
            const webhook = await this.getWebhook(e.author, destination)
            const wmessage = await webhook.send(e.copyOptions(this.options.handleEmbeds))
            await this.addCom(e.id, wmessage.id, 'webhook')
          }
        }
      } catch (e: any) {
        this.broadcastProxyChannelError(e.message)
      }
    })
    client.nion('messageUpdate', async (_, e) => {
      try {
        if (e.partial) e = await e.fetch()
        if (e.author?.bot) return
        const capture = await this.getCaptureChannel()
        const destination = await this.getDestinationChannel()
        if (e.channelId === capture.id) {
          const [comid, comtype] = await this.getCom(e.id)
          if (comid) {
            if (comtype === 'bot') {
              const bmessage = await destination.messages.fetch(comid)
              await bmessage.edit(e.copyOptions(this.options.handleEmbeds))
            } else {
              const webhook = await this.getWebhook(e.author, destination)
              await webhook.editMessage(comid, e.copyOptions(this.options.handleEmbeds))
            }
          }
        }
        if (e.channelId === destination.id) {
          const webhook = await this.getWebhook(e.author, capture)
          const cid = await this.getCom(e.id).then(v => v[0])
          if (cid) await webhook.editMessage(
            cid,
            e.copyOptions(this.options.handleEmbeds),
          )
        }
      } catch (e: any) {
        this.broadcastProxyChannelError(e.message)
      }
    })
    client.nion('messageDelete', async e => {
      try {
        if (e.partial) e = await e.fetch()
        if (e.author?.bot) return
        const capture = await this.getCaptureChannel()
        const destination = await this.getDestinationChannel()
        if (e.channelId === capture.id) {
          const [comid, comtype] = await this.getCom(e.id)
          if (comid) {
            if (comtype === 'bot') {
              const bmessage = await destination.messages.fetch(comid)
              await bmessage.delete()
            } else {
              const webhook = await this.getWebhook(e.author, destination)
              await webhook.deleteMessage(comid)
            }
          }
          await this.removeCom(e.id)
        }
        if (e.channelId === destination.id) {
          const webhook = await this.getWebhook(e.author, capture)
          const cid = await this.getCom(e.id).then(v => v[0])
          if (cid) await webhook.deleteMessage(cid)
          await this.removeCom(e.id)
        }
      } catch (e: any) {
        this.broadcastProxyChannelError(e.message)
      }
    })
  }

  async addCom(idc: Snowflake, id: Snowflake, type: 'webhook' | 'bot') {
    await this.getClient().getFirestore().collection(colname).add({ f: idc, t: id, type })
  }

  private async removeCom(idc: Snowflake) {
    await this.getClient().getFirestore()
      .collection(colname)
      .where('f', '==', idc)
      .get()
      .then(qs => {
        qs.forEach(doc => doc.ref.delete())
      })
  }

  private async getCom(idc: Snowflake): Promise<[Snowflake, 'bot' | 'webhook']> {
    return this.getClient().getFirestore()
      .collection(colname)
      .where('f', '==', idc)
      .get()
      .then(qs => new Promise<DocumentData | void>(r => {
        qs.forEach(v => r(v.data()))
        r()
      }))
      .then(res => [res?.t, res?.type])
  }

  private getClient(): NicordClient {
    if (!this.client) {
      throw new NicordClientException('Missing client')
    }
    return this.client
  }

  private broadcastProxyChannelError(message: any) {
    const client = this.getClient()
    client.log(chalk.gray(`Event from proxy channel [${this.options.captureChannel} -> ${this.options.destinationChannel}] throw exception: ${message}`))
  }

}
