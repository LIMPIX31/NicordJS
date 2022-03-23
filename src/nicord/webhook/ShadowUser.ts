import { NicordClient } from '../client/NicordClient'
import { ChannelWebhookCreateOptions, TextChannel, User, Webhook } from 'discord.js'
import { NicordClientException } from '../../exceptions/NicordClient.exception'

export type ShadowUserOptions = {
  user: User | string,
  channel: TextChannel | string
}

export class ShadowUser {

  private webhook?: Webhook

  constructor(private client: NicordClient, private options: ShadowUserOptions) {
  }

  async get(): Promise<Webhook> {
    if (this.webhook) return this.webhook
    else {
      const channel = (typeof this.options.channel === 'string' ? await this.client.channels.fetch(this.options.channel) : this.options.channel) as TextChannel
      const user = typeof this.options.user === 'string' ? await this.client.users.fetch(this.options.user) : this.options.user
      if (!user) throw new NicordClientException(`User with id: ${this.options.user} not found`)
      const findResult = (await channel.fetchWebhooks()).find(w => w.name === user.username)
      const userAvatar = user.avatarURL({ size: 256, format: 'png' })
      if (findResult) {
        if (userAvatar) findResult.avatar = userAvatar
        return findResult
      }
      const webhookOpts: ChannelWebhookCreateOptions = {}
      if (userAvatar) webhookOpts.avatar = userAvatar
      return channel?.createWebhook(user.username, webhookOpts)
    }
  }
}
