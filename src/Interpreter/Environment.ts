import InterpreterError from './InterpreterError'

export default class Environment {
  enclosing: Environment | undefined
  private values: Map<string, Object> = new Map<string, Object>()

  constructor(enclosing?: Environment) {
    this.enclosing = enclosing
  }

  get(name: string): Object {
    if (this.values.has(name)) {
      return this.values.get(name) as Object
    }

    if (this.enclosing !== undefined) {
      return this.enclosing.get(name)
    }

    throw new InterpreterError('Undefined variable ' + name + '.')
  }

  assign(name: string, value: Object): void {
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

  define(name: string, value: Object): void {
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

  getAt(distance: number, name: string): Object | undefined {
    return this.ancestor(distance).values.get(name)
  }

  assignAt(distance: number, name: string, value: Object): void {
    this.ancestor(distance).values.set(name, value)
  }
}
