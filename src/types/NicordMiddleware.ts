export type NicordMiddlewareType = 'message' | 'interaction' | 'command'
export type NicordMiddlewareReturnType<T> = T | 'REJECT' | undefined | null | void
export type NicordMiddlewareFunction<T> = (
  entity: T,
) => NicordMiddlewareReturnType<T> | Promise<NicordMiddlewareReturnType<T>>

export type NicordMiddleware = {
  type: NicordMiddlewareType
  middleware: NicordMiddlewareFunction<any>
}
