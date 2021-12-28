import InterpreterError from '../errors/InterpreterError'
import KrValue from './KrValue'

export default class KrArray extends KrValue {
  private readonly $isKrArray: boolean = true

  constructor(value: KrValue[]) {
    super(value)
  }

  get(index: number): KrValue {
    if (index < this.value.length) {
      return this.value[index]
    }

    throw new InterpreterError(
      'Undefined member at index ' +
        index +
        ' in KrArray: ' +
        this.getValue() +
        ' .'
    )
  }

  public getValue() {
    return (this.value as KrValue[]).map((value) => {
      return value.getValue()
    })
  }

  public toString(): string {
    return this.getValue().join(',')
  }

  public static isKrArray(arg: any): arg is KrArray {
    return (
      arg &&
      arg.$isKrArray &&
      typeof arg.$isKrArray === 'boolean' &&
      arg.$isKrArray === true
    )
  }
}
