/**
 * <h1>NicordClient</h1>
 */
export interface NicordClient {
  /**
   * Sets the discord token for the client.
   * Must be set before the client starts, otherwise a [NicordClientException]{@link NicordClientException} will be thrown
   * @param {string} token
   * @example
   * NicordClient#setToken('myToken')
   */
  setToken(token: string): void

  get isStarted(): boolean

  get isNotStarted(): boolean

  get hasntToken(): boolean

  get hasToken(): boolean

  /**
   * Starts the client, when the client is successfully started, onReady is executed <br/>
   * Remember to assign the token to the client, otherwise you will get a {@link NicordClientException}
   * @param onReady
   */
  start(onReady?: () => void): Promise<void>

}
