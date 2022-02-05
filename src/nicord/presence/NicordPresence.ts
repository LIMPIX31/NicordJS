import { PresenceData } from 'discord.js'
import { NicordActivity } from './NicordActivity'
import { NicordClient } from '../client/NicordClient'

export class NicordPresence {

  private __client: NicordClient | undefined
  private _refresh: boolean = false
  private _activities: NicordActivity[] = []

  private __data: PresenceData = {}

  get _data(): PresenceData {
    return {
      ...this.__data,
      activities: [...this._activities.map(v => v._data)],
    }
  }

  addActivity(activity: NicordActivity): NicordPresence {
    if (!this.__data.activities) this.__data.activities = []
    this._activities.push(activity)
    this.applyRefreshCallbacks()
    this.refresh()
    return this
  }

  addActivities(...activities: NicordActivity[]): NicordPresence {
    if (!this.__data.activities) this.__data.activities = []
    this._activities.push(...activities)
    this.applyRefreshCallbacks()
    this.refresh()
    return this
  }

  removeAllActivities(): NicordPresence {
    this.__data.activities = []
    this.refresh()
    return this
  }

  removeActivity(activity: NicordActivity): NicordPresence {
    this._activities = this._activities.filter(v => v !== activity)
    return this
  }

  getActivity(): NicordActivity | undefined {
    return this._activities[0]
  }

  getActivities(): NicordActivity[] {
    return this._activities
  }

  setActivities(...activities: NicordActivity[]): NicordPresence {
    this._activities = [...activities]
    this.applyRefreshCallbacks()
    this.refresh()
    return this
  }

  setAfk(afk: boolean = true): NicordPresence {
    this.__data.afk = afk
    this.refresh()
    return this
  }

  setShardId(...ids: number[]): NicordPresence {
    this.__data.shardId = ids
    this.refresh()
    return this
  }

  online(): NicordPresence {
    this.__data.status = 'online'
    this.refresh()
    return this
  }

  invisible(): NicordPresence {
    this.__data.status = 'invisible'
    this.refresh()
    return this
  }

  idle(): NicordPresence {
    this.__data.status = 'idle'
    this.refresh()
    return this
  }

  dnd(): NicordPresence {
    this.__data.status = 'dnd'
    this.refresh()
    return this
  }

  refreshable(): NicordPresence {
    this._refresh = true
    return this
  }

  _setClient(client: NicordClient): NicordPresence {
    this.__client = client
    return this
  }

  private refresh(): void {
    if (this._refresh) {
      this.__client?.updatePresence()
    }
  }

  private applyRefreshCallbacks(): void {
    this._activities = this._activities.map(v => v._refreshOptions(this.refresh.bind(this)))
  }

}
