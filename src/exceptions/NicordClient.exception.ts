/**
 * <h1>NicordClientException</h1>
 * Thrown out in case of errors related to {@link NicordClient}
 */
export class NicordClientException extends Error {
  constructor(reason: string) {
    super(`${reason}`)
    this._reason = reason
  }

  private readonly _reason: string

  get reason(): string {
    return this._reason
  }
}
