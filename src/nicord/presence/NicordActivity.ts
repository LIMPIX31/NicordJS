import { ActivitiesOptions } from 'discord.js'

export class NicordActivity {
  private _options: ActivitiesOptions = {}
  private _refreshFn: Function | undefined

  get _data(): ActivitiesOptions {
    return this._options
  }

  playing(): NicordActivity {
    this._options.type = 'PLAYING'
    this.refresh()
    return this
  }

  streaming(): NicordActivity {
    this._options.type = 'STREAMING'
    this.refresh()
    return this
  }

  watching(): NicordActivity {
    this._options.type = 'WATCHING'
    this.refresh()
    return this
  }

  listening(): NicordActivity {
    this._options.type = 'LISTENING'
    this.refresh()
    return this
  }

  competing(): NicordActivity {
    this._options.type = 'COMPETING'
    this.refresh()
    return this
  }

  setName(name: string): NicordActivity {
    this._options.name = name
    this.refresh()
    return this
  }

  setUrl(url: string): NicordActivity {
    this._options.url = url
    this.refresh()
    return this
  }

  _refreshOptions(refreshCallback: Function): NicordActivity {
    this._refreshFn = refreshCallback
    return this
  }

  private refresh() {
    if (this._refreshFn) {
      this._refreshFn()
    }
  }

}
