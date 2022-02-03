import { MetadataKeys } from '../../../utils/MetadataKeys'

export const SlashCommandListener =  target => {
  Reflect.defineMetadata(MetadataKeys.isCommandListener, true, target.prototype)
  Reflect.defineMetadata(MetadataKeys.isSlash, true, target.prototype)
}
