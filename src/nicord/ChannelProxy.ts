import { NicordClient } from './client/NicordClient'
import { Snowflake, TextChannel, User, Webhook } from 'discord.js'
import { ShadowUser } from './webhook/ShadowUser'
import { NicordTools } from '../utils/NicordTools'
import { NicordClientException } from '../exceptions/NicordClient.exception'

export class ChannelProxy {

  private client?: NicordClient
  private comparisons: Record<Snowflake, Snowflake> = {}
  addCom: (idc: Snowflake, id: Snowflake, coms: Record<Snowflake, Snowflake>) => void = (idc, id, coms) => coms[idc] = id
  removeCom: (idc: Snowflake, coms: Record<Snowflake, Snowflake>) => void = (idc, coms) => delete coms[idc]
  getCom: (idc: Snowflake, coms: Record<Snowflake, Snowflake>) => Snowflake = (idc, coms) => coms[idc]


  constructor(private captureChannelId: string, private destination: string) {

  }

  private async getWebhook(client: NicordClient, user: User, channel: TextChannel): Promise<Webhook> {
    return await new ShadowUser(client, { user, channel }).get()
  }

  private async getDestinationChannel(client: NicordClient): Promise<TextChannel> {
    const channel = await client.channels.fetch(this.destination)
    if (!(channel instanceof TextChannel)) throw new NicordClientException('Proxy destination channel must be existent TextChannel')
    return channel
  }

  private async getCaptureChannel(client: NicordClient): Promise<TextChannel> {
    const channel = await client.channels.fetch(this.captureChannelId)
    if (!(channel instanceof TextChannel)) throw new NicordClientException('Proxy capture channel must be existent TextChannel')
    return channel
  }

  /**
   * Please do not use this method, use {@link NicordClient#useProxy} instead.
   * @deprecated
   * @param client
   */
  bindClient(client: NicordClient) {
    this.client = client
    client.on('messageCreate', async (e) => {
      if (e.author.bot) return
      if (e.channelId === this.destination) {
        const captureChannel = await this.getCaptureChannel(client)
        const webhook = await this.getWebhook(client, e.author, captureChannel)
        const wmessage = await webhook.send(NicordTools.pipeMessage(e))
        this.addCom(e.id, wmessage.id, this.comparisons)
      }
      if (e.channelId === this.captureChannelId) {
        const destination = await this.getDestinationChannel(client)
        const bmessage = await destination.send(NicordTools.pipeMessage(e))
        this.addCom(e.id, bmessage.id, this.comparisons)
      }
    })
    client.on('messageUpdate', async (_, e) => {
      if (e.partial) return
      if (e.author?.bot) return
      if (e.channelId === this.captureChannelId) {
        const destination = await this.getDestinationChannel(client)
        const bmessage = await destination.messages.fetch(this.getCom(e.id, this.comparisons))
        await bmessage.edit(NicordTools.pipeMessage(e))
      }
      if (e.channelId === this.destination) {
        const captureChannel = await this.getCaptureChannel(client)
        const webhook = await this.getWebhook(client, e.author, captureChannel)
        await webhook.editMessage(this.getCom(e.id, this.comparisons), NicordTools.pipeMessage(e))
      }
    })
    client.on('messageDelete', async (e) => {
      if (e.partial) return
      if (e.author?.bot) return
      if (e.channelId === this.captureChannelId) {
        const destination = await this.getDestinationChannel(client)
        const bmessage = await destination.messages.fetch(this.getCom(e.id, this.comparisons))
        await bmessage.delete()
      }
      if (e.channelId === this.destination) {
        const captureChannel = await this.getCaptureChannel(client)
        const webhook = await this.getWebhook(client, e.author, captureChannel)
        await webhook.deleteMessage(this.getCom(e.id, this.comparisons))
        this.removeCom(e.id, this.comparisons)
      }
    })
  }

}
