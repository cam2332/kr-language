import InterpreterError from './errors/InterpreterError'
import KrClass from './KrClass'
import KrFunction from './KrFunction'
import NativeKrFunction from './NativeKrFunctions'

export default class KrInstance {
  private klass: KrClass
  private readonly fields: Map<string, Object> = new Map<string, Object>()

  constructor(klass: KrClass) {
    this.klass = klass
  }

  get(name: string): Object | undefined {
    if (this.fields.has(name)) {
      return this.fields.get(name)
    }

    const method: NativeKrFunction | KrFunction | undefined =
      this.klass.findMethod(name)

    if (method !== undefined) {
      return method.bind(this)
    }

    throw new InterpreterError('Undefined property ' + name + '.')
  }

  set(name: string, value: Object): void {
    this.fields.set(name, value)
  }

  toString(): string {
    return this.klass.name + ' instance'
  }
}
