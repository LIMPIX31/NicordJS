import { NicordClient } from './client/NicordClient'
import { Snowflake, TextChannel, User, Webhook } from 'discord.js'
import { ShadowUser } from './webhook/ShadowUser'
import { NicordTools } from '../utils/NicordTools'
import { NicordClientException } from '../exceptions/NicordClient.exception'
import { DocumentData, QueryDocumentSnapshot } from 'firebase-admin/firestore'

const colname = 'idcomparisons'

export class ChannelProxy {
  private client?: NicordClient
  private comparisons: Record<Snowflake, Snowflake> = {}

  constructor(private captureChannelId: string, private destination: string) {}

  private async getWebhook(
    client: NicordClient,
    user: User,
    channel: TextChannel,
  ): Promise<Webhook> {
    return await new ShadowUser(client, { user, channel }).get()
  }

  private async getDestinationChannel(
    client: NicordClient,
  ): Promise<TextChannel> {
    const channel = await client.channels.fetch(this.destination)
    if (!(channel instanceof TextChannel))
      throw new NicordClientException(
        'Proxy destination channel must be existent TextChannel',
      )
    return channel
  }

  private async getCaptureChannel(client: NicordClient): Promise<TextChannel> {
    const channel = await client.channels.fetch(this.captureChannelId)
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
    client.on('messageCreate', async e => {
      if (e.author.bot) return
      if (e.channelId === this.destination) {
        const captureChannel = await this.getCaptureChannel(client)
        const webhook = await this.getWebhook(client, e.author, captureChannel)
        const wmessage = await webhook.send(NicordTools.pipeMessage(e))
        await this.addCom(e.id, wmessage.id)
      }
      if (e.channelId === this.captureChannelId) {
        const destination = await this.getDestinationChannel(client)
        const bmessage = await destination.send(NicordTools.pipeMessage(e))
        await this.addCom(e.id, bmessage.id)
      }
    })
    client.on('messageUpdate', async (_, e) => {
      if (e.partial) e = await e.fetch()
      if (e.author?.bot) return
      if (e.channelId === this.captureChannelId) {
        const destination = await this.getDestinationChannel(client)
        const bmessage = await destination.messages.fetch(
          await this.getCom(e.id),
        )
        await bmessage.edit(NicordTools.pipeMessage(e))
      }
      if (e.channelId === this.destination) {
        const captureChannel = await this.getCaptureChannel(client)
        const webhook = await this.getWebhook(client, e.author, captureChannel)
        await webhook.editMessage(
          await this.getCom(e.id),
          NicordTools.pipeMessage(e),
        )
      }
    })
    client.on('messageDelete', async e => {
      if (e.partial) e = await e.fetch()
      if (e.author?.bot) return
      if (e.channelId === this.captureChannelId) {
        const destination = await this.getDestinationChannel(client)
        const bmessage = await destination.messages.fetch(
          await this.getCom(e.id),
        )
        await bmessage.delete()
      }
      if (e.channelId === this.destination) {
        const captureChannel = await this.getCaptureChannel(client)
        const webhook = await this.getWebhook(client, e.author, captureChannel)
        await webhook.deleteMessage(await this.getCom(e.id))
        await this.removeCom(e.id)
      }
    })
  }

  async addCom(idc: Snowflake, id: Snowflake) {
    const db = this.client?.getFirestore()
    if (db) {
      await db.collection(colname).add({ f: idc, t: id })
    } else {
      this.comparisons[idc] = id
    }
  }

  async removeCom(idc: Snowflake) {
    const db = this.client?.getFirestore()
    if (db) {
      await db
        .collection(colname)
        .where('f', '==', idc)
        .get()
        .then(qs => {
          qs.forEach(doc => doc.ref.delete())
        })
    } else {
      delete this.comparisons[idc]
    }
  }

  async getCom(idc: Snowflake): Promise<Snowflake> {
    const db = this.client?.getFirestore()
    if (db) {
      return db
        .collection(colname)
        .where('f', '==', idc)
        .get()
        .then(res => res[0])
        .then(res => res.data().t)
    } else {
      return this.comparisons[idc]
    }
  }
}
