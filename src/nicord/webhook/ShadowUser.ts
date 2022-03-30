import { NicordClient } from '../client/NicordClient'
import {
  ChannelWebhookCreateOptions, TextBasedChannel,
  TextChannel,
  User,
  Webhook,
} from 'discord.js'
import { NicordClientException } from '../../exceptions/NicordClient.exception'
import { DocumentData } from 'firebase-admin/firestore'
import * as chalk from 'chalk'

const colname = 'webhookUsers'

export type ShadowUserOptions = {
  user: User | string
  channel: TextChannel | TextBasedChannel | string
}

export class ShadowUser {
  private webhook?: Webhook

  constructor(
    private client: NicordClient,
    private options: ShadowUserOptions,
  ) {
  }

  async get(): Promise<Webhook> {
    if (this.webhook) return this.webhook
    else {
      const channel = (
        typeof this.options.channel === 'string'
          ? await this.client.channels.fetch(this.options.channel)
          : this.options.channel
      ) as TextChannel
      const user =
        typeof this.options.user === 'string'
          ? await this.client.users.fetch(this.options.user)
          : this.options.user
      if (!user)
        throw new NicordClientException(
          `User with id: ${this.options.user} not found`,
        )
      const webhooks = await channel.fetchWebhooks()
      const findResult = webhooks.find(w => w.name === user.username)
      const userAvatar = user.avatarURL({ size: 256, format: 'png' })
      const db = this.client.getFirestore()
      if (findResult) {
        if (userAvatar) findResult.avatar = userAvatar
        return findResult
      } else {
        if (db) {
          const token = await db
            .collection('webhookUsers')
            .where('userId', '==', user.id)
            .where('channelId', '==', channel.id)
            .where('createdBy', '==', this.client.clientId)
            .get()
            .then(qs => new Promise<DocumentData | void>(r => {qs.forEach(v => r(v.data())); r()}))
            .then(res => res?.token)
          const dbFindResult = webhooks.find(w => w.token === token)
          if (dbFindResult) {
            if (userAvatar) dbFindResult.avatar = userAvatar
            dbFindResult.name = user.username
            return dbFindResult
          }
        }
      }
      const webhookOpts: ChannelWebhookCreateOptions = {}
      if (userAvatar) webhookOpts.avatar = userAvatar
      const newWebhook = await channel?.createWebhook(
        user.username,
        webhookOpts,
      )
      if (db)
        await db.collection(colname).add({
          userId: user.id,
          token: newWebhook.token,
          channelId: channel.id,
          createdBy: this.client.clientId,
        })
      this.client.log(
        chalk.gray(`Webhooking [${user.username}#${user.discriminator}/${user.id}] in (${channel.name}/${channel.id})`),
      )
      return newWebhook
    }
  }
}
