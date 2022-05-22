import Position from '../types/Position'
import InterpreterError from './errors/InterpreterError'
import KrFunction from './KrFunction'
import KrInstance from './KrInstance'
import NativeKrFunction from './NativeKrFunctions'
import KrValue from './types/KrValue'

export default class Environment {
  enclosing: Environment | undefined
  private values: Map<
    string,
    KrValue | KrFunction | NativeKrFunction | KrInstance
  > = new Map<string, KrValue | KrFunction | NativeKrFunction | KrInstance>()

  constructor(enclosing?: Environment) {
    this.enclosing = enclosing
  }

  get(
    name: string,
    position?: Position
  ): KrValue | KrFunction | NativeKrFunction | KrInstance {
    if (this.values.has(name)) {
      return this.values.get(name) as
        | KrValue
        | KrFunction
        | NativeKrFunction
        | KrInstance
    }

    if (this.enclosing !== undefined) {
      return this.enclosing.get(name)
    }

    throw new InterpreterError('Undefined variable ' + name + '.', position)
  }

  assign(
    name: string,
    value: KrValue | KrFunction | NativeKrFunction | KrInstance
  ): void {
    if (this.values.has(name)) {
      this.values.set(name, value)
      return
    }

    if (this.enclosing !== undefined) {
      this.enclosing.assign(name, value)
      return
    }

    throw new InterpreterError('Undefined variable ' + name + '.')
  }

  define(
    name: string,
    value: KrValue | KrFunction | NativeKrFunction | KrInstance
  ): void {
    this.values.set(name, value)
  }

  ancestor(distance: number): Environment {
    let environment: Environment = this
    for (let i = 0; i < distance; i++) {
      if (environment.enclosing) {
        environment = environment.enclosing
      } else {
        break
      }
    }

    return environment
  }

  getAt(
    distance: number,
    name: string
  ): KrValue | KrFunction | NativeKrFunction | KrInstance | undefined {
    return this.ancestor(distance).values.get(name)
  }

  assignAt(
    distance: number,
    name: string,
    value: KrValue | KrFunction | NativeKrFunction | KrInstance
  ): void {
    this.ancestor(distance).values.set(name, value)
  }
}
