import { NicordMessage } from '../../nicord/NicordMessage'
import { NicordCommandInteraction } from '../../nicord/interaction/NicordCommandInteraction'

export type NicordMiddlewareType = 'message' | 'interaction' | 'command'
export type NicordMiddlewareParmas = NicordMessage | NicordCommandInteraction
export type NicordMiddlewareFunction = (entity: NicordMiddlewareParmas) => NicordMiddlewareParmas | Promise<NicordMiddlewareParmas>

export type NicordMiddleware = {
  type: NicordMiddlewareType
  middleware: NicordMiddlewareFunction
}
