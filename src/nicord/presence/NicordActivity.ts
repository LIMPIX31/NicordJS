import { ActivitiesOptions } from 'discord.js'

export class NicordActivity {
  private _options: ActivitiesOptions = {}

  get _data(): ActivitiesOptions {
    return this._options
  }

  playing(): NicordActivity {
    this._options.type = 'PLAYING'
    return this
  }

  streaming(): NicordActivity {
    this._options.type = 'STREAMING'
    return this
  }

  watching(): NicordActivity {
    this._options.type = 'WATCHING'
    return this
  }

  listening(): NicordActivity {
    this._options.type = 'LISTENING'
    return this
  }

  competing(): NicordActivity {
    this._options.type = 'COMPETING'
    return this
  }

  setName(name: string): NicordActivity {
    this._options.name = name
    return this
  }

  setUrl(url: string): NicordActivity {
    this._options.url = url
    return this
  }

}
