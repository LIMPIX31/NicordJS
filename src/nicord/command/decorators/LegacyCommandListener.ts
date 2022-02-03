import { MetadataKeys } from '../../../utils/MetadataKeys'
import 'reflect-metadata'

export const LegacyCommandListener = target => {
  Reflect.defineMetadata(MetadataKeys.isCommandListener, true, target.prototype)
}

