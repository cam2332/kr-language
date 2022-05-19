import InterpreterError from '../errors/InterpreterError'
import KrValue from './KrValue'

export default class KrEnum extends KrValue {
  private readonly $isKrEnum: boolean = true

  constructor(value: Map<string, KrValue>) {
    super(value)
  }

  public get(name: string): KrValue {
    if (this.value.has(name)) {
      return this.value.get(name)
    }

    throw new InterpreterError(
      'Undefined property ' + name + ' in KrEnum: ' + this.getValue() + ' .'
    )
  }

  public getValue(): any {
    return Array.from((this.value as Map<string, KrValue>).entries()).reduce(
      (obj, entry) => {
        obj[entry[0]] = entry[1].getValue()
        return obj
      },
      {} as any
    )
  }

  public toString(): string {
    return this.getValue()
  }

  public static isKrEnum(arg: any): arg is KrEnum {
    return (
      arg &&
      arg.$isKrEnum &&
      typeof arg.$isKrEnum === 'boolean' &&
      arg.$isKrEnum === true
    )
  }
}
