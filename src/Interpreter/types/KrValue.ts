export default class KrValue {
  private readonly $isKrValue: boolean = true
  protected value: any

  constructor(value: any) {
    this.value = value
  }

  public getValue(): any {
    return this.value
  }

  public setValue(value: any): void {
    this.value = value
  }

  public toString(): string {
    return this.getValue()
  }

  public static isKrValue(arg: any): arg is KrValue {
    return (
      arg &&
      arg.$isKrValue &&
      typeof arg.$isKrValue === 'boolean' &&
      arg.$isKrValue === true
    )
  }
}
