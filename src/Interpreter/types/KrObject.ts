import InterpreterError from '../errors/InterpreterError'
import KrValue from './KrValue'

export default class KrObject extends KrValue {
  private readonly $isKrObject: boolean = true

  constructor(value: Map<string, KrValue>) {
    super(value)
  }

  get(name: string): KrValue {
    if (this.value.has(name)) {
      return this.value.get(name)
    }

    throw new InterpreterError(
      'Undefined property ' + name + ' in KrObject: ' + this.getValue() + ' .'
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

  public static isKrObject(arg: any): arg is KrObject {
    return (
      arg &&
      arg.$isKrObject &&
      typeof arg.$isKrObject === 'boolean' &&
      arg.$isKrObject === true
    )
  }
}
