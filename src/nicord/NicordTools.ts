import { CommandListener } from '../types/interfaces/CommandListener'
import 'reflect-metadata'
import { MetadataKeys } from '../utils/MetadataKeys'

export abstract class NicordTools {
  static isCommandListener(Listener: CommandListener) {
    return Reflect.hasMetadata(
      MetadataKeys.isCommandListener,
      Listener.prototype,
    )
  }

  static isSlashListener(Listener: CommandListener) {
    return Reflect.hasMetadata(MetadataKeys.isSlash, Listener.prototype)
  }

  static applyDefaults<T>(input: T, defaults: T): T {
    return Object.assign({}, defaults, input)
  }
}
