export abstract class OriginalShadow<T> {
  private readonly _original: T

  protected constructor(original: T) {
    this._original = original
  }

  get original(): T {
    return this._original
  }
}
