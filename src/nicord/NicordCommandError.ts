export class NicordCommandError {
  private _unpermitted: boolean = false

  get unpermitted(): boolean {
    return this._unpermitted
  }

  set unpermitted(unpermitted: boolean) {
    this._unpermitted = unpermitted
  }

}
