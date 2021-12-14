import Identifier from '../AST/Identifier'
import Environment from './Environment'
import Interpreter from './Interpreter'
import InterpreterError from './errors/InterpreterError'
import KrCallable from './KrCallable'

export default class NativeKrFunction implements KrCallable {
  private readonly name: Identifier
  private readonly parameters: Identifier[] = []
  private body: (args: Object[]) => Object | undefined | void
  private readonly closure: Environment

  constructor(
    name: Identifier,
    parameters: Identifier[],
    body: (args: Object[]) => Object | undefined | void,
    closure: Environment
  ) {
    this.name = name
    this.parameters = parameters
    this.body = body
    this.closure = closure
  }

  // Override KrCallable
  arity(): number {
    return this.parameters.length
  }

  // Override KrCallable
  call(interpreter: Interpreter, args: Object[]): Object | undefined | void {
    const environment: Environment = new Environment(this.closure)
    for (let i = 0; i < this.parameters.length; i++) {
      environment.define(this.parameters[i].value, args[i])
    }

    try {
      const result = this.body(args)
      return result
    } catch (error) {
      throw new InterpreterError(
        "Unexpected error while executing native function '" +
          this.name.value +
          "'. "
      )
    }

    return
  }

  toString(): string {
    return '<native fn ' + this.name.value + '>'
  }
}
